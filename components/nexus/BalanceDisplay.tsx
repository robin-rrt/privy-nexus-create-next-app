import React from "react";

interface BalanceDisplayProps {
  balances: any[];
  isLoadingBalances: boolean;
  onRefresh: () => void;
}

export function BalanceDisplay({
  balances,
  isLoadingBalances,
  onRefresh
}: BalanceDisplayProps) {
  // Calculate total unified balance in USD
  const totalBalanceUSD = balances.reduce((total, balance) => {
    if (balance.balanceInFiat) {
      return total + parseFloat(balance.balanceInFiat);
    }
    return total;
  }, 0);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-md font-medium">Unified Balances</h3>
          {totalBalanceUSD > 0 && (
            <span className="text-sm text-gray-600 font-medium">
              (${totalBalanceUSD.toFixed(2)})
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
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
        <div className="space-y-3">
          {balances.map((balance, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              {/* Token Header */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{balance.symbol}</span>
                  {balance.balanceInFiat && (
                    <span className="text-xs text-gray-500">
                      (${parseFloat(balance.balanceInFiat).toFixed(2)})
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{balance.balance}</span>
              </div>
              
              {/* Chain Breakdown */}
              {balance.breakdown && balance.breakdown.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                    View chain breakdown ({balance.breakdown.filter((chainBalance: any) => 
                      parseFloat(chainBalance.balance) > 0
                    ).length} chains with balance)
                  </summary>
                  <div className="mt-2 space-y-1">
                    {balance.breakdown
                      .filter((chainBalance: any) => parseFloat(chainBalance.balance) > 0)
                      .map((chainBalance: any, chainIndex: number) => (
                        <div key={chainIndex} className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{chainBalance.chain.name}</span>
                            <span className="text-gray-500">({chainBalance.chain.id})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{chainBalance.balance}</div>
                            {chainBalance.balanceInFiat && (
                              <div className="text-gray-500 text-xs">
                                ${parseFloat(chainBalance.balanceInFiat).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          No balances found. Click "Refresh" to fetch balances.
        </div>
      )}
    </div>
  );
} 