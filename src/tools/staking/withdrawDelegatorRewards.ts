import { Account, parseAbi } from "viem";
import { InjectiveAgentKit } from "../../agent";
import { injectiveTestnet } from "../../utils/viem/injective";
import { INJECTIVE_STAKING_PRECOMPILE_CONTRACT } from "../../commons";
import { InjectiveValidatorAddress } from "../../types";

/**
 * Withdraws delegator rewards
 * @param agent InjectiveAgentKit instance
 * @param network The network to use (e.g., "TESTNET" or "MAINNET")
 * @param validatorAddress The Bech32-encoded address of the validator to withdraw rewards from
 * @returns Promise with the transaction result
 */
export async function withdrawDelegatorRewards(
  agent: InjectiveAgentKit,
  network: string,
  validatorAddress: InjectiveValidatorAddress,
): Promise<string> {
  console.log(
    `Withdrawing delegator rewards from ${validatorAddress} on ${network}...`,
  );
  const walletClient = agent.getWalletClient(network);
  const publicClient = agent.getPublicClient(network);

  if (!walletClient) {
    const errorMsg = "Wallet client is not initialized";
    throw new Error(errorMsg);
  }

  if (!publicClient) {
    throw new Error("Public client is not initialized");
  }

  try {
    const account = walletClient.account as Account;
    if (!account) {
      throw new Error("Wallet account is not initialized");
    }

    const hash = await walletClient.writeContract({
      account,
      chain: injectiveTestnet,
      address: INJECTIVE_STAKING_PRECOMPILE_CONTRACT,
      abi: parseAbi([
        "function withdrawDelegatorRewards(string memory validatorAddress) external",
      ]),
      functionName: "withdrawDelegatorRewards",
      args: [validatorAddress],
    });

    if (!hash) {
      throw new Error("Withdraw delegator rewards transaction failed to send");
    }

    return `Withdrew delegator rewards from ${validatorAddress}.\nTransaction hash for the withdraw rewards: ${hash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
