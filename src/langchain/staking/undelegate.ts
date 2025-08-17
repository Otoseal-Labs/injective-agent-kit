import { StructuredTool } from "@langchain/core/tools";
import { InjectiveEVMAgentKit } from "../../agent";
import { InjectiveValidatorAddress } from "../../types";
import { z } from "zod";

const UndelegateINJInputSchema = z.object({
  validator_address: z.string().min(1, "Validator address must not be empty"),
  amount: z.string().min(1, "Amount must not be empty"),
});

export class UndelegateINJTool extends StructuredTool<
  typeof UndelegateINJInputSchema
> {
  name = "injective_undelegate_inj";
  description = `Undelegate (Unstake) INJ tokens from a validator using the staking precompile contract.

  Parameters:
  - validator_address: The Bech32-encoded address of the validator to undelegate from (required).
  - amount: The amount of INJ token to undelegate as a string (e.g., "1.5") (required).`;
  schema = UndelegateINJInputSchema;

  constructor(private readonly injectiveKit: InjectiveEVMAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof UndelegateINJInputSchema>,
  ): Promise<string> {
    try {
      const undelegate = await this.injectiveKit.undelegate(
        input.validator_address as InjectiveValidatorAddress,
        input.amount,
      );
      if (!undelegate) {
        throw new Error("Undelegate failed");
      }
      return JSON.stringify({
        status: "success",
        undelegate,
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
