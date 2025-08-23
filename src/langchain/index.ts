export * from "./erc20";
export * from "./winj9";
export * from "./staking";
export * from "./derivative";

import type { InjectiveAgentKit } from "../agent";
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
  CreateDerivativeMarketOrderTool,
  CreateDerivativeLimitOrderTool,
  FetchPositionsTool,
} from "./index";

export function createInjectiveTools(injectiveKit: InjectiveAgentKit) {
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
    new CreateDerivativeMarketOrderTool(injectiveKit),
    new CreateDerivativeLimitOrderTool(injectiveKit),
    new FetchPositionsTool(injectiveKit),
  ];
}
