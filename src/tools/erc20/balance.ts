import { InjectiveEVMAgentKit } from "../../agent";
import { Address, formatEther } from "viem";
import { getBalance, formatWei, getTokenDecimals } from "../../utils";

/**
 * Get ERC-20 token balance for a wallet
 * @param agent InjectiveEVMAgentKit instance
 * @param contractAddress Optional ERC-20 token contract address
 * @returns Promise with formatted balance as string
 */
export async function getERC20Balance(
  agent: InjectiveEVMAgentKit,
  contractAddress?: Address,
): Promise<string> {
  console.log(`Querying balance of ${contractAddress ? contractAddress : 'INJ'} for ${agent.walletAddress}...`);
  try {
    if (!contractAddress) {
      // Handle native token balance
      if (!agent.publicClient) {
        throw new Error("Public client not initialized");
      }

      if (!agent.walletAddress) {
        throw new Error("Wallet address not specified");
      }

      const balance = await agent.publicClient.getBalance({
        address: agent.walletAddress
      });

      return formatEther(balance);
    }

    // Handle ERC-20 token balance
    if (!agent.publicClient || !agent.walletAddress) {
      throw new Error("Public client or wallet address not initialized");
    }

    const balance = await getBalance(agent, contractAddress);
    if (balance === null || balance === undefined) {
      throw new Error(`Failed to retrieve balance for contract: ${contractAddress}`);
    }

    const decimals = await getTokenDecimals(agent, contractAddress);
    if (decimals === null || decimals === undefined) {
      throw new Error(`Failed to retrieve token decimals for contract: ${contractAddress}`);
    }

    const formatBalance = formatWei(Number(balance), decimals);
    return formatBalance.toString() || '0';
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
