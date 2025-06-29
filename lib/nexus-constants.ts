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

// Aave v3 Pool Contract Addresses (Base only)
export const AAVE_V3_POOL_ADDRESSES = {
  8453: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Base
} as const;

// Aave v3 Pool ABI (supply and depositETH functions)
export const AAVE_V3_POOL_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "onBehalfOf",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "referralCode",
        "type": "uint16"
      }
    ],
    "name": "supply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "onBehalfOf",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "referralCode",
        "type": "uint16"
      }
    ],
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// USDC Token Addresses for each chain
export const USDC_TOKEN_ADDRESSES = {
  1: "0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C", // Ethereum Mainnet
  10: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // Optimism
  137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon
  42161: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // Arbitrum
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
} as const;

// Default values for bridge and execute
export const DEFAULT_BRIDGE_TOKEN = "USDC";
export const DEFAULT_BRIDGE_CHAIN_ID = 10; 