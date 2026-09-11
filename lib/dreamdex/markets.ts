import {
  type BinaryMarket,
  type BinaryMarketStatus,
} from "@somnia-chain/markets-sdk";
import { INDEXER_URL } from "./network";

export type { BinaryMarket, BinaryMarketStatus };

/**
 * Minimum time remaining (seconds) before market expiry to consider it tradable.
 */
const MIN_TIME_REMAINING_SEC = 180;

/**
 * Discover live binary Event Contract markets on Shannon.
 */
export async function discoverLiveMarkets(
  filter?: {
    asset?: string;
    limit?: number;
  }
): Promise<BinaryMarket[]> {
  const now = Math.floor(Date.now() / 1000);
  const query = {
    query: `
      query LiveBinaryMarkets($now: numeric!, $limit: Int!) {
        Market(
          where: {
            marketType: {_eq: "BINARY"},
            expiry: {_gt: $now}
          },
          order_by: {expiry: asc},
          limit: $limit
        ) {
          id
          marketId
          poolAddress
          asset
          question
          expiry
          clobStatus
        }
      }
    `,
    variables: {
      now: String(now),
      limit: filter?.limit ?? 50
    }
  };

  const response = await fetch(INDEXER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`Indexer request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const rawMarkets = data.data?.Market ?? [];

  let markets = rawMarkets
    .filter((m: any) => m.asset && m.poolAddress)
    .map((m: any) => ({
      ...m,
      status: (m.clobStatus ?? m.status ?? "Trading") as BinaryMarketStatus,
    }));

  // Filter by asset if specified
  if (filter?.asset) {
    markets = markets.filter((m: any) => m.asset === filter.asset);
  }

  return markets;
}

/**
 * Get the best tradable market for the demo.
 * Prefers BTC, then ETH, with Trading status and sufficient time remaining.
 */
export async function getBestDemoMarket(): Promise<BinaryMarket | null> {
  const markets = await discoverLiveMarkets({ limit: 50 });
  const now = Math.floor(Date.now() / 1000);

  const tradable = markets.filter(
    (m) =>
      m.status === "Trading" &&
      parseInt(m.expiry) > now + MIN_TIME_REMAINING_SEC
  );

  if (tradable.length === 0) return null;

  // Prefer BTC, then ETH, then any
  const btc = tradable.find((m) => m.asset === "BTC");
  if (btc) return btc;

  const eth = tradable.find((m) => m.asset === "ETH");
  if (eth) return eth;

  return tradable[0];
}

/**
 * Check if a market is currently tradable (Trading status + sufficient time).
 */
export function isMarketTradable(market: BinaryMarket): boolean {
  if (market.status !== "Trading") return false;
  const now = Math.floor(Date.now() / 1000);
  const expiry = parseInt(market.expiry);
  return expiry > now + MIN_TIME_REMAINING_SEC;
}

/**
 * Get seconds remaining until market expiry.
 */
export function getSecondsRemaining(market: BinaryMarket): number {
  const now = Math.floor(Date.now() / 1000);
  const expiry = parseInt(market.expiry);
  return Math.max(0, expiry - now);
}

/**
 * Format market display name.
 * Example: "BTC > $95,000 by 31 Dec 2026"
 */
export function formatMarketName(market: BinaryMarket): string {
  // Use question field, truncate if too long
  if (market.question.length <= 60) return market.question;
  return market.question.slice(0, 57) + "...";
}
