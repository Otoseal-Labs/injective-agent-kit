import { Position } from "@injectivelabs/sdk-ts";

function formatNumber(value: string, decimals = 6): string {
  const num = parseFloat(value);
  return (num / 1e6).toFixed(decimals);
}

export function formatDisplayPositions(
  positions: Position[],
): (Position & { unrealizedPnl: string })[] {
  return positions.map((pos) => {
    const unrealizedPnl =
      (parseFloat(pos.markPrice) - parseFloat(pos.entryPrice)) *
      parseFloat(pos.quantity);
    return {
      ...pos,
      entryPrice: formatNumber(pos.entryPrice),
      margin: formatNumber(pos.margin),
      liquidationPrice: formatNumber(pos.liquidationPrice),
      markPrice: formatNumber(pos.markPrice),
      unrealizedPnl: formatNumber(unrealizedPnl.toString()),
    };
  });
}
