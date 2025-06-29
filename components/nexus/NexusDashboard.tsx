import React, { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { useNexusSDK } from "../../hooks/useNexusSDK";
import { NexusStatus } from "./NexusStatus";
import type { NexusNetwork } from "avail-nexus-sdk";

interface NexusDashboardProps {
  user: any;
}

export function NexusDashboard({ user }: NexusDashboardProps) {
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [bridgeExecuteError, setBridgeExecuteError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [bridgeSimulationResult, setBridgeSimulationResult] = useState<any>(null);
  const [bridgeResult, setBridgeResult] = useState<any>(null);
  const [bridgeExecuteSimulationResult, setBridgeExecuteSimulationResult] = useState<any>(null);
  const [bridgeExecuteResult, setBridgeExecuteResult] = useState<any>(null);
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSimulatingBridge, setIsSimulatingBridge] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [isSimulatingBridgeExecute, setIsSimulatingBridgeExecute] = useState(false);
  const [isExecutingBridgeExecute, setIsExecutingBridgeExecute] = useState(false);

  const { wallets } = useWallets();
  const selectedWallet = wallets[selectedWalletIndex];

  const {
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
    supportedTokens,
    supportedChains
  } = useNexusSDK();

  const handleInitialize = async (network: NexusNetwork) => {
    try {
      await initializeNexus(selectedWalletIndex, network);
    } catch (error) {
      console.error("Failed to initialize Nexus:", error);
      // The error is already handled in the SDK service and hook
      // The UI will automatically show the error message from the SDK status
    }
  };

  const handleSimulateTransfer = async (params: {
    token: string;
    amount: number;
    chainId: number;
    recipient: string;
  }) => {
    setIsSimulatingTransfer(true);
    setSimulationResult(null);
    setTransferError(null);
    try {
      const result = await simulateTransfer(params);
      setSimulationResult(result);
    } catch (err: any) {
      setTransferError(err.message || "Simulation failed");
    } finally {
      setIsSimulatingTransfer(false);
    }
  };

  const handleTransfer = async (params: {
    token: string;
    amount: number;
    chainId: number;
    recipient: string;
  }) => {
    setIsTransferring(true);
    setTransferResult(null);
    setTransferError(null);
    try {
      const result = await transfer(params);
      setTransferResult(result);
    } catch (err: any) {
      setTransferError(err.message || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSimulateBridge = async (params: {
    token: string;
    amount: number;
    chainId: number;
  }) => {
    setIsSimulatingBridge(true);
    setBridgeSimulationResult(null);
    setBridgeError(null);
    try {
      const result = await simulateBridge(params);
      setBridgeSimulationResult(result);
    } catch (err: any) {
      setBridgeError(err.message || "Simulation failed");
    } finally {
      setIsSimulatingBridge(false);
    }
  };

  const handleBridge = async (params: {
    token: string;
    amount: number;
    chainId: number;
  }) => {
    setIsBridging(true);
    setBridgeResult(null);
    setBridgeError(null);
    try {
      const result = await bridge(params);
      setBridgeResult(result);
    } catch (err: any) {
      setBridgeError(err.message || "Bridge failed");
    } finally {
      setIsBridging(false);
    }
  };

  const handleSimulateBridgeExecute = async (params: {
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
    setIsSimulatingBridgeExecute(true);
    setBridgeExecuteSimulationResult(null);
    setBridgeExecuteError(null);
    try {
      const result = await simulateBridgeAndExecute(params);
      setBridgeExecuteSimulationResult(result);
    } catch (err: any) {
      setBridgeExecuteError(err.message || "Simulation failed");
    } finally {
      setIsSimulatingBridgeExecute(false);
    }
  };

  const handleBridgeExecute = async (params: {
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
    setIsExecutingBridgeExecute(true);
    setBridgeExecuteResult(null);
    setBridgeExecuteError(null);
    try {
      const result = await bridgeAndExecute(params);
      setBridgeExecuteResult(result);
    } catch (err: any) {
      setBridgeExecuteError(err.message || "Bridge & Execute failed");
    } finally {
      setIsExecutingBridgeExecute(false);
    }
  };

  const handleKillNexus = async () => {
    try {
      await killNexus();
      // Reset all local state
      setTransferError(null);
      setBridgeError(null);
      setBridgeExecuteError(null);
      setSimulationResult(null);
      setTransferResult(null);
      setBridgeSimulationResult(null);
      setBridgeResult(null);
      setBridgeExecuteSimulationResult(null);
      setBridgeExecuteResult(null);
      setIsSimulatingTransfer(false);
      setIsTransferring(false);
      setIsSimulatingBridge(false);
      setIsBridging(false);
      setIsSimulatingBridgeExecute(false);
      setIsExecutingBridgeExecute(false);
    } catch (error) {
      console.error("Failed to kill Nexus:", error);
    }
  };

  return (
    <NexusStatus
      sdkStatus={sdkStatus}
      selectedWalletIndex={selectedWalletIndex}
      onWalletChange={setSelectedWalletIndex}
      onInitialize={handleInitialize}
      onKillNexus={handleKillNexus}
      user={user}
      // Balance props
      balances={balances}
      isLoadingBalances={isLoadingBalances}
      onRefresh={fetchBalances}
      // Transfer props
      supportedTokens={supportedTokens}
      supportedChains={supportedChains}
      onSimulateTransfer={handleSimulateTransfer}
      onTransfer={handleTransfer}
      isSimulatingTransfer={isSimulatingTransfer}
      isTransferring={isTransferring}
      simulationResult={simulationResult}
      transferResult={transferResult}
      transferError={transferError}
      onClearSimulation={() => setSimulationResult(null)}
      onClearTransfer={() => setTransferResult(null)}
      // Bridge props
      onSimulateBridge={handleSimulateBridge}
      onBridge={handleBridge}
      isSimulatingBridge={isSimulatingBridge}
      isBridging={isBridging}
      bridgeSimulationResult={bridgeSimulationResult}
      bridgeResult={bridgeResult}
      bridgeError={bridgeError}
      onClearBridgeSimulation={() => setBridgeSimulationResult(null)}
      onClearBridge={() => setBridgeResult(null)}
      // Bridge & Execute props
      onSimulateBridgeExecute={handleSimulateBridgeExecute}
      onBridgeExecute={handleBridgeExecute}
      isSimulatingBridgeExecute={isSimulatingBridgeExecute}
      isExecutingBridgeExecute={isExecutingBridgeExecute}
      bridgeExecuteSimulationResult={bridgeExecuteSimulationResult}
      bridgeExecuteResult={bridgeExecuteResult}
      bridgeExecuteError={bridgeExecuteError}
      onClearBridgeExecuteSimulation={() => setBridgeExecuteSimulationResult(null)}
      onClearBridgeExecute={() => setBridgeExecuteResult(null)}
    />
  );
} 