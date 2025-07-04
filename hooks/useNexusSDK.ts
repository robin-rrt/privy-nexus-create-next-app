import { useCallback, useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { nexusSDKService, NexusSDKInstance } from "../lib/nexus-sdk";
import { SUPPORTED_TOKENS, SUPPORTED_CHAINS } from "../lib/nexus-constants";
import type { NexusNetwork } from "@avail-project/nexus";

export interface UseNexusSDKReturn {
  // SDK Status
  sdkStatus: NexusSDKInstance;
  
  // Balances
  balances: any[];
  isLoadingBalances: boolean;
  
  // Actions
  initializeNexus: (selectedWalletIndex: number, network: NexusNetwork) => Promise<void>;
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
  
  // Bridge and Execute operations
  simulateBridgeAndExecute: (params: {
    toChainId: number;
    token: string;
    amount: number | string;
    recipient?: string;
    execute?: {
      contractAddress: string;
      contractAbi: any;
      functionName: string;
      functionParams: readonly unknown[];
      value?: string;
      tokenApproval: {
        token: string;
        amount: string;
      };
    };
  }) => Promise<any>;
  bridgeAndExecute: (params: {
    toChainId: number;
    token: string;
    amount: number | string;
    recipient?: string;
    execute?: {
      contractAddress: string;
      contractAbi: any;
      functionName: string;
      functionParams: readonly unknown[];
      value?: string;
      tokenApproval: {
        token: string;
        amount: string;
      };
    };
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
    error: null,
    network: 'mainnet'
  });
  const [balances, setBalances] = useState<any[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  const { wallets } = useWallets();

  // Load SDK on mount with dynamic import
  useEffect(() => {
    const loadSDK = async () => {
      try {
        const sdk = await nexusSDKService.loadSDK('mainnet');
        setSdkStatus(nexusSDKService.getStatus());
      } catch (error) {
        console.error("Failed to load SDK on mount:", error);
        setSdkStatus(prev => ({ ...prev, error: error instanceof Error ? error.message : "Failed to load SDK" }));
      }
    };
    loadSDK();
  }, []);

  // Initialize Nexus SDK with Privy provider
  const initializeNexus = useCallback(async (selectedWalletIndex: number, network: NexusNetwork) => {
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

      // Load SDK with selected network
      await nexusSDKService.loadSDK(network);
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
      const sdk = await nexusSDKService.loadSDK('mainnet');
      setSdkStatus({
        sdk: sdk,
        isInitialized: false,
        isInitializing: false,
        error: null,
        network: 'mainnet'
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

  // Bridge and Execute operations
  const simulateBridgeAndExecute = useCallback(async (params: {
    toChainId: number;
    token: string;
    amount: number | string;
    recipient?: string;
    execute?: {
      contractAddress: string;
      contractAbi: any;
      functionName: string;
      functionParams: readonly unknown[];
      value?: string;
      tokenApproval: {
        token: string;
        amount: string;
      };
    };
  }) => {
    return await nexusSDKService.simulateBridgeAndExecute({
      toChainId: params.toChainId as any,
      token: params.token as any,
      amount: params.amount,
      recipient: params.recipient as `0x${string}`,
      execute: params.execute ? {
        ...params.execute,
        tokenApproval: {
          ...params.execute.tokenApproval,
          token: params.execute.tokenApproval.token as any
        }
      } : undefined
    });
  }, []);

  const bridgeAndExecute = useCallback(async (params: {
    toChainId: number;
    token: string;
    amount: number | string;
    recipient?: string;
    execute?: {
      contractAddress: string;
      contractAbi: any;
      functionName: string;
      functionParams: readonly unknown[];
      value?: string;
      tokenApproval: {
        token: string;
        amount: string;
      };
    };
  }) => {
    return await nexusSDKService.bridgeAndExecute({
      toChainId: params.toChainId as any,
      token: params.token as any,
      amount: params.amount,
      recipient: params.recipient as `0x${string}`,
      execute: params.execute ? {
        ...params.execute,
        tokenApproval: {
          ...params.execute.tokenApproval,
          token: params.execute.tokenApproval.token as any
        }
      } : undefined
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
    simulateBridgeAndExecute,
    bridgeAndExecute,
    supportedTokens: [...SUPPORTED_TOKENS],
    supportedChains: SUPPORTED_CHAINS
  };
} 