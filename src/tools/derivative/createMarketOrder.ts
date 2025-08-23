import { InjectiveAgentKit } from "../../agent";
import {
  broadcastTxWithPk,
  getDerivativeMarketByMarketId,
  getWorstPriceForDerivativeMarket,
  normalizeQuantity,
} from "../../utils";
import {
  derivativeMarginToChainMarginToFixed,
  derivativePriceToChainPriceToFixed,
  derivativeQuantityToChainQuantityToFixed,
  getDefaultSubaccountId,
  getSubaccountId,
  getDerivativeMarketTensMultiplier,
  MsgCreateDerivativeMarketOrder,
  PerpetualMarket,
} from "@injectivelabs/sdk-ts";
import { getDerivativeMarketFromTicker } from "../../utils";

/**
 * Create a derivative market order on Injective exchange
 * @param agent InjectiveAgentKit instance
 * @param network The network to use (e.g., "TESTNET" or "MAINNET")
 * @param ticker The ticker symbol of the derivative market (e.g., "BTC/USDT")
 * @param orderType The type of order to create (e.g., "BUY", "SELL")
 * @param quantity The quantity of the asset to buy/sell (e.g., "0.1" for 0.1 BTC)
 * @param leverage The leverage to use for the order (e.g., "5" for 5x leverage)
 * @param slippage The slippage tolerance for the order as a percentage (e.g., "1" for 1% slippage)
 * @param marketId The unique identifier of the derivative market
 * @param subaccountIndex The index of the subaccount to use for the order
 * @param margin The margin to use for the order (e.g., "100" for $100 margin)
 * @param triggerPrice The price at which the order should be triggered (e.g., "30000" for $30,000)
 * @returns Promise with the transaction result
 */
export async function createDerivativeMarketOrder(
  agent: InjectiveAgentKit,
  network: string,
  ticker: string,
  orderType: number,
  quantity: string,
  leverage: string,
  slippage: string,
  marketId?: string,
  subaccountIndex?: string,
  margin?: string,
  triggerPrice?: string,
): Promise<string> {
  console.log(
    `Creating derivative market order for ${quantity} ${ticker} on ${network}...`,
  );

  const userInjWallet = agent.injWalletAddress;

  const isTestnet = network === "TESTNET";
  const isBuy =
    orderType === 1 || orderType === 3 || orderType === 5 || orderType === 7;

  const derivativeMarket = marketId
    ? await getDerivativeMarketByMarketId(isTestnet, marketId)
    : await getDerivativeMarketFromTicker(isTestnet, ticker);

  const subaccountIdToUse = subaccountIndex
    ? getSubaccountId(userInjWallet, Number(subaccountIndex))
    : getDefaultSubaccountId(userInjWallet);

  const slippageToUse = Number(slippage) / 100;

  const quoteDecimals = derivativeMarket.quoteToken?.decimals || 6;

  const priceToUse =
    Number(
      await getWorstPriceForDerivativeMarket(
        isTestnet,
        derivativeMarket,
        isBuy,
        slippageToUse,
      ),
    ) /
    10 ** quoteDecimals;

  const initialMarginRatio = Number(
    (derivativeMarket as PerpetualMarket).initialMarginRatio,
  );

  if (Number(leverage) <= 0) {
    const errorMsg = "Leverage must be greater than 0";
    throw new Error(errorMsg);
  }

  if (Number(leverage) > 1 / initialMarginRatio) {
    throw new Error(
      `${leverage}x leverage is above the maximum leverage allowed: (${1 / initialMarginRatio}x)`,
    );
  }

  if (Number(quantity) <= 0) {
    const errorMsg = "Order quantity must be greater than 0";
    throw new Error(errorMsg);
  }

  const normalizedQuantity = normalizeQuantity(
    Number(quantity),
    derivativeMarket.minQuantityTickSize,
  );

  if (normalizedQuantity <= 0) {
    throw new Error(
      `Order quantity (${quantity}) is too small. Minimum allowed is ${derivativeMarket.minQuantityTickSize}`,
    );
  }

  const marginToUse = margin
    ? Number(margin) / 10 ** quoteDecimals
    : (Number(priceToUse) * normalizedQuantity) / Number(leverage);

  const triggerPriceToUse = triggerPrice ? triggerPrice : "0";

  const tensMultiplier = getDerivativeMarketTensMultiplier({
    quoteDecimals,
    minPriceTickSize: derivativeMarket.minPriceTickSize,
    minQuantityTickSize: derivativeMarket.minQuantityTickSize,
  });

  try {
    const msg = MsgCreateDerivativeMarketOrder.fromJSON({
      orderType,
      triggerPrice: derivativePriceToChainPriceToFixed({
        value: triggerPriceToUse,
        tensMultiplier: tensMultiplier.priceTensMultiplier,
        quoteDecimals,
      }),
      injectiveAddress: userInjWallet,
      price: derivativePriceToChainPriceToFixed({
        value: priceToUse,
        tensMultiplier: tensMultiplier.priceTensMultiplier,
        quoteDecimals,
      }),
      quantity: derivativeQuantityToChainQuantityToFixed({
        value: normalizedQuantity,
      }),
      margin: derivativeMarginToChainMarginToFixed({
        value: marginToUse,
        quoteDecimals,
        tensMultiplier: tensMultiplier.priceTensMultiplier,
      }),
      marketId: derivativeMarket.marketId,
      feeRecipient: agent.feeRecipient,
      subaccountId: subaccountIdToUse,
      cid: `injective-agent-kit-${Date.now()}`,
    });
    console.log(msg);

    console.log("Broadcasting transaction...");
    const tx = await broadcastTxWithPk(isTestnet, agent.privateKey, msg);

    return `Created derivative market order for ${quantity} ${ticker} on ${network}.\nTransaction hash: ${tx.txHash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
