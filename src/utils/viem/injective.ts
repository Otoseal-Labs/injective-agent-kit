import { defineChain } from "viem";

export const injective = defineChain({
  id: 1776,
  name: "Injective EVM",
  nativeCurrency: {
    decimals: 18,
    name: "Injective",
    symbol: "INJ",
  },
  rpcUrls: {
    default: {
      http: ["https://sentry.evm-rpc.injective.network"],
      // Mock websocket URL because the real one for Injective EVM is not available
      webSocket: ["wss://rpc.injective.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Injective EVM Explorer",
      url: "https://blockscout.injective.network",
    },
  },
  contracts: {
    // Mock contract multicall3 address because the real one for Injective EVM is not available
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
});

export const injectiveTestnet = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Injective",
    symbol: "INJ",
  },
  rpcUrls: {
    default: {
      http: ["https://k8s.testnet.json-rpc.injective.network/"],
      // Mock websocket URL because the real one for Injective EVM testnet is not available
      webSocket: ["wss://rpc.injective.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Injective EVM Testnet Explorer",
      url: "https://testnet.blockscout.injective.network",
    },
  },
  contracts: {
    // Mock contract multicall3 address because the real one for Injective EVM testnet is not available
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
});
