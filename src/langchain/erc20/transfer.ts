import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { Address } from "viem";
import { z } from "zod";

const InjectiveERC20TransferInputSchema = z.object({
  network: z.string().default("MAINNET"),
  amount: z.string().min(1, "Amount must not be empty"),
  recipient: z.string(),
  ticker: z.string().optional(),
});

export class InjectiveERC20TransferTool extends StructuredTool<
  typeof InjectiveERC20TransferInputSchema
> {
  name = "injective_erc20_transfer";
  description = `Transfer tokens to another Injective wallet.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET") (required). Default is "MAINNET" if network param is not provided.
  - amount: The amount of tokens to transfer as a string (e.g., "1.5") (required).
  - recipient: The recipient's wallet address (required).
  - ticker: Optional. The token symbol/ticker (e.g., "USDC"). Do not specify for native Injective token transfers.`;
  schema = InjectiveERC20TransferInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof InjectiveERC20TransferInputSchema>,
  ): Promise<string> {
    try {
      const transfer = await this.injectiveKit.ERC20Transfer(
        input.network,
        input.amount,
        input.recipient as Address,
        input.ticker,
      );
      if (!transfer) {
        throw new Error("Transfer failed");
      }
      return JSON.stringify({
        status: "success",
        transfer,
        token: input?.ticker ?? "INJ",
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
