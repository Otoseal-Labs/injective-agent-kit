import { parseAbi, Address } from "viem";
import { InjectiveEVMAgentKit } from "../agent";
import { INJECTIVE_STAKING_PRECOMPILE_CONTRACT } from "../commons";
import { IDelegationInfo, InjectiveValidatorAddress } from "../types";

const stakingPrecompileAbi = parseAbi([
  "function delegation(address delegatorAddress, string validatorAddress) external view returns (uint256 shares, (uint256 amount, string denom) balance)",
]);

export async function getDelegationInfo(
  agent: InjectiveEVMAgentKit,
  validatorAddress: InjectiveValidatorAddress,
  delegatorAddress: Address,
): Promise<IDelegationInfo> {
  const [shares, balance] = (await agent.publicClient.readContract({
    address: INJECTIVE_STAKING_PRECOMPILE_CONTRACT,
    abi: stakingPrecompileAbi,
    functionName: "delegation",
    args: [delegatorAddress, validatorAddress],
  })) as [bigint, { amount: bigint; denom: string }];

  return {
    shares,
    balance,
  };
}
