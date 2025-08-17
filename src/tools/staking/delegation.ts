import { InjectiveEVMAgentKit } from "../../agent";
import { Address, formatUnits } from "viem";
import { getDelegationInfo } from "../../utils";
import { IDelegationInfoJSON, InjectiveValidatorAddress } from "../../types";

/**
 * Get delegation information of a delegator on a specific validator
 * @param agent InjectiveEVMAgentKit instance
 * @param validatorAddress The Bech32-encoded address of the validator
 * @param delegatorAddress Optional. The address of the delegator. (If not provided, defaults to the caller's address)
 * @returns Promise with delegation information with formatted delegated amount
 */
export async function getDelegation(
  agent: InjectiveEVMAgentKit,
  validatorAddress: InjectiveValidatorAddress,
  delegatorAddress?: Address,
): Promise<IDelegationInfoJSON> {
  if (!delegatorAddress) {
    delegatorAddress = agent.walletAddress;
  }
  console.log(
    `Querying delegation for ${delegatorAddress} on validator ${validatorAddress}...`,
  );

  if (!agent.walletClient) {
    const errorMsg = "Wallet client is not initialized";
    throw new Error(errorMsg);
  }

  if (!agent.publicClient) {
    throw new Error("Public client is not initialized");
  }

  try {
    const delegationInfo = await getDelegationInfo(
      agent,
      validatorAddress,
      delegatorAddress,
    );
    if (delegationInfo === null || delegationInfo === undefined) {
      throw new Error(
        `Failed to retrieve delegation information for ${delegatorAddress} on validator ${validatorAddress}`,
      );
    }

    const formattedAmount = formatUnits(delegationInfo.balance.amount, 18);

    return {
      shares: delegationInfo.shares.toString(),
      balance: {
        amount: formattedAmount.toString(),
        denom: delegationInfo.balance.denom,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
