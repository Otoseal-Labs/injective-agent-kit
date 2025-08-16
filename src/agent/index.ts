import {
  WalletClient as ViemWalletClient,
  createPublicClient,
  http,
  PublicClient as ViemPublicClient,
  Address,
  createWalletClient,
} from "viem";

import { injectiveTestnet } from "../utils/viem/injective";
import { privateKeyToAccount } from "viem/accounts";
import { getApiKeyForProvider } from "./provider";
import { getERC20Balance, ERC20Transfer } from "../tools/erc20";
import { wrapINJ, unwrapWINJ } from "../tools/winj9";
import { getTokenAddressByDenom } from "../utils/tokens";

export class InjectiveEVMAgentKit {
  public publicClient: ViemPublicClient;
  public walletClient: ViemWalletClient;
  public walletAddress: Address;
  public token: string | undefined;

  /**
   * Creates a new InjectiveEVMAgentKit instance
   * @param privateKey The private key for the wallet
   * @param provider The model provider to use
   */
  constructor(privateKey: string, provider: any) {
    const account = privateKeyToAccount(privateKey as Address);
    this.publicClient = createPublicClient({
      chain: injectiveTestnet,
      transport: http(),
    });
    this.walletAddress = account.address;
    this.walletClient = createWalletClient({
      account,
      chain: injectiveTestnet,
      transport: http(),
    });

    this.token = getApiKeyForProvider(provider);
  }

  /**
   * Gets the ERC20 token balance
   * @param contract_address Optional ERC-20 token contract address. If not provided, gets native INJ balance
   * @returns Promise with formatted balance as string
   */
  async getERC20Balance(contract_address?: Address): Promise<string> {
    return getERC20Balance(this, contract_address);
  }

  /**
   * Transfers INJ tokens or ERC-20 tokens
   * @param amount Amount to transfer as a string (e.g., "1.5" for 1.5 tokens)
   * @param recipient Recipient address
   * @param ticker Optional token ticker (if not provided, transfers native INJ)
   * @returns Promise with transaction result
   */
  async ERC20Transfer(
    amount: string,
    recipient: Address,
    ticker?: string
  ): Promise<string> {
    return ERC20Transfer(this, amount, recipient, ticker);
  }

  /**
   * Gets a token address from its ticker symbol
   * @param ticker The token ticker symbol (e.g., "INJ", "USDC")
   * @returns Promise with token address or null if not found
   */
  getTokenAddressFromTicker(ticker: string): Address | null {
    return getTokenAddressByDenom(ticker) as Address | null;
  }

  /**
   * Wraps INJ tokens to WINJ
   * @param amount The amount of INJ tokens to wrap
   * @returns Promise with transaction result
   */
  async wrapINJ(amount: string): Promise<string> {
    return wrapINJ(this, amount);
  }

  /**
   * Unwraps WINJ tokens to INJ
   * @param amount The amount of WINJ tokens to unwrap
   * @returns Promise with transaction result
   */
  async unwrapWINJ(amount: string): Promise<string> {
    return unwrapWINJ(this, amount);
  }
}
