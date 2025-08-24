import {
  ChainGrpcWasmApi,
  SwapQueryTransformer,
  QueryRoute,
} from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";

export async function checkAvailableRoute(
  isTestnet: boolean,
  helixSwapContractAddress: string,
  sourceDenom: string,
  targetDenom: string,
): Promise<boolean> {
  const endpoints = getNetworkEndpoints(
    isTestnet ? Network.Testnet : Network.Mainnet,
  );
  const wasmApi = new ChainGrpcWasmApi(endpoints.grpc);
  const queryOutputQuantityResponse = await wasmApi.fetchSmartContractState(
    helixSwapContractAddress,
    new QueryRoute({
      sourceDenom,
      targetDenom,
    }).toPayload(),
  );
  const response = SwapQueryTransformer.contractRouteResponseToContractRoute(
    queryOutputQuantityResponse,
  );

  return response.steps.length > 0;
}
