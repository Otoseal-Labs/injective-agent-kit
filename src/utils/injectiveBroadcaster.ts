import { Network } from "@injectivelabs/networks";
import { MsgBroadcasterWithPk, TxResponse } from "@injectivelabs/sdk-ts";

export async function broadcastTxWithPk(
  isTestnet: boolean,
  privateKey: string,
  msg: any,
): Promise<TxResponse> {
  const network = isTestnet ? Network.Testnet : Network.Mainnet;
  return await new MsgBroadcasterWithPk({
    privateKey,
    network,
  }).broadcast({
    msgs: msg,
  });
}
