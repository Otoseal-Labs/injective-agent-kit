import { InjectiveAgentKit } from "../../agent";
import {
  getDefaultSubaccountId,
  getSubaccountId,
  TradeDirection,
} from "@injectivelabs/sdk-ts";
import {
  fetchPositions as fetchPos,
  getDerivativeMarketFromTicker,
} from "../../utils";
import { formatDisplayPositions } from "../../utils/formatDisplayPosition";

/**
 * Fetches the positions for a user on a specific network.
 * @param agent The InjectiveAgentKit instance.
 * @param network The network to fetch positions from (e.g., "MAINNET" or "TESTNET").
 * @param tickers Optional. An array of ticker symbols to fetch multiple positions.
 * @param subaccountIndex Optional. The subaccount index to use for fetching positions.
 * @param direction Optional. The direction of the positions to fetch (e.g., "buy" or "sell").
 * @returns Promise with the fetched positions.
 */
export async function fetchPositions(
  agent: InjectiveAgentKit,
  network: string,
  tickers?: string[],
  subaccountIndex?: string,
  direction?: "buy" | "sell" | "long" | "short",
): Promise<string> {
  const userInjWallet = agent.injWalletAddress;
  console.log(`Fetching positions for ${userInjWallet} on ${network}...`);

  const isTestnet = network === "TESTNET";

  const subaccountIdToUse = subaccountIndex
    ? getSubaccountId(userInjWallet, Number(subaccountIndex))
    : getDefaultSubaccountId(userInjWallet);

  const marketIds = tickers
    ? await Promise.all(
        tickers.map((t) =>
          getDerivativeMarketFromTicker(isTestnet, t).then((m) => m.marketId),
        ),
      )
    : undefined;

  try {
    const position = await fetchPos(
      isTestnet,
      marketIds,
      subaccountIdToUse,
      direction as TradeDirection | undefined,
    );

    console.log("Positions fetched successfully:", position.positions);
    return `Positions of ${userInjWallet} on ${network}: ${JSON.stringify(formatDisplayPositions(position.positions))}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
