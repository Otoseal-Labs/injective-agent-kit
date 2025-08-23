import {
  DerivativeMarket,
  IndexerGrpcDerivativesApi,
  TradeDirection,
} from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";

export async function getDerivativeMarketFromTicker(
  isTestnet: boolean,
  ticker: string,
): Promise<DerivativeMarket> {
  const endpoints = getNetworkEndpoints(
    isTestnet ? Network.Testnet : Network.Mainnet,
  );
  const indexerGrpcDerivativesApi = new IndexerGrpcDerivativesApi(
    endpoints.indexer,
  );
  const derivativeMarkets = await indexerGrpcDerivativesApi.fetchMarkets();

  const market = derivativeMarkets.find((market) => market.ticker === ticker);
  if (!market) {
    throw new Error(`Market not found for ticker: ${ticker}`);
  }

  return market;
}

export async function getDerivativeMarketByMarketId(
  isTestnet: boolean,
  marketId: string,
): Promise<DerivativeMarket> {
  const endpoints = getNetworkEndpoints(
    isTestnet ? Network.Testnet : Network.Mainnet,
  );
  const indexerGrpcDerivativesApi = new IndexerGrpcDerivativesApi(
    endpoints.indexer,
  );
  const market = await indexerGrpcDerivativesApi.fetchMarket(marketId);

  if (!market) {
    throw new Error(`Market not found for marketId: ${marketId}`);
  }

  return market;
}

export async function getWorstPriceForDerivativeMarket(
  isTestnet: boolean,
  market: DerivativeMarket,
  isBuy: boolean,
  slippage: number = 0.01,
): Promise<string> {
  const endpoints = getNetworkEndpoints(
    isTestnet ? Network.Testnet : Network.Mainnet,
  );
  const indexerGrpcDerivativesApi = new IndexerGrpcDerivativesApi(
    endpoints.indexer,
  );

  const orderbook = await indexerGrpcDerivativesApi.fetchOrderbookV2(
    market.marketId,
  );
  if (!orderbook) {
    throw new Error(`Orderbook not found for market: ${market.marketId}`);
  }

  const hasBuys = orderbook.buys && orderbook.buys.length > 0;
  const hasSells = orderbook.sells && orderbook.sells.length > 0;

  if (!hasBuys && !hasSells) {
    throw new Error(`Orderbook empty for market: ${market.marketId}`);
  }

  let worstPrice: string;

  if (isBuy) {
    if (!hasSells) {
      throw new Error("No sell orders available");
    }
    const bestAsk = Number(orderbook.sells[0].price);
    worstPrice = (bestAsk * (1 + slippage)).toString();
  } else {
    if (!hasBuys) {
      throw new Error("No buy orders available");
    }
    const bestBid = Number(orderbook.buys[0].price);
    worstPrice = (bestBid * (1 - slippage)).toString();
  }

  return worstPrice;
}

export async function fetchPositions(
  isTestnet: boolean,
  marketIds?: string[],
  subaccountId?: string,
  direction?: TradeDirection,
) {
  const endpoints = getNetworkEndpoints(
    isTestnet ? Network.Testnet : Network.Mainnet,
  );
  const indexerGrpcDerivativesApi = new IndexerGrpcDerivativesApi(
    endpoints.indexer,
  );

  const params: {
    marketIds?: string[];
    subaccountId?: string;
    direction?: TradeDirection;
  } = {};

  if (marketIds !== undefined) {
    params.marketIds = marketIds;
  }
  if (subaccountId !== undefined) {
    params.subaccountId = subaccountId;
  }
  if (direction !== undefined) {
    params.direction = direction;
  }

  return indexerGrpcDerivativesApi.fetchPositions(params);
}

export function normalizeTickSize(
  quantity: number,
  minTickSize: number,
): number {
  return Math.floor(quantity / minTickSize) * minTickSize;
}
