export * from './erc20';

import type { InjectiveEVMAgentKit } from "../agent";
import {
  InjectiveERC20BalanceTool,
  InjectiveERC20TransferTool,
} from './index';

export function createInjectiveTools(
  injectiveKit: InjectiveEVMAgentKit
) {
  return [
    new InjectiveERC20BalanceTool(injectiveKit),
    new InjectiveERC20TransferTool(injectiveKit)
  ];
}