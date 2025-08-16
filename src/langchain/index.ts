export * from './erc20';
export * from './winj9';

import type { InjectiveEVMAgentKit } from "../agent";
import {
  InjectiveERC20BalanceTool,
  InjectiveERC20TransferTool,
  WrapINJTool, 
  UnwrapWINJTool
} from './index';

export function createInjectiveTools(
  injectiveKit: InjectiveEVMAgentKit
) {
  return [
    new InjectiveERC20BalanceTool(injectiveKit),
    new InjectiveERC20TransferTool(injectiveKit),
    new WrapINJTool(injectiveKit),
    new UnwrapWINJTool(injectiveKit),
  ];
}