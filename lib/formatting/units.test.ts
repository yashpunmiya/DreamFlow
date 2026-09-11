import { describe, test, expect } from "vitest";
import {
  formatTUSDC,
  parseTUSDC,
  formatBuilderFeeBps,
  truncateHash,
} from "./units";

describe("units", () => {
  test("formatTUSDC converts raw to human", () => {
    expect(formatTUSDC(1_000_000n)).toBe("1.00");
    expect(formatTUSDC(100_000_000n)).toBe("100.00");
    expect(formatTUSDC(1_234_567n)).toBe("1.234567");
  });

  test("parseTUSDC converts human to raw", () => {
    expect(parseTUSDC("1.0")).toBe(1_000_000n);
    expect(parseTUSDC(1.0)).toBe(1_000_000n);
    expect(parseTUSDC("100")).toBe(100_000_000n);
    expect(parseTUSDC(0.5)).toBe(500_000n);
  });

  test("formatBuilderFeeBps converts bps×1000 to percentage", () => {
    expect(formatBuilderFeeBps(25000)).toBe("0.25%");
    expect(formatBuilderFeeBps(100000)).toBe("1.00%");
    expect(formatBuilderFeeBps(0)).toBe("0.00%");
    expect(formatBuilderFeeBps(25000n)).toBe("0.25%");
  });

  test("truncateHash shortens addresses and hashes", () => {
    const hash = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateHash(hash)).toBe("0x1234...5678");
    expect(truncateHash(hash, 10, 6)).toBe("0x12345678...345678");
    expect(truncateHash("0x123", 6, 4)).toBe("0x123"); // too short
  });
});
