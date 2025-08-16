import { Account, parseAbi } from "viem";
import { InjectiveEVMAgentKit } from "../../agent";
import { formatToken } from "../../utils";
import { injectiveTestnet } from "../../utils/viem/injective";
import { getTokenAddressByDenom } from "../../utils/tokens";

/**
 * Unwraps WINJ tokens into INJ tokens
 * @param agent InjectiveEVMAgentKit instance
 * @param amount Amount of WINJ to unwrap as a string (e.g., "1.5" for 1.5 WINJ)
 * @returns Promise with the transaction result
 */
export async function unwrapWINJ(
  agent: InjectiveEVMAgentKit,
  amount: string
): Promise<string> {
  console.log(`Unwrapping ${amount} WINJ into INJ...`);

  if (Number(amount) <= 0) {
    const errorMsg = "WINJ amount to unwrap must be greater than 0";
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

    const winjAddress = getTokenAddressByDenom("WINJ");
    if (!winjAddress) {
      throw new Error("WINJ token address not found");
    }

    const winjBalance = await agent.getERC20Balance(winjAddress);
    if (Number(winjBalance) < Number(amount)) {
      throw new Error(
        `Insufficient WINJ balance, need: ${amount}, have: ${winjBalance}`
      );
    }

    const hash = await agent.walletClient.writeContract({
      account,
      chain: injectiveTestnet,
      address: winjAddress,
      abi: parseAbi(["function withdraw(uint256 wad) public"]),
      functionName: "withdraw",
      args: [formattedAmount],
    });

    if (!hash) {
      throw new Error("Unwrap WINJ transaction failed to send");
    }

    return `Unwrapped ${amount} WINJ into INJ.\nTransaction hash for the unwrap: ${hash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
