import { TOKENS } from "../commons";
import { IToken } from "../types";

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
