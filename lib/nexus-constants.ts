import type { ChainMetadata } from "avail-nexus-sdk";

export const SUPPORTED_TOKENS = ["ETH", "USDC", "USDT"] as const;
export type SupportedToken = typeof SUPPORTED_TOKENS[number];

export const SUPPORTED_CHAINS: ChainMetadata[] = [
  { 
    id: 1, 
    name: "Ethereum", 
    shortName: "ETH",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    logo: "",
    rpcUrls: [],
    blockExplorerUrls: []
  },
  { 
    id: 10, 
    name: "Optimism", 
    shortName: "OPT",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    logo: "",
    rpcUrls: [],
    blockExplorerUrls: []
  },
  { 
    id: 137, 
    name: "Polygon", 
    shortName: "POL",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    logo: "",
    rpcUrls: [],
    blockExplorerUrls: []
  },
  { 
    id: 42161, 
    name: "Arbitrum", 
    shortName: "ARB",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    logo: "",
    rpcUrls: [],
    blockExplorerUrls: []
  },
  { 
    id: 8453, 
    name: "Base", 
    shortName: "BASE",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    logo: "",
    rpcUrls: [],
    blockExplorerUrls: []
  }
];

export const DEFAULT_TRANSFER_TOKEN = "ETH";
export const DEFAULT_TRANSFER_CHAIN_ID = 1; // Ethereum mainnet
export const DEFAULT_BRIDGE_TOKEN = "ETH";
export const DEFAULT_BRIDGE_CHAIN_ID = 10; // Optimism 