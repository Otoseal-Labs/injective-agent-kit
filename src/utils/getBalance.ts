import { parseAbi, Address, PublicClient } from "viem";
import { InjectiveAgentKit } from "../agent";

const erc20Abi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
]);

export async function getBalance(
  agent: InjectiveAgentKit,
  publicClient: PublicClient,
  tokenAddress: Address,
): Promise<bigint> {
  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [agent.walletAddress],
  });

  return balance;
}
