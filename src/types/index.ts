export interface IToken {
  id: string,
  attributes: {
    address: `0x${string}`,
    name: string,
    symbol: string,
    decimals: number,
  },
};

export enum ModelProvider {
  ANTHROPIC = "anthropic",
  COHERE = "cohere",
  GOOGLE = "google",
  MISTRAL = "mistral",
  OPENAI = "openai",
}