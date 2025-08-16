export type InjectiveValidatorAddress = `injvaloper1${string}`;

export interface IToken {
  id: string,
  attributes: {
    address: `0x${string}`,
    name: string,
    symbol: string,
    decimals: number,
  },
};

export interface ICosmosCoin {
  amount: bigint;
  denom: string;
}

export interface IDelegationInfo {
  shares: bigint;
  balance: ICosmosCoin;
}

export interface IDelegationInfoJSON {
  shares: string;
  balance: {
    amount: string;
    denom: string;
  };
}

export enum ModelProvider {
  ANTHROPIC = "anthropic",
  COHERE = "cohere",
  GOOGLE = "google",
  MISTRAL = "mistral",
  OPENAI = "openai",
}