import type { Campaign } from "./campaigns";
import type { BinaryMarket } from "../dreamdex/markets";

/**
 * Verified attribution record - created only after on-chain verification.
 */
export type VerifiedAttributionRecord = {
  version: 1;
  chainId: number;
  txHash: `0x${string}`;
  blockNumber: string;
  timestamp: number;

  marketId: `0x${string}`;
  pool: `0x${string}`;
  marketAsset: string;
  marketQuestion: string;

  owner: `0x${string}`;
  orderId?: string;

  campaignId: string;
  campaignSlug: string;
  campaignLabel: string;

  side: "UP" | "DOWN";
  price?: string;
  quantity?: string;

  filledQuantity?: string;
  fillPrice?: string;
  quoteVolume?: string;

  builderAddress?: `0x${string}`;
  builderCapRaw: string;
  builderFeeRaw?: string;
  builderFeeToken?: `0x${string}`;

  verifiedAt: number;
};

/**
 * Storage key for localStorage.
 */
const STORAGE_KEY = "dreamflow:verified_orders";

/**
 * Save a verified attribution record to localStorage.
 */
export function saveVerifiedRecord(record: VerifiedAttributionRecord): void {
  if (typeof window === "undefined") return;

  const existing = loadVerifiedRecords();
  const updated = [record, ...existing];

  // Keep last 100 records
  const trimmed = updated.slice(0, 100);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save verified record:", err);
  }
}

/**
 * Load all verified attribution records from localStorage.
 */
export function loadVerifiedRecords(): VerifiedAttributionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load verified records:", err);
    return [];
  }
}

/**
 * Get a verified record by tx hash.
 */
export function getVerifiedRecord(
  txHash: string
): VerifiedAttributionRecord | undefined {
  const records = loadVerifiedRecords();
  return records.find((r) => r.txHash.toLowerCase() === txHash.toLowerCase());
}

/**
 * Clear all verified records (dev/testing only).
 */
export function clearVerifiedRecords(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Aggregate metrics from verified records.
 */
export function getAggregateMetrics() {
  const records = loadVerifiedRecords();

  const verifiedOrders = records.length;

  const filledRecords = records.filter((r) => r.filledQuantity && r.quoteVolume);
  const filledVolume = filledRecords.reduce(
    (sum, r) => sum + parseFloat(r.quoteVolume || "0"),
    0
  );

  const activeCampaigns = new Set(records.map((r) => r.campaignSlug)).size;

  const builderFees = records.reduce(
    (sum, r) => sum + parseFloat(r.builderFeeRaw || "0"),
    0
  );

  return {
    verifiedOrders,
    filledVolume,
    activeCampaigns,
    builderFees,
  };
}
