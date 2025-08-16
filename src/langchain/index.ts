export * from './erc20';
export * from './winj9';
export * from './staking';

import type { InjectiveEVMAgentKit } from "../agent";
import {
  InjectiveERC20BalanceTool,
  InjectiveERC20TransferTool,
  WrapINJTool, 
  UnwrapWINJTool,
  DelegateINJTool,
  RedelegateINJTool,
  UndelegateINJTool,
  WithdrawDelegatorRewardsTool,
  GetDelegationINJTool,
} from './index';

export function createInjectiveTools(
  injectiveKit: InjectiveEVMAgentKit
) {
  return [
    new InjectiveERC20BalanceTool(injectiveKit),
    new InjectiveERC20TransferTool(injectiveKit),
    new WrapINJTool(injectiveKit),
    new UnwrapWINJTool(injectiveKit),
    new DelegateINJTool(injectiveKit),
    new RedelegateINJTool(injectiveKit),
    new UndelegateINJTool(injectiveKit),
    new WithdrawDelegatorRewardsTool(injectiveKit),
    new GetDelegationINJTool(injectiveKit),
  ];
}