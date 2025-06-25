import { useCallback, useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { nexusSDKService, NexusSDKInstance } from "../lib/nexus-sdk";
import { SUPPORTED_TOKENS, SUPPORTED_CHAINS } from "../lib/nexus-constants";

export interface UseNexusSDKReturn {
  // SDK Status
  sdkStatus: NexusSDKInstance;
  
  // Balances
  balances: any[];
  isLoadingBalances: boolean;
  
  // Actions
  initializeNexus: (selectedWalletIndex: number) => Promise<void>;
  fetchBalances: () => Promise<void>;
  killNexus: () => Promise<void>;
  
  // Transfer operations
  simulateTransfer: (params: {
    token: string;
    amount: number;
    chainId: number;
    recipient: string;
  }) => Promise<any>;
  transfer: (params: {
    token: string;
    amount: number;
    chainId: number;
    recipient: string;
  }) => Promise<any>;
  
  // Bridge operations
  simulateBridge: (params: {
    token: string;
    amount: number;
    chainId: number;
  }) => Promise<any>;
  bridge: (params: {
    token: string;
    amount: number;
    chainId: number;
  }) => Promise<any>;
  
  // Constants
  supportedTokens: string[];
  supportedChains: any[];
}

export function useNexusSDK(): UseNexusSDKReturn {
  const [sdkStatus, setSdkStatus] = useState<NexusSDKInstance>({
    sdk: null,
    isInitialized: false,
    isInitializing: false,
    error: null
  });
  const [balances, setBalances] = useState<any[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  const { wallets } = useWallets();

  // Load SDK on mount
  useEffect(() => {
    const loadSDK = async () => {
      const sdk = await nexusSDKService.loadSDK();
      setSdkStatus(nexusSDKService.getStatus());
    };
    loadSDK();
  }, []);

  // Initialize Nexus SDK with Privy provider
  const initializeNexus = useCallback(async (selectedWalletIndex: number) => {
    try {
      const selectedWallet = wallets[selectedWalletIndex];
      
      if (!selectedWallet) {
        throw new Error("No wallet selected");
      }

      // Get the Ethereum provider from the selected wallet
      let provider;
      try {
        provider = await selectedWallet.getEthereumProvider();
        console.log("Provider from selected wallet:", provider);
      } catch (error) {
        console.log("getEthereumProvider failed, trying alternative methods:", error);
        
        // Fallback to user wallet method
        if ((selectedWallet as any)?.getEthereumProvider) {
          provider = await (selectedWallet as any).getEthereumProvider();
          console.log("Provider from selectedWallet.getEthereumProvider:", provider);
        } else {
          // Last resort fallback
          provider = await (selectedWallet as any).getEthereumProvider?.();
          console.log("Provider from deprecated getEthereumProvider:", provider);
        }
      }

      if (!provider) {
        throw new Error("No Ethereum provider found. Please ensure you have connected an EVM wallet.");
      }

      const success = await nexusSDKService.initialize(provider);
      setSdkStatus(nexusSDKService.getStatus());
      
      if (success) {
        // Auto-fetch balances after initialization
        setIsLoadingBalances(true);
        try {
          const unifiedBalances = await nexusSDKService.getUnifiedBalances();
          setBalances(unifiedBalances);
        } catch (balanceError) {
          console.error("Failed to fetch balances:", balanceError);
          setSdkStatus(prev => ({ ...prev, error: balanceError instanceof Error ? balanceError.message : "Failed to fetch balances" }));
        } finally {
          setIsLoadingBalances(false);
        }
      }
    } catch (error) {
      console.error("Failed to initialize Nexus:", error);
      // Update the SDK status to reflect the error
      setSdkStatus(nexusSDKService.getStatus());
      // Re-throw the error so the calling component can handle it
      throw error;
    }
  }, [wallets]);

  // Fetch unified balances
  const fetchBalances = useCallback(async () => {
    setIsLoadingBalances(true);
    try {
      const unifiedBalances = await nexusSDKService.getUnifiedBalances();
      setBalances(unifiedBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setSdkStatus(prev => ({ ...prev, error: error instanceof Error ? error.message : "Failed to fetch balances" }));
    } finally {
      setIsLoadingBalances(false);
    }
  }, []);

  // Kill Nexus SDK
  const killNexus = useCallback(async () => {
    try {
      await nexusSDKService.cleanup();
      // Reset all state
      setBalances([]);
      setIsLoadingBalances(false);
      
      // Reload the SDK so the Initialize button can be shown again
      const sdk = await nexusSDKService.loadSDK();
      setSdkStatus({
        sdk: sdk,
        isInitialized: false,
        isInitializing: false,
        error: null
      });
    } catch (error) {
      console.error("Failed to kill Nexus:", error);
    }
  }, []);

  // Transfer operations
  const simulateTransfer = useCallback(async (params: {
    token: string;
    amount: number;
    chainId: number;
    recipient: string;
  }) => {
    return await nexusSDKService.simulateTransfer({
      token: params.token as any,
      amount: params.amount,
      chainId: params.chainId as any,
      recipient: params.recipient as `0x${string}`
    });
  }, []);

  const transfer = useCallback(async (params: {
    token: string;
    amount: number;
    chainId: number;
    recipient: string;
  }) => {
    return await nexusSDKService.transfer({
      token: params.token as any,
      amount: params.amount,
      chainId: params.chainId as any,
      recipient: params.recipient as `0x${string}`
    });
  }, []);

  // Bridge operations
  const simulateBridge = useCallback(async (params: {
    token: string;
    amount: number;
    chainId: number;
  }) => {
    return await nexusSDKService.simulateBridge({
      token: params.token as any,
      amount: params.amount,
      chainId: params.chainId as any
    });
  }, []);

  const bridge = useCallback(async (params: {
    token: string;
    amount: number;
    chainId: number;
  }) => {
    return await nexusSDKService.bridge({
      token: params.token as any,
      amount: params.amount,
      chainId: params.chainId as any
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nexusSDKService.cleanup();
    };
  }, []);

  return {
    sdkStatus,
    balances,
    isLoadingBalances,
    initializeNexus,
    fetchBalances,
    killNexus,
    simulateTransfer,
    transfer,
    simulateBridge,
    bridge,
    supportedTokens: [...SUPPORTED_TOKENS],
    supportedChains: SUPPORTED_CHAINS
  };
} 