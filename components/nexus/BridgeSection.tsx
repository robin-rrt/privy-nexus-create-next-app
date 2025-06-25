import React, { useState } from "react";

interface BridgeSectionProps {
  supportedTokens: string[];
  supportedChains: any[];
  selectedWalletAddress: string;
  onSimulate: (params: { token: string; amount: number; chainId: number }) => Promise<any>;
  onBridge: (params: { token: string; amount: number; chainId: number }) => Promise<any>;
  isSimulating: boolean;
  isBridging: boolean;
  simulationResult: any;
  bridgeResult: any;
  error: string | null;
  onClearSimulation: () => void;
  onClearBridge: () => void;
}

export function BridgeSection({
  supportedTokens,
  supportedChains,
  selectedWalletAddress,
  onSimulate,
  onBridge,
  isSimulating,
  isBridging,
  simulationResult,
  bridgeResult,
  error,
  onClearSimulation,
  onClearBridge
}: BridgeSectionProps) {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("ETH");
  const [chainId, setChainId] = useState(10);

  const handleSimulate = async () => {
    await onSimulate({
      token,
      amount: parseFloat(amount),
      chainId
    });
  };

  const handleBridge = async () => {
    await onBridge({
      token,
      amount: parseFloat(amount),
      chainId
    });
  };

  return (
    <div className="mt-8 max-w-xl w-full">
      <h2 className="text-lg font-semibold mb-4">Bridge</h2>
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
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          step="any"
        />
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          value={token}
          onChange={e => setToken(e.target.value)}
        >
          {supportedTokens.map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          value={chainId}
          onChange={e => setChainId(Number(e.target.value))}
        >
          {supportedChains.map(chain => (
            <option key={chain.id} value={chain.id}>{chain.name}</option>
          ))}
        </select>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded disabled:opacity-60"
            onClick={handleSimulate}
            disabled={isSimulating || !amount}
          >
            {isSimulating ? "Simulating..." : "Simulate Bridge"}
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded disabled:opacity-60"
            onClick={handleBridge}
            disabled={isBridging || !amount}
          >
            {isBridging ? "Bridging..." : "Bridge"}
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
            <pre className="whitespace-pre-wrap">{JSON.stringify(simulationResult, null, 2)}</pre>
          </div>
        )}
        {bridgeResult && (
          <div className="mt-4 border rounded p-3 relative text-xs">
            <button
              className="absolute top-2 right-2 text-xs text-gray-500 hover:underline"
              onClick={onClearBridge}
            >
              Clear
            </button>
            <pre className="whitespace-pre-wrap">{JSON.stringify(bridgeResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 