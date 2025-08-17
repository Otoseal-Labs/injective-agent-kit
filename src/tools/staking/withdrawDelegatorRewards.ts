import { Account, parseAbi } from "viem";
import { InjectiveEVMAgentKit } from "../../agent";
import { injectiveTestnet } from "../../utils/viem/injective";
import { INJECTIVE_STAKING_PRECOMPILE_CONTRACT } from "../../commons";
import { InjectiveValidatorAddress } from "../../types";

/**
 * Withdraws delegator rewards
 * @param agent InjectiveEVMAgentKit instance
 * @param validatorAddress The Bech32-encoded address of the validator to withdraw rewards from
 * @returns Promise with the transaction result
 */
export async function withdrawDelegatorRewards(
  agent: InjectiveEVMAgentKit,
  validatorAddress: InjectiveValidatorAddress,
): Promise<string> {
  console.log(`Withdrawing delegator rewards from ${validatorAddress}...`);

  if (!agent.walletClient) {
    const errorMsg = "Wallet client is not initialized";
    throw new Error(errorMsg);
  }

  if (!agent.publicClient) {
    throw new Error("Public client is not initialized");
  }

  try {
    const account = agent.walletClient.account as Account;
    if (!account) {
      throw new Error("Wallet account is not initialized");
    }

    const hash = await agent.walletClient.writeContract({
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
