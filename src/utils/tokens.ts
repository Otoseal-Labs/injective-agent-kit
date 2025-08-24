import {
  TOKENS,
  HELIX_TRADING_TOKENS_TESTNET,
  HELIX_TRADING_TOKENS_MAINNET,
} from "../commons";
import { ISwapToken, IToken } from "../types";

export function getTokenDenomByAddress(address: `0x${string}`): string {
  return TOKENS[address]?.attributes.symbol;
}

export function getTokenInfoByAddress(address: `0x${string}`): IToken {
  return TOKENS[address];
}

export function getTokenAddressByDenom(
  denom: string,
): `0x${string}` | undefined {
  const keys = Object.keys(TOKENS).filter(
    (v) =>
      TOKENS[v as `0x${string}`].attributes.symbol.toUpperCase() ===
      denom.toUpperCase(),
  );

  if (keys.length === 0) {
    return undefined;
  }
  return keys[0] as `0x${string}`;
}

export function getTokenInfoByDenom(denom: string): IToken | undefined {
  const keys = Object.keys(TOKENS).filter(
    (v) => TOKENS[v as `0x${string}`].attributes.symbol === denom,
  );
  if (keys.length === 0) {
    return;
  }
  return TOKENS[keys[0] as `0x${string}`];
}

export function getSwapTokenInfoBySymbol(
  isTestnet: boolean,
  symbol: string,
): ISwapToken | undefined {
  const TOKEN_LIST = isTestnet
    ? HELIX_TRADING_TOKENS_TESTNET
    : HELIX_TRADING_TOKENS_MAINNET;
  const keys = Object.keys(TOKEN_LIST).filter(
    (v) => TOKEN_LIST[v].symbol.toUpperCase() === symbol.toUpperCase(),
  );
  if (keys.length === 0) {
    return;
  }
  return TOKEN_LIST[keys[0]];
}
