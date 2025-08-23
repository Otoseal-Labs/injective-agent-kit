import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { z } from "zod";

const FetchPositionsInputSchema = z.object({
  network: z.string().default("MAINNET"),
  tickers: z.array(z.string()).optional(),
  subaccount_index: z.string().optional(),
  direction: z.enum(["buy", "sell", "long", "short"]).optional(),
});

export class FetchPositionsTool extends StructuredTool<
  typeof FetchPositionsInputSchema
> {
  name = "injective_fetch_positions";
  description = `Fetch derivative positions of a user on Injective exchange.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET"). Default is "MAINNET" if not provided.
  - tickers: Optional. An array of ticker symbols to fetch multiple positions. A ticker must be converted to "BASE/QUOTE PERP" format. (e.g., ["BTC/USDT PERP", "ETH/USDT PERP"]). QUOTE only can be USD token (e.g. USDT, AUSD, etc)
  - subaccount_index: Optional. The index of the subaccount to use for fetching positions.
  - direction: Optional. Filter positions by trade direction.
    - "buy" or "long": Fetch long positions.
    - "sell" or "short": Fetch short positions.
`;

  schema = FetchPositionsInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof FetchPositionsInputSchema>,
  ): Promise<string> {
    try {
      const positions = await this.injectiveKit.fetchPositions(
        input.network,
        input.tickers,
        input.subaccount_index,
        input.direction,
      );
      if (!positions) {
        throw new Error("No positions found");
      }
      return JSON.stringify({
        status: "success",
        positions,
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
