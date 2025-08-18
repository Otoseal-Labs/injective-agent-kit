import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { InjectiveValidatorAddress } from "../../types";
import { z } from "zod";

const DelegateINJInputSchema = z.object({
  network: z.string().default("MAINNET"),
  validator_address: z.string().min(1, "Validator address must not be empty"),
  amount: z.string().min(1, "Amount must not be empty"),
});

export class DelegateINJTool extends StructuredTool<
  typeof DelegateINJInputSchema
> {
  name = "injective_delegate_inj";
  description = `Delegate (Stake) INJ tokens to a validator using the staking precompile contract.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET") (required). Default is "MAINNET" if network param is not provided.
  - validator_address: The Bech32-encoded address of the validator to delegate to (required).
  - amount: The amount of INJ token to delegate as a string (e.g., "1.5") (required).`;
  schema = DelegateINJInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof DelegateINJInputSchema>,
  ): Promise<string> {
    try {
      const delegate = await this.injectiveKit.delegate(
        input.network,
        input.validator_address as InjectiveValidatorAddress,
        input.amount,
      );
      if (!delegate) {
        throw new Error("Delegate failed");
      }
      return JSON.stringify({
        status: "success",
        delegate,
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
