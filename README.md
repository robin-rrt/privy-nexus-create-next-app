# Privy Auth + Avail Nexus SDK `create-next-app` Integration 

This project demonstrates a complete integration of [**Privy Auth**](https://www.privy.io/) with the [**Avail Nexus SDK**](https://github.com/availproject/nexus) in a [NextJS](https://nextjs.org/) application. It provides a full-stack solution for cross-chain token transfers and bridging using Privy's wallet infrastructure.

## 🚀 Nexus SDK Integration

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **EVM Wallet**: MetaMask, WalletConnect, or any EVM-compatible wallet
- **Privy Account**: Set up at [Privy Dashboard](https://console.privy.io/)

### SDK Versions
- **Avail Nexus SDK**: `avail-nexus-sdk@^0.0.4-dev.6`
- **Privy Auth**: `@privy-io/react-auth@^2.16.0`
- **Next.js**: Latest
- **React**: 18.2.0

### File Structure

```
├── components/nexus/           # Nexus UI Components
│   ├── NexusDashboard.tsx     # Main dashboard container
│   ├── NexusStatus.tsx        # SDK status and initialization
│   ├── BalanceDisplay.tsx     # Unified balance display
│   ├── TransferSection.tsx    # Cross-chain transfer UI
│   └── BridgeSection.tsx      # Token bridging interface
├── hooks/
│   └── useNexusSDK.ts         # Custom hook for SDK operations
├── lib/
│   ├── nexus-sdk.ts           # SDK service layer
│   ├── nexus-constants.ts     # Supported tokens and chains
│   └── utils.ts               # Utility functions
└── pages/
    └── dashboard.tsx          # Main dashboard page
```

### What It Does

The Nexus integration provides:

1. **Cross-Chain Token Transfers**: Transfer tokens between different supported EVM chains
2. **Token Bridging**: Bridge tokens to and from supported chains.
3. **Unified Balance Display**: View aggregated balances across multiple chains
4. **Privy Integration**: Seamless integration with Privy's multi-wallet system

### Supported Networks

- **Ethereum Mainnet**
- **Polygon**
- **Arbitrum One**
- **Optimism**
- **Base**

### Supported Tokens

- **USDC** 
- **USDT** 
- **ETH**


---

# Privy Auth `create-next-app` Starter

This is a template for integrating [**Privy Auth**](https://www.privy.io/) into a [NextJS](https://nextjs.org/) project. Check out the deployed app [here](https://create-next-app.privy.io/)!

This demo uses NextJS's [Pages Router](https://nextjs.org/docs/pages/building-your-application/routing). If you'd like to see an example using the [App Router](https://nextjs.org/docs/app), just change the branch of this repository to [`app-router`](https://github.com/privy-io/create-next-app/tree/app-router). 

## Setup

1. Clone this repository and open it in your terminal. 
```sh
git clone https://github.com/privy-io/create-next-app
```

2. Install the necessary dependencies (including [Privy Auth](https://www.npmjs.com/package/@privy-io/react-auth)) with `npm`.
```sh
npm i 
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, [paste your Privy App ID from the dashboard](https://docs.privy.io/guide/dashboard/api-keys).
```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login with Privy!


## Check out:
- `pages/_app.tsx` for how to use the `PrivyProvider` and initialize it with your Privy App ID
- `pages/index.tsx` for how to use the `usePrivy` hook and implement a simple `login` button
- `pages/dashboard.tsx` for how to use the `usePrivy` hook, fields like `ready`, `authenticated`, and `user`, and methods like `linkWallet` and `logout`


**Check out [our docs](https://docs.privy.io/) for more guidance around using Privy in your app!**
