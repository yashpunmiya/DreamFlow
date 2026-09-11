import { TUSDC_DECIMALS } from "../wallet/chain";

/**
 * Convert raw tUSDC units (6 decimals) to human-readable string.
 */
export function formatTUSDC(raw: bigint): string {
  const units = Number(raw) / 10 ** TUSDC_DECIMALS;
  return units.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * Convert human tUSDC amount to raw units (6 decimals).
 */
export function parseTUSDC(human: string | number): bigint {
  const num = typeof human === "string" ? parseFloat(human) : human;
  return BigInt(Math.floor(num * 10 ** TUSDC_DECIMALS));
}

/**
 * Convert builder fee bps×1000 to human percentage.
 * Example: 25000 → "0.25%"
 */
export function formatBuilderFeeBps(bpsTimes1k: bigint | number): string {
  const bps = Number(bpsTimes1k) / 1000;
  const pct = bps / 100;
  return `${pct.toFixed(2)}%`;
}

/**
 * Truncate hash/address for display.
 * Example: 0x1234...5678
 */
export function truncateHash(hash: string, prefixLen = 6, suffixLen = 4): string {
  if (hash.length <= prefixLen + suffixLen) return hash;
  return `${hash.slice(0, prefixLen)}...${hash.slice(-suffixLen)}`;
}
