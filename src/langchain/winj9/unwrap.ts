import { StructuredTool } from "@langchain/core/tools";
import { InjectiveEVMAgentKit } from "../../agent";
import { z } from "zod";

const UnwrapWINJInputSchema = z.object({
  amount: z.string().min(1, "Amount must not be empty"),
});

export class UnwrapWINJTool extends StructuredTool<
  typeof UnwrapWINJInputSchema
> {
  name = "injective_unwrap_winj";
  description = `Unwrap WINJ tokens to INJ using WINJ9 contract.

  Parameters:
  - amount: The amount of WINJ token to unwrap to INJ as a string (e.g., "1.5") (required).`;
  schema = UnwrapWINJInputSchema;

  constructor(private readonly injectiveKit: InjectiveEVMAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof UnwrapWINJInputSchema>,
  ): Promise<string> {
    try {
      const unwrap = await this.injectiveKit.unwrapWINJ(input.amount);
      if (!unwrap) {
        throw new Error("Unwrap failed");
      }
      return JSON.stringify({
        status: "success",
        unwrap,
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
