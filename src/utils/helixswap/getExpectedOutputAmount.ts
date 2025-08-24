import {
  ChainGrpcWasmApi,
  QueryOutputQuantity,
  SwapQueryTransformer,
} from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";
import { checkAvailableRoute } from "./checkAvailableRoute";

export async function getExpectedOutputAmount(
  isTestnet: boolean,
  helixSwapContractAddress: string,
  sourceDenom: string,
  targetDenom: string,
  inputAmount: number,
  inputTokenDecimals: number,
) {
  const endpoints = getNetworkEndpoints(
    isTestnet ? Network.Testnet : Network.Mainnet,
  );
  const wasmApi = new ChainGrpcWasmApi(endpoints.grpc);

  const isRouteAvailable = await checkAvailableRoute(
    isTestnet,
    helixSwapContractAddress,
    sourceDenom,
    targetDenom,
  );
  if (!isRouteAvailable) {
    throw new Error(
      `No available route for swap ${sourceDenom} to ${targetDenom}`,
    );
  }

  const queryOutputQuantityResponse = await wasmApi.fetchSmartContractState(
    helixSwapContractAddress,
    new QueryOutputQuantity({
      fromQuantity: (inputAmount * 10 ** Number(inputTokenDecimals)).toString(),
      sourceDenom,
      targetDenom,
    }).toPayload(),
  );
  const response =
    SwapQueryTransformer.contractQuantityResponseToContractQuantity(
      queryOutputQuantityResponse,
    );

  return response;
}
