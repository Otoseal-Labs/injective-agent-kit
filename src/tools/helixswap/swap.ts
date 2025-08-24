import { InjectiveAgentKit } from "../../agent";
import {
  HELIX_TRADING_SWAP_CONTRACT_MAINNET,
  HELIX_TRADING_SWAP_CONTRACT_TESTNET,
} from "../../commons";
import {
  broadcastTxWithPk,
  getExpectedOutputAmount,
  getSwapTokenInfoBySymbol,
} from "../../utils";
import {
  ExecArgSwapMinOutput,
  MsgExecuteContractCompat,
  spotQuantityToChainQuantityToFixed,
} from "@injectivelabs/sdk-ts";

/**
 * Swap an amount of input token to output token using swapMinOutput method of the Helix swap router contract
 * @param agent InjectiveAgentKit instance
 * @param network The network to use (e.g., "TESTNET" or "MAINNET")
 * @param inputToken The input token want to swap (e.g., "INJ", "USDT")
 * @param outputToken The output token want to swap (e.g., "INJ", "USDT")
 * @param inputAmount The amount of input token to swap (e.g., "10")
 * @param slippage The slippage tolerance for the swap (e.g., "1" for 1% slippage)
 * @returns Promise with the transaction result
 */
export async function helixSwapMinOutput(
  agent: InjectiveAgentKit,
  network: string,
  inputToken: string,
  outputToken: string,
  inputAmount: string,
  slippage?: string,
): Promise<string> {
  console.log(
    `Swapping ${inputAmount} ${inputToken} to ${outputToken} on ${network}...`,
  );

  const isTestnet = network === "TESTNET";
  const helixSwapContractAddress = isTestnet
    ? HELIX_TRADING_SWAP_CONTRACT_TESTNET
    : HELIX_TRADING_SWAP_CONTRACT_MAINNET;

  try {
    const inputTokenInfo = getSwapTokenInfoBySymbol(isTestnet, inputToken);
    if (!inputTokenInfo) {
      throw new Error(`Input token ${inputToken} not found`);
    }

    const outputTokenInfo = getSwapTokenInfoBySymbol(isTestnet, outputToken);
    if (!outputTokenInfo) {
      throw new Error(`Output token ${outputToken} not found`);
    }

    const expectedOutputAmount = await getExpectedOutputAmount(
      isTestnet,
      helixSwapContractAddress,
      inputTokenInfo.denom,
      outputTokenInfo.denom,
      Number(inputAmount),
      inputTokenInfo.decimals,
    );

    const minimumOutput =
      ((100 - Number(slippage || 0)) *
        Number(expectedOutputAmount.resultQuantity)) /
      100;
    const execArgs = ExecArgSwapMinOutput.fromJSON({
      targetDenom: outputTokenInfo.denom,
      minOutputQuantity: minimumOutput.toString(),
    });

    const swapMessage = MsgExecuteContractCompat.fromJSON({
      contractAddress: helixSwapContractAddress,
      sender: agent.injWalletAddress,
      funds: {
        denom: inputTokenInfo.denom,
        amount: spotQuantityToChainQuantityToFixed({
          value: inputAmount,
          baseDecimals: inputTokenInfo.decimals,
        }),
      },
      execArgs,
    });

    console.log("Broadcasting transaction...");
    const tx = await broadcastTxWithPk(
      isTestnet,
      agent.privateKey,
      swapMessage,
    );

    return `Swapped ${inputAmount} ${inputToken} for at least ${minimumOutput / 10 ** outputTokenInfo.decimals} ${outputToken} on ${network}.\nTransaction hash: ${tx.txHash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
