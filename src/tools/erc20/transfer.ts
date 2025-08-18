import { InjectiveAgentKit } from "../../agent";
import { injectiveTestnet } from "../../utils/viem/injective";
import { Account, Address, erc20Abi, isAddress } from "viem";
import { getTokenDecimals, formatToken } from "../../utils/index";

/**
 * Transfer INJ tokens or ERC-20 tokens
 * @param agent InjectiveAgentKit instance
 * @param network The network to use (e.g., "TESTNET" or "MAINNET")
 * @param amount Amount to transfer as a string (e.g., "1.5" for 1.5 tokens)
 * @param recipient Recipient address
 * @param ticker Optional token ticker (if not provided, transfers native INJ)
 * @returns Promise with transaction result
 */
export async function ERC20Transfer(
  agent: InjectiveAgentKit,
  network: string,
  amount: string,
  recipient: Address,
  ticker?: string,
): Promise<string> {
  console.log(
    `Transferring ${amount} ${ticker || "INJ"} to ${recipient} on ${network}...`,
  );
  const walletClient = agent.getWalletClient(network);
  const publicClient = agent.getPublicClient(network);

  if (Number(amount) <= 0) {
    const errorMsg = "Transfer amount must be greater than 0";
    throw new Error(errorMsg);
  }

  if (!isAddress(recipient)) {
    const errorMsg = `Invalid recipient address: ${recipient}`;
    throw new Error(errorMsg);
  }

  if (!walletClient) {
    const errorMsg = "Wallet client is not initialized";
    throw new Error(errorMsg);
  }

  try {
    const account = walletClient.account as Account;
    if (!account) {
      throw new Error("Wallet account is not initialized");
    }

    // Native token transfer case
    if (!ticker || ticker.toUpperCase() === "INJ") {
      if (!publicClient) {
        throw new Error("Public client is not initialized");
      }

      const formattedAmount = formatToken(amount, 18);
      if (!formattedAmount) {
        throw new Error("Failed to format amount");
      }

      const injectiveBalance = await agent.getERC20Balance(network);
      if (Number(injectiveBalance) < Number(amount)) {
        throw new Error(
          `Insufficient INJ balance, need: ${amount}, have: ${injectiveBalance}`,
        );
      }

      const hash = await walletClient.sendTransaction({
        account,
        chain: injectiveTestnet,
        to: recipient,
        value: formattedAmount,
      });

      if (!hash) {
        throw new Error("Transaction failed to send");
      }

      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      if (!transactionReceipt || transactionReceipt.status === "reverted") {
        const errorMsg = `Transaction failed: ${JSON.stringify(transactionReceipt)}`;
        throw new Error(errorMsg);
      }

      return `Transferred ${amount} to ${recipient}.\nTransaction hash for the transfer: ${hash}, receipt: ${transactionReceipt?.transactionHash}`;
    }

    // ERC-20 token transfer case
    if (typeof ticker !== "string" || ticker.trim() === "") {
      throw new Error("Valid ticker is required for token transfers");
    }

    const tokenAddress = agent.getTokenAddressFromTicker(ticker.toUpperCase());
    if (!tokenAddress) {
      const errorMsg = `No token found for ticker: ${ticker.toUpperCase()}`;
      console.error(`Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const decimals = await getTokenDecimals(publicClient, tokenAddress);
    if (decimals === null || decimals === undefined) {
      throw new Error(
        `Failed to retrieve token decimals for contract: ${tokenAddress}`,
      );
    }

    const formattedAmount = formatToken(amount, decimals);
    if (!formattedAmount) {
      throw new Error("Failed to format token amount");
    }

    const tokenBalance = await agent.getERC20Balance(network, tokenAddress);
    if (Number(tokenBalance) < Number(amount)) {
      throw new Error(
        `Insufficient balance of ${ticker.toUpperCase()}, need: ${amount}, have: ${tokenBalance}`,
      );
    }
    const hash = await walletClient.writeContract({
      account,
      chain: injectiveTestnet,
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipient, formattedAmount],
    });

    if (!hash) {
      throw new Error("Token transfer transaction failed to send");
    }

    return `Transferred ${amount} ${ticker.toUpperCase()} to ${recipient}.\nTransaction hash for the transfer: ${hash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error?.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
