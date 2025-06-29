import React, { useState } from "react";
import { AAVE_V3_POOL_ADDRESSES, AAVE_V3_POOL_ABI, USDC_TOKEN_ADDRESSES } from "../../lib/nexus-constants";

interface BridgeExecuteSectionProps {
  supportedTokens: string[];
  supportedChains: any[];
  selectedWalletAddress: string;
  onSimulate: (params: {
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
  onExecute: (params: {
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
  isSimulating: boolean;
  isExecuting: boolean;
  simulationResult: any;
  executeResult: any;
  error: string | null;
  onClearSimulation: () => void;
  onClearExecute: () => void;
}

export function BridgeExecuteSection({
  supportedTokens,
  supportedChains,
  selectedWalletAddress,
  onSimulate,
  onExecute,
  isSimulating,
  isExecuting,
  simulationResult,
  executeResult,
  error,
  onClearSimulation,
  onClearExecute
}: BridgeExecuteSectionProps) {
  const [amount, setAmount] = useState("");
  const [chainId, setChainId] = useState(8453); // Default to Base
  const [enableExecute, setEnableExecute] = useState(true);

  const handleSimulate = async () => {
    const params = {
      toChainId: chainId,
      token: "USDC",
      amount: parseFloat(amount),
      recipient: selectedWalletAddress as `0x${string}`,
      execute: enableExecute ? {
        contractAddress: AAVE_V3_POOL_ADDRESSES[chainId as keyof typeof AAVE_V3_POOL_ADDRESSES],
        contractAbi: AAVE_V3_POOL_ABI,
        functionName: "supply",
        functionParams: [
          USDC_TOKEN_ADDRESSES[chainId as keyof typeof USDC_TOKEN_ADDRESSES], // USDC token address
          (parseFloat(amount) * 1e6).toString(), // Amount in wei (USDC has 6 decimals)
          selectedWalletAddress, // onBehalfOf
          0 // referralCode
        ],
        tokenApproval: {
          token: "USDC" as any,
          amount: (parseFloat(amount) * 1e6).toString()
        }
      } : undefined
    };

    console.log("🔍 Simulate Bridge & Execute Params:", JSON.stringify(params, null, 2));
    await onSimulate(params);
  };

  const handleExecute = async () => {
    const params = {
      toChainId: chainId,
      token: "USDC",
      amount: parseFloat(amount),
      recipient: selectedWalletAddress as `0x${string}`,
      execute: enableExecute ? {
        contractAddress: AAVE_V3_POOL_ADDRESSES[chainId as keyof typeof AAVE_V3_POOL_ADDRESSES],
        contractAbi: AAVE_V3_POOL_ABI,
        functionName: "supply",
        functionParams: [
          USDC_TOKEN_ADDRESSES[chainId as keyof typeof USDC_TOKEN_ADDRESSES], // USDC token address
          (parseFloat(amount) * 1e6).toString(), // Amount in wei (USDC has 6 decimals)
          selectedWalletAddress, // onBehalfOf
          0 // referralCode
        ],
        tokenApproval: {
          token: "USDC" as any,
          amount: (parseFloat(amount) * 1e6).toString()
        }
      } : undefined
    };

    console.log("🚀 Execute Bridge & Execute Params:", JSON.stringify(params, null, 2));
    await onExecute(params);
  };

  return (
    <div className="mt-8 max-w-xl w-full">
      <h2 className="text-lg font-semibold mb-4">Bridge & Execute</h2>
      <div className="text-sm text-gray-600 mb-4">
        Bridge USDC and deposit to Aave v3 on Base
      </div>
      
      <div className="flex flex-col gap-3">
        <input
          type="text"
          className="rounded border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
          value={selectedWalletAddress || ""}
          disabled
          readOnly
        />
        <input
          type="number"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="USDC Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          value={chainId}
          onChange={e => setChainId(Number(e.target.value))}
        >
          {supportedChains
            .filter(chain => AAVE_V3_POOL_ADDRESSES[chain.id as keyof typeof AAVE_V3_POOL_ADDRESSES])
            .map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
        </select>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enable-execute"
            checked={enableExecute}
            onChange={e => setEnableExecute(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="enable-execute" className="text-sm">
            Execute: Deposit to Aave v3 on Base after bridge
          </label>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded disabled:opacity-60"
            onClick={handleSimulate}
            disabled={isSimulating || !amount}
          >
            {isSimulating ? "Simulating..." : "Simulate"}
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded disabled:opacity-60"
            onClick={handleExecute}
            disabled={isExecuting || !amount}
          >
            {isExecuting ? "Executing..." : "Bridge & Execute"}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 border border-red-200 rounded p-2 text-xs text-red-700">{error}</div>
        )}
        
        {simulationResult && (
          <div className="mt-4 border rounded p-3 relative text-xs">
            <button
              className="absolute top-2 right-2 text-xs text-gray-500 hover:underline"
              onClick={onClearSimulation}
            >
              Clear
            </button>
            <div className="font-semibold mb-2">Simulation Result:</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(simulationResult, null, 2)}</pre>
          </div>
        )}
        
        {executeResult && (
          <div className="mt-4 border rounded p-3 relative text-xs">
            <button
              className="absolute top-2 right-2 text-xs text-gray-500 hover:underline"
              onClick={onClearExecute}
            >
              Clear
            </button>
            <div className="font-semibold mb-2">Execute Result:</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(executeResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 