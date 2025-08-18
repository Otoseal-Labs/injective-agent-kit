import { StructuredTool } from "@langchain/core/tools";
import { InjectiveAgentKit } from "../../agent";
import { Address } from "viem";
import { z } from "zod";
import { getTokenAddressByDenom } from "../../utils";

const InjectiveERC20BalanceInputSchema = z.object({
  network: z.string().default("MAINNET"),
  contract_address: z.string().optional(),
  ticker: z.string().optional(),
});

export class InjectiveERC20BalanceTool extends StructuredTool<
  typeof InjectiveERC20BalanceInputSchema
> {
  name = "injective_erc20_balance";
  description = `Get the balance of ERC20 tokens in a Injective wallet.

  This tool retrieves token balances without requiring a wallet address (uses connected wallet).

  If neither parameter is provided, returns ticker is the native INJ token balance.

  Parameters:
  - network: The network to use (e.g., "TESTNET" or "MAINNET") (required). Default is "MAINNET" if network param is not provided.
  - contract_address: Optional. The contract address of the token.
  - ticker: Optional. The token symbol/ticker. Must be in uppercase (e.g., "USDC").
  `;
  schema = InjectiveERC20BalanceInputSchema;

  constructor(private readonly injectiveKit: InjectiveAgentKit) {
    super();
  }

  protected async _call(
    input: z.infer<typeof InjectiveERC20BalanceInputSchema>,
  ): Promise<string> {
    try {
      let balance;

      if (!input.contract_address) {
        if (input.ticker) {
          if (input.ticker.toUpperCase() === "INJ") {
            balance = await this.injectiveKit.getERC20Balance(input.network);
          } else {
            const contract_address = getTokenAddressByDenom(
              input.ticker.toUpperCase(),
            );
            if (!contract_address) {
              throw new Error(
                `Token with ticker ${input.ticker.toUpperCase()} not found in token list`,
              );
            }
            balance = await this.injectiveKit.getERC20Balance(
              input.network,
              contract_address as Address,
            );
          }
        } else {
          balance = await this.injectiveKit.getERC20Balance(input.network);
        }
      } else {
        balance = await this.injectiveKit.getERC20Balance(
          input.network,
          input.contract_address as Address,
        );
      }

      return JSON.stringify({
        status: "success",
        balance,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
