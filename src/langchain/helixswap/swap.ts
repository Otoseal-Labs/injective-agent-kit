import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { z } from "zod";

const HelixSwapMinOutputInputSchema = z.object({
  network: z.string().default("MAINNET"),
  inputToken: z.string().min(1, "Input token must not be empty"),
  outputToken: z.string().min(1, "Output token must not be empty"),
  inputAmount: z.string().min(1, "Input amount must not be empty"),
  slippage: z.string().default("0.5"),
});

export class HelixSwapMinOutputTool extends StructuredTool<
  typeof HelixSwapMinOutputInputSchema
> {
  name = "injective_helix_swap_min_output";
  description = `Swap an amount of input token to output token using swapMinOutput method of the Helix swap router contract.
  IMPORTANT: Only use this tool if the user specifies that he wants to use Helix swap method. Do not use this tool if the user wants to use other swap methods.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET") (required). Default is "MAINNET" if network param is not provided.
  - inputToken: The input token want to swap. Must be uppercase (e.g., "INJ", "USDT") (required).
  - outputToken: The output token want to swap. Must be uppercase (e.g., "INJ", "USDT") (required).
  - inputAmount: The amount of input token to swap (e.g., "10") (required).
  - slippage: The slippage tolerance for the order as a percentage. (e.g., "1" for 1% slippage) (required). Default is "0.5" if slippage param is not provided.`;
  schema = HelixSwapMinOutputInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof HelixSwapMinOutputInputSchema>,
  ): Promise<string> {
    try {
      const swap = await this.injectiveKit.helixSwapMinOutput(
        input.network,
        input.inputToken,
        input.outputToken,
        input.inputAmount,
        input.slippage,
      );
      if (!swap) {
        throw new Error("Swap failed");
      }
      return JSON.stringify({
        status: "success",
        swap,
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
