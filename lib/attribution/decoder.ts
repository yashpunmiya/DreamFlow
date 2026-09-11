import {
  decodeEventLog,
  type TransactionReceipt,
  type Log,
  type Address,
} from "viem";
import {
  orderPlacedEventAbi,
  orderFilledEventAbi,
  builderFeeChargedEventAbi,
} from "../dreamdex/abi";
import { getCampaignById, type Campaign } from "./campaigns";

export type DecodedOrderPlaced = {
  orderId: string;
  owner: Address;
  userData: bigint;
  isBid: boolean;
  price: bigint;
  fullQuantity: bigint;
  quantityRemaining: bigint;
  expireTimestampNs: bigint;
};

export type DecodedOrderFilled = {
  orderId: string;
  owner: Address;
  userData: bigint;
  isBid: boolean;
  price: bigint;
  quantity: bigint;
};

export type DecodedBuilderFee = {
  builder: Address;
  token: Address;
  amount: bigint;
};

export type AttributionVerificationResult = {
  verified: boolean;
  orderPlaced?: DecodedOrderPlaced;
  orderFilled?: DecodedOrderFilled;
  builderFee?: DecodedBuilderFee;
  campaign?: Campaign;
  error?: string;
};

/**
 * Verify attribution from a transaction receipt.
 * Decodes OrderPlaced, OrderFilled, BuilderFeeCharged events and validates userData.
 */
export function verifyAttributionFromReceipt(
  receipt: TransactionReceipt
): AttributionVerificationResult {
  if (receipt.status !== "success") {
    return { verified: false, error: "Transaction reverted" };
  }

  // Find OrderPlaced event
  let orderPlaced: DecodedOrderPlaced | undefined;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: orderPlacedEventAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName === "OrderPlaced") {
        const args = decoded.args as any;
        orderPlaced = {
          orderId: args.orderId.toString(),
          owner: args.placedOrder.owner,
          userData: args.placedOrder.userData,
          isBid: args.placedOrder.isBid,
          price: args.placedOrder.price,
          fullQuantity: args.placedOrder.fullQuantity,
          quantityRemaining: args.placedOrder.quantityRemaining,
          expireTimestampNs: args.placedOrder.expireTimestampNs,
        };
        break;
      }
    } catch {
      // Not an OrderPlaced event or decoding failed
      continue;
    }
  }

  if (!orderPlaced) {
    return { verified: false, error: "No OrderPlaced event found" };
  }

  // Check if userData corresponds to a known campaign
  const campaign = getCampaignById(orderPlaced.userData);
  if (!campaign) {
    return {
      verified: false,
      orderPlaced,
      error: `userData ${orderPlaced.userData} does not match any known campaign`,
    };
  }

  // Find OrderFilled event (optional)
  let orderFilled: DecodedOrderFilled | undefined;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: orderFilledEventAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName === "OrderFilled") {
        const args = decoded.args as any;
        if (args.orderId.toString() === orderPlaced.orderId) {
          orderFilled = {
            orderId: args.orderId.toString(),
            owner: args.fill.owner,
            userData: args.fill.userData,
            isBid: args.fill.isBid,
            price: args.fill.price,
            quantity: args.fill.quantity,
          };
          break;
        }
      }
    } catch {
      continue;
    }
  }

  // Find BuilderFeeCharged event (optional)
  let builderFee: DecodedBuilderFee | undefined;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: builderFeeChargedEventAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName === "BuilderFeeCharged") {
        const args = decoded.args as any;
        builderFee = {
          builder: args.builder,
          token: args.token,
          amount: args.amount,
        };
        break;
      }
    } catch {
      continue;
    }
  }

  return {
    verified: true,
    orderPlaced,
    orderFilled,
    builderFee,
    campaign,
  };
}

/**
 * Quick check: does this receipt contain an OrderPlaced event?
 */
export function hasOrderPlacedEvent(receipt: TransactionReceipt): boolean {
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: orderPlacedEventAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "OrderPlaced") return true;
    } catch {
      continue;
    }
  }
  return false;
}
