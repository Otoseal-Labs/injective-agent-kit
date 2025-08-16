import { StructuredTool } from "@langchain/core/tools";
import { InjectiveEVMAgentKit } from "../../agent";
import { Address } from "viem";
import { InjectiveValidatorAddress } from "../../types";
import { z } from "zod";

const GetDelegationInputSchema = z.object({
  delegator_address: z.string().optional(),
  validator_address: z.string().min(1, "Validator address must not be empty"),
});

export class GetDelegationINJTool extends StructuredTool<
  typeof GetDelegationInputSchema
> {
  name = "injective_get_delegation";
  description = `Get delegation information of a delegator on a specific validator.

  Parameters:
  - delegator_address: Optional. The address of the delegator.
  - validator_address: The Bech32-encoded address of the validator (required).`;
  schema = GetDelegationInputSchema;

  constructor(private readonly injectiveKit: InjectiveEVMAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof GetDelegationInputSchema>
  ): Promise<string> {
    try {
      const delegation = await this.injectiveKit.getDelegation(
        input.validator_address as InjectiveValidatorAddress,
        input.delegator_address as Address,
      );
      if (!delegation) {
        throw new Error("Get delegation failed");
      }
      return JSON.stringify({
        status: "success",
        delegation,
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
