import { parseAbi, type Address } from "viem";

/**
 * tUSDC ERC20 ABI subset for faucet + standard ERC20 operations.
 */
export const tusdcAbi = parseAbi([
  "function faucet(uint256 amount) external",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
]);

/**
 * Binary pool read ABI - for querying pool parameters.
 * Subset of binaryPoolReadAbi from markets-sdk.
 */
export const binaryPoolReadAbi = parseAbi([
  "function getOrderBookParameters() view returns ((uint256 tickSize, uint256 minQuantity, uint256 lotSize))",
  "function getMaxBuilderFeeBpsTimes1k() view returns (uint256)",
  "function getEffectiveBuilderApproval(address user, address builder) view returns (uint256)",
  "function marketExpiryNs() view returns (uint64)",
  "function collateralToken() view returns (address)",
]);

/**
 * Binary pool write ABI - for placing orders and approving builders.
 * Uses actual SDK signature: placeOrder(bool isBid, uint64 userData, ...)
 */
export const binaryPoolWriteAbi = parseAbi([
  "function placeBinaryOrder(uint8 kind, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k, uint64 userData) payable returns (bool success, uint128 id)",
  "function approveBuilder(address builder, uint256 maxFeeBpsTimes1k) external",
]);

/**
 * OrderPlaced event ABI for decoding attribution.
 */
export const orderPlacedEventAbi = parseAbi([
  "event OrderPlaced(uint128 indexed orderId, (uint128 orderId, bool isBid, address owner, uint64 userData, uint256 price, uint256 fullQuantity, uint256 quantityRemaining, uint64 expireTimestampNs) placedOrder)",
]);

/**
 * OrderFilled event ABI for decoding fills.
 */
export const orderFilledEventAbi = parseAbi([
  "event OrderFilled(uint128 indexed orderId, (uint128 orderId, address owner, uint64 userData, bool isBid, uint256 price, uint256 quantity) fill)",
]);

/**
 * BuilderFeeCharged event ABI (if available).
 */
export const builderFeeChargedEventAbi = parseAbi([
  "event BuilderFeeCharged(address indexed builder, address token, uint256 amount)",
]);

export type BinarySide = "BUY_YES" | "SELL_YES" | "BUY_NO" | "SELL_NO";

/**
 * Map BinarySide to pool kind parameter.
 * BUY_YES = 0, SELL_YES = 1, BUY_NO = 2, SELL_NO = 3
 */
export function sideToKind(side: BinarySide): number {
  const map: Record<BinarySide, number> = {
    BUY_YES: 0,
    SELL_YES: 1,
    BUY_NO: 2,
    SELL_NO: 3,
  };
  return map[side];
}

/**
 * Order types for DreamDEX.
 */
export const OrderType = {
  GTC: 0,
  FOK: 1,
  IOC: 2,
  PO: 3,
} as const;
