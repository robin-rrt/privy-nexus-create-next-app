import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import WalletList from "../components/WalletList";
import { NexusSDK } from "avail-nexus-sdk";

async function verifyToken() {
  const url = "/api/verify";
  const accessToken = await getAccessToken();
  const result = await fetch(url, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    },
  });

  return await result.json();
}

export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [nexusSdk] = useState(() => new NexusSDK());
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkPhone,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const phone = user?.phone;
  const wallet = user?.wallet;

  const googleSubject = user?.google?.subject || null;
  const twitterSubject = user?.twitter?.subject || null;
  const discordSubject = user?.discord?.subject || null;

  // Initialize Nexus SDK with Privy provider
  const initializeNexus = useCallback(async () => {
    console.log("[Nexus Init Debug] authenticated:", authenticated);
    console.log("[Nexus Init Debug] user:", user);
    console.log("[Nexus Init Debug] user.wallet:", user?.wallet);
    console.log("[Nexus Init Debug] isInitialized:", isInitialized);

    if (!authenticated || !user?.wallet?.address) {
      setInitializationError("User must be authenticated with a wallet to initialize Nexus");
      return;
    }

    if (isInitialized) {
      console.log("Nexus SDK already initialized");
      return;
    }

    setIsInitializing(true);
    setInitializationError(null);

    try {
      console.log("Initializing Nexus SDK...");
      console.log("Full user object:", user);
      console.log("User wallet:", user?.wallet);

      // Check if user has an EVM wallet
      if (!user?.wallet || user.wallet.chainType !== "ethereum") {
        setInitializationError("Please connect an EVM wallet to initialize Nexus");
        return;
      }

      // Get the Ethereum provider from Privy user
      let provider;
      try {
        // Use the new wallet-based method (not deprecated)
        if ((user?.wallet as any)?.getEthereumProvider) {
          provider = await (user?.wallet as any).getEthereumProvider();
          console.log("Provider from wallet.getEthereumProvider:", provider);
        } else {
          // Fallback to deprecated method if needed
          provider = await (user as any).getEthereumProvider?.();
          console.log("Provider from deprecated getEthereumProvider:", provider);
        }
      } catch (error) {
        console.log("getEthereumProvider failed, trying alternative methods:", error);
        
        // Try alternative methods if the first one fails
        if ((user as any).getProvider) {
          provider = await (user as any).getProvider();
        }
      }

      if (!provider) {
        console.log("Available methods on user object:", Object.getOwnPropertyNames(user));
        console.log("Available methods on user.wallet:", Object.getOwnPropertyNames(user?.wallet || {}));
        throw new Error("No Ethereum provider found. Please ensure you have connected an EVM wallet.");
      }

      console.log("Provider obtained from Privy:", provider);

      // Initialize Nexus SDK with the provider
      await nexusSdk.initialize(provider);
      console.log("Nexus SDK initialized successfully");
      
      // Set up hooks for intent and allowance management
      nexusSdk.setOnIntentHook(({ intent, allow }) => {
        console.log("Intent received:", intent);
        // For now, automatically allow all intents
        // In a real app, you'd show a UI to the user for approval
        allow();
      });

      nexusSdk.setOnAllowanceHook(async ({ sources, allow }) => {
        console.log("Allowance needed:", sources);
        // For now, automatically allow minimum allowances
        // In a real app, you'd show a UI to the user for approval
        allow(['min']);
      });

      // Set up account and chain change listeners
      nexusSdk.onAccountChanged((account) => {
        console.log("Account changed:", account);
      });

      nexusSdk.onChainChanged((chainId) => {
        console.log("Chain changed:", chainId);
      });

      setIsInitialized(true);
      console.log("Nexus SDK setup completed");
    } catch (error) {
      console.error("Failed to initialize Nexus SDK:", error);
      setInitializationError(error instanceof Error ? error.message : "Failed to initialize Nexus SDK");
    } finally {
      setIsInitializing(false);
    }
  }, [authenticated, user, isInitialized, nexusSdk]);

  // Fetch unified balances
  const fetchBalances = useCallback(async () => {
    if (!isInitialized) {
      console.log("Nexus SDK not initialized, cannot fetch balances");
      return;
    }

    setIsLoadingBalances(true);
    try {
      console.log("Fetching unified balances...");
      const unifiedBalances = await nexusSdk.getUnifiedBalances();
      console.log("Unified balances:", unifiedBalances);
      setBalances(unifiedBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setInitializationError(error instanceof Error ? error.message : "Failed to fetch balances");
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isInitialized, nexusSdk]);

  // Cleanup Nexus SDK on component unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        nexusSdk.removeAllListeners();
        nexusSdk.deinit().catch(console.error);
      }
    };
  }, [isInitialized, nexusSdk]);

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>

            {/* Nexus SDK Status Section */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Nexus SDK Status</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">
                    {isInitialized ? 'Initialized' : 'Not Initialized'}
                  </span>
                </div>
                {wallet && (
                  <span className="text-sm text-gray-600">
                    Wallet: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                )}
              </div>
              
              {!isInitialized && wallet && (
                <button
                  onClick={initializeNexus}
                  disabled={isInitializing}
                  className={`text-sm py-2 px-4 rounded-md text-white ${
                    isInitializing
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isInitializing ? 'Initializing Nexus...' : 'Initialize Nexus SDK'}
                </button>
              )}

              {initializationError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  Error: {initializationError}
                </div>
              )}

              {isInitialized && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✅ Nexus SDK is ready for cross-chain operations
                </div>
              )}

              {/* Balance Section */}
              {isInitialized && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium">Unified Balances</h3>
                    <button
                      onClick={fetchBalances}
                      disabled={isLoadingBalances}
                      className={`text-xs py-1 px-2 rounded text-white ${
                        isLoadingBalances
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isLoadingBalances ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  
                  {balances.length > 0 ? (
                    <div className="space-y-2">
                      {balances.map((balance, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{balance.symbol}</span>
                          <span className="text-sm">{balance.balance}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No balances found. Click "Refresh" to fetch balances.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-12 flex gap-4 flex-wrap">
              {googleSubject ? (
                <button
                  onClick={() => {
                    unlinkGoogle(googleSubject);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Google
                </button>
              ) : (
                <button
                  onClick={() => {
                    linkGoogle();
                  }}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                >
                  Link Google
                </button>
              )}

              {twitterSubject ? (
                <button
                  onClick={() => {
                    unlinkTwitter(twitterSubject);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Twitter
                </button>
              ) : (
                <button
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                  onClick={() => {
                    linkTwitter();
                  }}
                >
                  Link Twitter
                </button>
              )}

              {discordSubject ? (
                <button
                  onClick={() => {
                    unlinkDiscord(discordSubject);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Discord
                </button>
              ) : (
                <button
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                  onClick={() => {
                    linkDiscord();
                  }}
                >
                  Link Discord
                </button>
              )}

              {email ? (
                <button
                  onClick={() => {
                    unlinkEmail(email.address);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink email
                </button>
              ) : (
                <button
                  onClick={linkEmail}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                >
                  Connect email
                </button>
              )}
              {wallet ? (
                <button
                  onClick={() => {
                    unlinkWallet(wallet.address);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink wallet
                </button>
              ) : (
                <button
                  onClick={linkWallet}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
                >
                  Connect wallet
                </button>
              )}
              {phone ? (
                <button
                  onClick={() => {
                    unlinkPhone(phone.number);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink phone
                </button>
              ) : (
                <button
                  onClick={linkPhone}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
                >
                  Connect phone
                </button>
              )}

              <button
                onClick={() => verifyToken().then(setVerifyResult)}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
              >
                Verify token on server
              </button>

              {Boolean(verifyResult) && (
                <details className="w-full">
                  <summary className="mt-6 font-bold uppercase text-sm text-gray-600">
                    Server verify result
                  </summary>
                  <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
                    {JSON.stringify(verifyResult, null, 2)}
                  </pre>
                </details>
              )}
            </div>
            <div className="space-y-6 max-w-4xl mt-6">
              <h2 className="text-xl font-bold">Your Wallet</h2>
              <WalletList />
            </div>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
    </>
  );
}
