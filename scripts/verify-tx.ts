#!/usr/bin/env tsx
/**
 * CLI Transaction Verifier for DreamFlow Attribution
 * Usage: npx tsx scripts/verify-tx.ts [txHash]
 */

import { createPublicClient, http, isHex } from "viem";
import { shannon } from "../lib/wallet/chain";
import { verifyAttributionFromReceipt } from "../lib/attribution/decoder";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  let txHash = process.argv[2];

  if (!txHash) {
    const proofFile = resolve(process.cwd(), "proof/latest.json");
    if (existsSync(proofFile)) {
      const data = JSON.parse(readFileSync(proofFile, "utf8"));
      txHash = data.txHash;
      console.log(`No txHash provided. Using latest proof: ${txHash}\n`);
    } else {
      console.error("Usage: npm run verify:tx <txHash>");
      process.exit(1);
    }
  }

  if (!isHex(txHash)) {
    console.error("Error: Invalid transaction hash format (must be 0x-prefixed hex)");
    process.exit(1);
  }

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║     DREAMFLOW ON-CHAIN ATTRIBUTION VERIFIER      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  console.log(`Network:     Shannon Testnet (${shannon.id})`);
  console.log(`Transaction: ${txHash}\n`);
  console.log("Fetching receipt from Shannon RPC...");

  const publicClient = createPublicClient({
    chain: shannon,
    transport: http(),
  });

  const receipt = await publicClient.getTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  console.log(`Block:       ${receipt.blockNumber}`);
  console.log(`Status:      ${receipt.status === "success" ? "SUCCESS ✓" : "REVERTED ✗"}\n`);

  const result = verifyAttributionFromReceipt(receipt);

  if (result.verified && result.orderPlaced) {
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║  ✓ ATTRIBUTION VERIFIED ON-CHAIN                 ║");
    console.log("╚══════════════════════════════════════════════════╝\n");

    console.log(`Campaign:    ${result.campaign?.label || "Known Channel"} (${result.campaign?.slug || "custom"})`);
    console.log(`userData:    ${result.orderPlaced.userData.toString()} ✓`);
    console.log(`Order ID:    ${result.orderPlaced.orderId}`);
    console.log(`Owner:       ${result.orderPlaced.owner}`);
    console.log(`Side:        ${result.orderPlaced.isBid ? "BUY_YES (UP)" : "BUY_NO (DOWN)"}`);
    console.log(`Quantity:    ${result.orderPlaced.fullQuantity.toString()}`);
    console.log(`Price:       ${result.orderPlaced.price.toString()}`);
    console.log(`Explorer:    https://shannon-explorer.somnia.network/tx/${txHash}\n`);
  } else {
    console.error("❌ Attribution verification failed:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
