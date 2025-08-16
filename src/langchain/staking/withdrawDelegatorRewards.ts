import { StructuredTool } from "@langchain/core/tools";
import { InjectiveEVMAgentKit } from "../../agent";
import { InjectiveValidatorAddress } from "../../types";
import { z } from "zod";

const WithdrawDelegatorRewardsInputSchema = z.object({
  validator_address: z.string().min(1, "Validator address must not be empty"),
});

export class WithdrawDelegatorRewardsTool extends StructuredTool<
  typeof WithdrawDelegatorRewardsInputSchema
> {
  name = "injective_withdraw_delegator_rewards";
  description = `Withdraw rewards from a validator using the staking precompile contract.

  Parameters:
  - validator_address: The Bech32-encoded address of the validator to withdraw rewards from (required).`;
  schema = WithdrawDelegatorRewardsInputSchema;

  constructor(private readonly injectiveKit: InjectiveEVMAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof WithdrawDelegatorRewardsInputSchema>
  ): Promise<string> {
    try {
      const rewards = await this.injectiveKit.withdrawDelegatorRewards(
        input.validator_address as InjectiveValidatorAddress
      );
      if (!rewards) {
        throw new Error("Withdraw delegator rewards failed");
      }
      return JSON.stringify({
        status: "success",
        rewards,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error?.code ?? "UNKNOWN_ERROR",
      });
    }
  }
}
