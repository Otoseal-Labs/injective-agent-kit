import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { z } from "zod";

const WrapINJInputSchema = z.object({
  network: z.string().default("MAINNET"),
  amount: z.string().min(1, "Amount must not be empty"),
});

export class WrapINJTool extends StructuredTool<typeof WrapINJInputSchema> {
  name = "injective_wrap_inj";
  description = `Wrap INJ tokens to WINJ using WINJ9 contract.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET") (required). Default is "MAINNET" if network param is not provided.
  - amount: The amount of INJ token to wrap to WINJ as a string (e.g., "1.5") (required).`;
  schema = WrapINJInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof WrapINJInputSchema>,
  ): Promise<string> {
    try {
      const wrap = await this.injectiveKit.wrapINJ(input.network, input.amount);
      if (!wrap) {
        throw new Error("Wrap failed");
      }
      return JSON.stringify({
        status: "success",
        wrap,
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
