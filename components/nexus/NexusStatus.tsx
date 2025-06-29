import React, { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { NexusSDKInstance } from "../../lib/nexus-sdk";
import { BalanceDisplay } from "./BalanceDisplay";
import { TransferSection } from "./TransferSection";
import { BridgeSection } from "./BridgeSection";
import { BridgeExecuteSection } from "./BridgeExecuteSection";
import type { NexusNetwork } from "avail-nexus-sdk";

interface NexusStatusProps {
  sdkStatus: NexusSDKInstance;
  selectedWalletIndex: number;
  onWalletChange: (index: number) => void;
  onInitialize: (network: NexusNetwork) => void;
  onKillNexus: () => void;
  user: any;
  // Balance props
  balances: any[];
  isLoadingBalances: boolean;
  onRefresh: () => void;
  // Transfer props
  supportedTokens: string[];
  supportedChains: any[];
  onSimulateTransfer: (params: { token: string; amount: number; chainId: number; recipient: string }) => Promise<any>;
  onTransfer: (params: { token: string; amount: number; chainId: number; recipient: string }) => Promise<any>;
  isSimulatingTransfer: boolean;
  isTransferring: boolean;
  simulationResult: any;
  transferResult: any;
  transferError: string | null;
  onClearSimulation: () => void;
  onClearTransfer: () => void;
  // Bridge props
  onSimulateBridge: (params: { token: string; amount: number; chainId: number }) => Promise<any>;
  onBridge: (params: { token: string; amount: number; chainId: number }) => Promise<any>;
  isSimulatingBridge: boolean;
  isBridging: boolean;
  bridgeSimulationResult: any;
  bridgeResult: any;
  bridgeError: string | null;
  onClearBridgeSimulation: () => void;
  onClearBridge: () => void;
  // Bridge & Execute props
  onSimulateBridgeExecute: (params: {
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
  onBridgeExecute: (params: {
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
  isSimulatingBridgeExecute: boolean;
  isExecutingBridgeExecute: boolean;
  bridgeExecuteSimulationResult: any;
  bridgeExecuteResult: any;
  bridgeExecuteError: string | null;
  onClearBridgeExecuteSimulation: () => void;
  onClearBridgeExecute: () => void;
}

export function NexusStatus({
  sdkStatus,
  selectedWalletIndex,
  onWalletChange,
  onInitialize,
  onKillNexus,
  user,
  // Balance props
  balances,
  isLoadingBalances,
  onRefresh,
  // Transfer props
  supportedTokens,
  supportedChains,
  onSimulateTransfer,
  onTransfer,
  isSimulatingTransfer,
  isTransferring,
  simulationResult,
  transferResult,
  transferError,
  onClearSimulation,
  onClearTransfer,
  // Bridge props
  onSimulateBridge,
  onBridge,
  isSimulatingBridge,
  isBridging,
  bridgeSimulationResult,
  bridgeResult,
  bridgeError,
  onClearBridgeSimulation,
  onClearBridge,
  // Bridge & Execute props
  onSimulateBridgeExecute,
  onBridgeExecute,
  isSimulatingBridgeExecute,
  isExecutingBridgeExecute,
  bridgeExecuteSimulationResult,
  bridgeExecuteResult,
  bridgeExecuteError,
  onClearBridgeExecuteSimulation,
  onClearBridgeExecute
}: NexusStatusProps) {
  const { wallets } = useWallets();
  const selectedWallet = wallets[selectedWalletIndex];
  const [selectedNetwork, setSelectedNetwork] = useState<NexusNetwork>('mainnet');

  const handleInitialize = () => {
    onInitialize(selectedNetwork);
  };

  const isTestnet = sdkStatus.network === 'testnet';

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Nexus SDK Status</h2>
      
      {/* Network Selector */}
      <div className="mb-4">
        <label htmlFor="network-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Network
        </label>
        <select
          id="network-select"
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork(e.target.value as NexusNetwork)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={sdkStatus.isInitialized}
        >
          <option value="mainnet">Mainnet</option>
          <option value="testnet">Testnet</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Current: {sdkStatus.network} {isTestnet && "(Bridge & Execute disabled)"}
        </p>
      </div>
      
      {/* Wallet Selector */}
      {wallets && wallets.length > 0 && (
        <div className="mb-4">
          <label htmlFor="wallet-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Wallet for Nexus
          </label>
          <select
            id="wallet-select"
            value={selectedWalletIndex}
            onChange={(e) => onWalletChange(Number(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={sdkStatus.isInitialized}
          >
            {wallets.map((wallet, index) => (
              <option key={index} value={index}>
                {wallet.address ? 
                  `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} (${(wallet as any).chainType || 'Unknown'})` : 
                  `Wallet ${index + 1} (${(wallet as any).chainType || 'Unknown'})`
                }
              </option>
            ))}
          </select>
          {selectedWallet && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {selectedWallet.address ? 
                `${selectedWallet.address.slice(0, 6)}...${selectedWallet.address.slice(-4)}` : 
                `Wallet ${selectedWalletIndex + 1}`
              }
            </p>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            sdkStatus.isInitialized ? 'bg-green-500' : 
            sdkStatus.sdk ? 'bg-yellow-500' : 'bg-gray-300'
          }`}></div>
          <span className="text-sm">
            {sdkStatus.isInitialized ? 'Initialized' : 
             sdkStatus.sdk ? 'Ready to Initialize' : 'Loading SDK...'}
          </span>
        </div>
        {user?.wallet && (
          <span className="text-sm text-gray-600">
            Wallet: {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
          </span>
        )}
      </div>
      
      {!sdkStatus.isInitialized && user?.wallet && sdkStatus.sdk && selectedWallet && (
        <button
          onClick={handleInitialize}
          disabled={sdkStatus.isInitializing}
          className={`text-sm py-2 px-4 rounded-md text-white ${
            sdkStatus.isInitializing
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {sdkStatus.isInitializing ? 'Initializing Nexus...' : `Initialize Nexus SDK (${selectedNetwork})`}
        </button>
      )}

      {!sdkStatus.sdk && (
        <div className="text-sm text-gray-500">
          Loading Nexus SDK...
        </div>
      )}

      {sdkStatus.error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
          <div className="text-red-700 mb-2">
            <strong>Error:</strong> {sdkStatus.error}
          </div>
          {sdkStatus.error.includes("rejected") || sdkStatus.error.includes("cancelled") || sdkStatus.error.includes("failed") ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleInitialize}
                disabled={sdkStatus.isInitializing}
                className={`text-xs py-1 px-3 rounded text-white ${
                  sdkStatus.isInitializing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {sdkStatus.isInitializing ? 'Retrying...' : 'Retry'}
              </button>
              <span className="text-xs text-red-600">
                Make sure to approve the wallet connection prompt
              </span>
            </div>
          ) : null}
        </div>
      )}

      {sdkStatus.isInitialized && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          ✅ Nexus SDK is ready for cross-chain operations ({sdkStatus.network})
        </div>
      )}

      {/* Testnet Warning */}
      {isTestnet && sdkStatus.isInitialized && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <div className="text-yellow-700">
            <strong>⚠️ Testnet Mode:</strong> Bridge & Execute section is disabled in testnet mode. Only Bridge and Transfer operations are available.
          </div>
        </div>
      )}

      {/* Balance Section */}
      {sdkStatus.isInitialized && (
        <BalanceDisplay
          balances={balances}
          isLoadingBalances={isLoadingBalances}
          onRefresh={onRefresh}
        />
      )}

      {/* Transfer Section */}
      {sdkStatus.isInitialized && (
        <TransferSection
          supportedTokens={supportedTokens}
          supportedChains={supportedChains}
          onSimulate={onSimulateTransfer}
          onTransfer={onTransfer}
          isSimulating={isSimulatingTransfer}
          isTransferring={isTransferring}
          simulationResult={simulationResult}
          transferResult={transferResult}
          error={transferError}
          onClearSimulation={onClearSimulation}
          onClearTransfer={onClearTransfer}
        />
      )}

      {/* Bridge Section */}
      {sdkStatus.isInitialized && (
        <BridgeSection
          supportedTokens={supportedTokens}
          supportedChains={supportedChains}
          selectedWalletAddress={selectedWallet?.address || ""}
          onSimulate={onSimulateBridge}
          onBridge={onBridge}
          isSimulating={isSimulatingBridge}
          isBridging={isBridging}
          simulationResult={bridgeSimulationResult}
          bridgeResult={bridgeResult}
          error={bridgeError}
          onClearSimulation={onClearBridgeSimulation}
          onClearBridge={onClearBridge}
        />
      )}

      {/* Bridge Execute Section - Only show in mainnet */}
      {sdkStatus.isInitialized && !isTestnet && (
        <BridgeExecuteSection
          supportedTokens={supportedTokens}
          supportedChains={supportedChains}
          selectedWalletAddress={selectedWallet?.address || ""}
          onSimulate={onSimulateBridgeExecute}
          onExecute={onBridgeExecute}
          isSimulating={isSimulatingBridgeExecute}
          isExecuting={isExecutingBridgeExecute}
          simulationResult={bridgeExecuteSimulationResult}
          executeResult={bridgeExecuteResult}
          error={bridgeExecuteError}
          onClearSimulation={onClearBridgeExecuteSimulation}
          onClearExecute={onClearBridgeExecute}
        />
      )}

      {sdkStatus.isInitialized && (
        <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
          <button
            onClick={onKillNexus}
            className="text-sm py-2 px-4 rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Kill Nexus
          </button>
        </div>
      )}
    </div>
  );
} 