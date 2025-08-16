import { Account, parseAbi } from "viem";
import { InjectiveEVMAgentKit } from "../../agent";
import { formatToken } from "../../utils";
import { injectiveTestnet } from "../../utils/viem/injective";
import { getTokenAddressByDenom } from "../../utils/tokens";

/**
 * Wraps INJ tokens into WINJ tokens
 * @param agent InjectiveEVMAgentKit instance
 * @param amount Amount of INJ to wrap as a string (e.g., "1.5" for 1.5 INJ)
 * @returns Promise with the transaction result
 */
export async function wrapINJ(
  agent: InjectiveEVMAgentKit,
  amount: string
): Promise<string> {
  console.log(`Wrapping ${amount} INJ into WINJ...`);

  if (Number(amount) <= 0) {
    const errorMsg = "INJ amount to wrap must be greater than 0";
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

    const winjAddress = getTokenAddressByDenom("WINJ");
    if (!winjAddress) {
      throw new Error("WINJ token address not found");
    }

    const hash = await agent.walletClient.writeContract({
      account,
      chain: injectiveTestnet,
      address: winjAddress,
      abi: parseAbi(["function deposit() public payable"]),
      functionName: "deposit",
      args: [],
      value: formattedAmount,
    });

    if (!hash) {
      throw new Error("Wrap INJ transaction failed to send");
    }

    return `Wrapped ${amount} INJ into WINJ.\nTransaction hash for the wrap: ${hash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
