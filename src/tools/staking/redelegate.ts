import { Account, parseAbi } from "viem";
import { InjectiveEVMAgentKit } from "../../agent";
import { formatToken } from "../../utils";
import { injectiveTestnet } from "../../utils/viem/injective";
import { INJECTIVE_STAKING_PRECOMPILE_CONTRACT } from "../../commons";
import { InjectiveValidatorAddress } from "../../types";

/**
 * Redelegates native INJ tokens
 * @param agent InjectiveEVMAgentKit instance
 * @param validatorSrcAddress The Bech32-encoded address of the validator to redelegate from
 * @param validatorDstAddress The Bech32-encoded address of the validator to redelegate to
 * @param amount Amount of INJ to redelegate as a string (e.g., "1.5" for 1.5 INJ)
 * @returns Promise with the transaction result
 */
export async function redelegateINJ(
  agent: InjectiveEVMAgentKit,
  validatorSrcAddress: InjectiveValidatorAddress,
  validatorDstAddress: InjectiveValidatorAddress,
  amount: string
): Promise<string> {
  console.log(
    `Redelegating ${amount} INJ from ${validatorSrcAddress} to ${validatorDstAddress}...`
  );

  if (Number(amount) <= 0) {
    const errorMsg = "INJ amount to redelegate must be greater than 0";
    throw new Error(errorMsg);
  }

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

    const formattedAmount = formatToken(amount, 18);
    if (!formattedAmount) {
      throw new Error("Failed to format amount");
    }

    const delegationInfo = await agent.getDelegation(validatorSrcAddress);
    if (!delegationInfo) {
      throw new Error("Failed to get delegation information");
    }

    if (Number(delegationInfo.balance.amount) < Number(amount)) {
      throw new Error(
        `Insufficient staked INJ, need: ${amount}, have: ${delegationInfo.balance.amount}`
      );
    }

    const hash = await agent.walletClient.writeContract({
      account,
      chain: injectiveTestnet,
      address: INJECTIVE_STAKING_PRECOMPILE_CONTRACT,
      abi: parseAbi([
        "function redelegate(string memory validatorSrcAddress, string memory validatorDstAddress, uint256 amount) external",
      ]),
      functionName: "redelegate",
      args: [validatorSrcAddress, validatorDstAddress, formattedAmount],
    });

    if (!hash) {
      throw new Error("Redelegate transaction failed to send");
    }

    return `Redelegated ${amount} INJ from ${validatorSrcAddress} to ${validatorDstAddress}.\nTransaction hash for the redelegate: ${hash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
