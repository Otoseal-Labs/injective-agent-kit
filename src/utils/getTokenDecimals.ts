import { parseAbi, Address, PublicClient } from "viem";

const erc20Abi = parseAbi(["function decimals() view returns (uint8)"]);

export async function getTokenDecimals(
  publicClient: PublicClient,
  tokenAddress: Address,
): Promise<number> {
  const decimals = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  return decimals;
}
