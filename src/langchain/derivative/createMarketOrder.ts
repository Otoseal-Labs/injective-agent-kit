import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { z } from "zod";

const CreateDerivativeMarketOrderInputSchema = z.object({
  network: z.string().default("MAINNET"),
  ticker: z.string().min(1, "Ticker must not be empty"),
  market_id: z.string().optional(),
  subaccount_index: z.string().optional(),
  order_type: z
    .number()
    .int()
    .min(1, "Order type must be a valid Injective order type")
    .max(8, "Order type must be a valid Injective order type"),
  slippage: z.string().default("0.5"),
  quantity: z.string().min(1, "Quantity must not be empty"),
  leverage: z.string().default("1"),
  margin: z.string().optional(),
  trigger_price: z.string().optional(),
});

export class CreateDerivativeMarketOrderTool extends StructuredTool<
  typeof CreateDerivativeMarketOrderInputSchema
> {
  name = "injective_create_derivative_market_order";
  description = `Create a derivative market order on Injective exchange.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET") (required). Default is "MAINNET" if network param is not provided.
  - ticker: The ticker symbol of the derivative market (required). Must be converted to "BASE/QUOTE PERP" format. QUOTE only can be USD token (e.g. USDT, AUSD, etc)
  - market_id: Optional. The unique identifier of the derivative market.
  - subaccount_index: Optional. The index of the subaccount to use for the order.
  - order_type: The type of order (number from 1 to 8) to create. (required).
    1 (BUY) → Go long (e.g. "Buy 1 BTC", "Open long BTC/USDT with 2x").
    2 (SELL) → Go short (e.g. "Short ETH", "Sell 0.5 BTC at market").
    3 (STOP_BUY) → Buy if price rises to trigger_price (e.g. "Buy BTC if it breaks 70k").
    4 (STOP_SELL) → Sell if price drops to trigger_price (e.g. "Stop loss BTC at 65k").
    5 (TAKE_BUY) → Buy if price falls to trigger_price (e.g. "Buy BTC on dip to 60k").
    6 (TAKE_SELL) → Sell if price rises to trigger_price (e.g. "Take profit long BTC at 120k").
    7 (BUY_PO) → Post-only buy (e.g. "Place post-only buy at 59,500").
    8 (SELL_PO) → Post-only sell (e.g. "Place post-only sell at 62,000").

  - slippage: The slippage tolerance for the order as a percentage. (e.g., "1" for 1% slippage) (required). Default is "0.5" if slippage param is not provided.
  - quantity: The quantity of the asset to buy/sell, cannot be 0 (e.g., "0.1" for 0.1 BTC) (required).
  - leverage: The leverage to use for the order, cannot be 0 (e.g., "5" for 5x leverage) (required). Default is "1" if not provided.
  - margin: Optional. The margin to use for the order (e.g., "100" for $100 margin). Margin MUST be "0" if user's intention is "take profit" or "stop loss" (TP/SL) for existing positions.
  - trigger_price: Optional. The price at which the order should be triggered (e.g., "30000" for $30,000) (required for stop-limit orders).
`;
  schema = CreateDerivativeMarketOrderInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof CreateDerivativeMarketOrderInputSchema>,
  ): Promise<string> {
    try {
      const order = await this.injectiveKit.createDerivativeMarketOrder(
        input.network,
        input.ticker,
        input.order_type,
        input.quantity,
        input.leverage,
        input.slippage,
        input.market_id,
        input.subaccount_index,
        input.margin,
        input.trigger_price,
      );
      if (!order) {
        throw new Error("Order creation failed");
      }
      return JSON.stringify({
        status: "success",
        order,
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
