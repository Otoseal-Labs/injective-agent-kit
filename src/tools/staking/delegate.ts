import { Account, parseAbi } from "viem";
import { InjectiveEVMAgentKit } from "../../agent";
import { formatToken } from "../../utils";
import { injectiveTestnet } from "../../utils/viem/injective";
import { INJECTIVE_STAKING_PRECOMPILE_CONTRACT } from "../../commons";
import { InjectiveValidatorAddress } from "../../types";

/**
 * Delegates native INJ tokens
 * @param agent InjectiveEVMAgentKit instance
 * @param validatorAddress The Bech32-encoded address of the validator to delegate to
 * @param amount Amount of INJ to delegate as a string (e.g., "1.5" for 1.5 INJ)
 * @returns Promise with the transaction result
 */
export async function delegateINJ(
  agent: InjectiveEVMAgentKit,
  validatorAddress: InjectiveValidatorAddress,
  amount: string
): Promise<string> {
  console.log(`Delegating ${amount} INJ to ${validatorAddress}...`);

  if (Number(amount) <= 0) {
    const errorMsg = "INJ amount to delegate must be greater than 0";
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

    const injectiveBalance = await agent.getERC20Balance();
    if (Number(injectiveBalance) < Number(amount)) {
      throw new Error(
        `Insufficient INJ balance, need: ${amount}, have: ${injectiveBalance}`
      );
    }

    const hash = await agent.walletClient.writeContract({
      account,
      chain: injectiveTestnet,
      address: INJECTIVE_STAKING_PRECOMPILE_CONTRACT,
      abi: parseAbi(["function delegate(string memory validatorAddress, uint256 amount) external"]),
      functionName: "delegate",
      args: [validatorAddress, formattedAmount],
    });

    if (!hash) {
      throw new Error("Delegate transaction failed to send");
    }

    return `Delegated ${amount} INJ to ${validatorAddress}.\nTransaction hash for the delegate: ${hash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
