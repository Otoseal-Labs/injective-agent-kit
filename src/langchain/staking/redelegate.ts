import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { InjectiveValidatorAddress } from "../../types";
import { z } from "zod";

const RedelegateINJInputSchema = z.object({
  network: z.string().default("MAINNET"),
  validator_src_address: z
    .string()
    .min(1, "Source validator address must not be empty"),
  validator_dst_address: z
    .string()
    .min(1, "Destination validator address must not be empty"),
  amount: z.string().min(1, "Amount must not be empty"),
});

export class RedelegateINJTool extends StructuredTool<
  typeof RedelegateINJInputSchema
> {
  name = "injective_redelegate_inj";
  description = `Redelegate (Restake) INJ tokens from one validator to another using the staking precompile contract.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET") (required). Default is "MAINNET" if network param is not provided.
  - src_validator_address: The Bech32-encoded address of the validator to redelegate from (required).
  - dst_validator_address: The Bech32-encoded address of the validator to redelegate to (required).
  - amount: The amount of INJ token to redelegate as a string (e.g., "1.5") (required).`;
  schema = RedelegateINJInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof RedelegateINJInputSchema>,
  ): Promise<string> {
    try {
      const redelegate = await this.injectiveKit.redelegate(
        input.network,
        input.validator_src_address as InjectiveValidatorAddress,
        input.validator_dst_address as InjectiveValidatorAddress,
        input.amount,
      );
      if (!redelegate) {
        throw new Error("Redelegate failed");
      }
      return JSON.stringify({
        status: "success",
        redelegate,
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
