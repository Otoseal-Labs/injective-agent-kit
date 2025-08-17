import { IToken } from "../types";

export const INJECTIVE_EVM_RPC_URL = "https://sentry.evm-rpc.injective.network";
export const INJECTIVE_EVM_TESTNET_RPC_URL =
  "https://k8s.testnet.json-rpc.injective.network";
export const INJECTIVE_STAKING_PRECOMPILE_CONTRACT =
  "0x0000000000000000000000000000000000000066";

export const TOKENS: { [key: `0x${string}`]: IToken } = {
  "0x0": {
    id: "injective_native_inj",
    attributes: {
      address: "0x0",
      name: "Injective native token",
      symbol: "INJ",
      decimals: 18,
    },
  },
  "0x0000000088827d2d103ee2d9A6b781773AE03FfB": {
    id: "injective_0x0000000088827d2d103ee2d9A6b781773AE03FfB",
    attributes: {
      address: "0x0000000088827d2d103ee2d9A6b781773AE03FfB",
      name: "Wrapped INJ",
      symbol: "WINJ",
      decimals: 18,
    },
  },
};
