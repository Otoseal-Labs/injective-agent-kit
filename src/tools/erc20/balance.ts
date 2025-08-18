import { InjectiveAgentKit } from "../../agent";
import { Address, formatEther } from "viem";
import { getBalance, formatWei, getTokenDecimals } from "../../utils";

/**
 * Get ERC-20 token balance for a wallet
 * @param agent InjectiveAgentKit instance
 * @param network The network to use (e.g., "TESTNET" or "MAINNET")
 * @param contractAddress Optional ERC-20 token contract address
 * @returns Promise with formatted balance as string
 */
export async function getERC20Balance(
  agent: InjectiveAgentKit,
  network: string,
  contractAddress?: Address,
): Promise<string> {
  console.log(
    `Querying balance of ${contractAddress ? contractAddress : "INJ"} for ${agent.walletAddress} on ${network}...`,
  );
  const publicClient = agent.getPublicClient(network);

  try {
    if (!contractAddress) {
      // Handle native token balance
      if (!publicClient) {
        throw new Error("Public client not initialized");
      }

      if (!agent.walletAddress) {
        throw new Error("Wallet address not specified");
      }

      const balance = await publicClient.getBalance({
        address: agent.walletAddress,
      });

      return formatEther(balance);
    }

    // Handle ERC-20 token balance
    if (!publicClient || !agent.walletAddress) {
      throw new Error("Public client or wallet address not initialized");
    }

    const balance = await getBalance(agent, publicClient, contractAddress);
    if (balance === null || balance === undefined) {
      throw new Error(
        `Failed to retrieve balance for contract: ${contractAddress}`,
      );
    }

    const decimals = await getTokenDecimals(publicClient, contractAddress);
    if (decimals === null || decimals === undefined) {
      throw new Error(
        `Failed to retrieve token decimals for contract: ${contractAddress}`,
      );
    }

    const formatBalance = formatWei(Number(balance), decimals);
    return formatBalance.toString() || "0";
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
