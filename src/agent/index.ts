import {
  WalletClient as ViemWalletClient,
  createPublicClient,
  http,
  PublicClient as ViemPublicClient,
  Address,
  createWalletClient,
} from "viem";

import { injective, injectiveTestnet } from "../utils/viem/injective";
import { privateKeyToAccount } from "viem/accounts";
import { getApiKeyForProvider } from "./provider";
import { getERC20Balance, ERC20Transfer } from "../tools/erc20";
import { wrapINJ, unwrapWINJ } from "../tools/winj9";
import {
  delegateINJ,
  redelegateINJ,
  undelegateINJ,
  withdrawDelegatorRewards,
  getDelegation,
} from "../tools/staking";
import { getTokenAddressByDenom } from "../utils/tokens";
import { IDelegationInfoJSON, InjectiveValidatorAddress } from "../types";
import { getInjectiveAddress } from "@injectivelabs/sdk-ts";

export class InjectiveAgentKit {
  public mainnetPublicClient: ViemPublicClient;
  public mainnetWalletClient: ViemWalletClient;
  public testnetPublicClient: ViemPublicClient;
  public testnetWalletClient: ViemWalletClient;
  public walletAddress: Address;
  public injWalletAddress: string;
  public token: string | undefined;

  /**
   * Creates a new InjectiveAgentKit instance
   * @param privateKey The private key for the wallet
   * @param provider The model provider to use
   */
  constructor(privateKey: string, provider: any) {
    const account = privateKeyToAccount(privateKey as Address);
    this.mainnetPublicClient = createPublicClient({
      chain: injective,
      transport: http(),
    });
    this.mainnetWalletClient = createWalletClient({
      account,
      chain: injective,
      transport: http(),
    });

    this.testnetPublicClient = createPublicClient({
      chain: injectiveTestnet,
      transport: http(),
    });
    this.testnetWalletClient = createWalletClient({
      account,
      chain: injectiveTestnet,
      transport: http(),
    });

    this.walletAddress = account.address;
    this.injWalletAddress = getInjectiveAddress(account.address);

    this.token = getApiKeyForProvider(provider);
  }

  /**
   * Gets the wallet client for the specified network
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @returns The wallet client for the specified network
   */
  getWalletClient(network: string): ViemWalletClient {
    return network === "TESTNET"
      ? this.testnetWalletClient
      : this.mainnetWalletClient;
  }

  /**
   * Gets the public client for the specified network
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @returns The public client for the specified network
   */
  getPublicClient(network: string): ViemPublicClient {
    return network === "TESTNET"
      ? this.testnetPublicClient
      : this.mainnetPublicClient;
  }

  /**
   * Gets the ERC20 token balance
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param contract_address Optional ERC-20 token contract address. If not provided, gets native INJ balance
   * @returns Promise with formatted balance as string
   */
  async getERC20Balance(
    network: string,
    contract_address?: Address,
  ): Promise<string> {
    return getERC20Balance(this, network, contract_address);
  }

  /**
   * Transfers INJ tokens or ERC-20 tokens
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param amount Amount to transfer as a string (e.g., "1.5" for 1.5 tokens)
   * @param recipient Recipient address
   * @param ticker Optional token ticker (if not provided, transfers native INJ)
   * @returns Promise with transaction result
   */
  async ERC20Transfer(
    network: string,
    amount: string,
    recipient: Address,
    ticker?: string,
  ): Promise<string> {
    return ERC20Transfer(this, network, amount, recipient, ticker);
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
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param amount The amount of INJ tokens to wrap
   * @returns Promise with transaction result
   */
  async wrapINJ(network: string, amount: string): Promise<string> {
    return wrapINJ(this, network, amount);
  }

  /**
   * Unwraps WINJ tokens to INJ
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param amount The amount of WINJ tokens to unwrap
   * @returns Promise with transaction result
   */
  async unwrapWINJ(network: string, amount: string): Promise<string> {
    return unwrapWINJ(this, network, amount);
  }

  /**
   * Delegates INJ tokens to a validator
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param validatorAddress The Bech32-encoded address of the validator to delegate to
   * @param amount The amount of INJ tokens to delegate
   * @returns Promise with the transaction result
   */
  async delegate(
    network: string,
    validatorAddress: InjectiveValidatorAddress,
    amount: string,
  ): Promise<string> {
    return delegateINJ(this, network, validatorAddress, amount);
  }

  /**
   * Redelegates INJ tokens from one validator to another
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param validatorSrcAddress The Bech32-encoded address of the source validator
   * @param validatorDstAddress The Bech32-encoded address of the destination validator
   * @param amount The amount of INJ tokens to redelegate
   * @returns Promise with the transaction result
   */
  async redelegate(
    network: string,
    validatorSrcAddress: InjectiveValidatorAddress,
    validatorDstAddress: InjectiveValidatorAddress,
    amount: string,
  ): Promise<string> {
    return redelegateINJ(
      this,
      network,
      validatorSrcAddress,
      validatorDstAddress,
      amount,
    );
  }

  /**
   * Undelegates INJ tokens from a validator
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param validatorAddress The Bech32-encoded address of the validator to undelegate from
   * @param amount The amount of INJ tokens to undelegate
   * @returns Promise with the transaction result
   */
  async undelegate(
    network: string,
    validatorAddress: InjectiveValidatorAddress,
    amount: string,
  ): Promise<string> {
    return undelegateINJ(this, network, validatorAddress, amount);
  }

  /**
   * Withdraws delegator rewards
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param validatorAddress The Bech32-encoded address of the validator to withdraw rewards from
   * @returns Promise with the transaction result
   */
  async withdrawDelegatorRewards(
    network: string,
    validatorAddress: InjectiveValidatorAddress,
  ): Promise<string> {
    return withdrawDelegatorRewards(this, network, validatorAddress);
  }

  /**
   * Get delegation information of a delegator on a specific validator
   * @param network The network to use (e.g., "TESTNET" or "MAINNET")
   * @param validatorAddress The Bech32-encoded address of the validator
   * @param delegatorAddress Optional. The address of the delegator. (If not provided, defaults to the caller's address)
   * @returns  Promise with delegation information with formatted delegated amount
   */
  async getDelegation(
    network: string,
    validatorAddress: InjectiveValidatorAddress,
    delegatorAddress?: Address,
  ): Promise<IDelegationInfoJSON> {
    return getDelegation(this, network, validatorAddress, delegatorAddress);
  }
}
