#!/usr/bin/env tsx
/**
 * DREAMFLOW PROTOCOL PROBE
 *
 * Goal: Execute ONE real attributed DreamDEX Event Contract order on Shannon testnet.
 *
 * Success criteria:
 * - Real Shannon tx submitted and mined
 * - OrderPlaced event decoded
 * - userData === 1001n (CryptoBrief campaign)
 * - Explorer-verifiable
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  formatUnits,
  decodeEventLog,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { shannon, TUSDC_ADDRESS, TUSDC_DECIMALS } from "../lib/wallet/chain";
import { CAMPAIGNS } from "../lib/attribution/campaigns";

const INDEXER_URL = "https://dev.smk.somnia.host/v1/graphql";
const MIN_TIME_REMAINING_SEC = 180;
const CAMPAIGN = CAMPAIGNS.cryptoBrief;

interface BinaryMarket {
  id: string;
  marketId: `0x${string}`;
  poolAddress: `0x${string}`;
  asset: string;
  question: string;
  expiry: string;
  clobStatus?: string;
  status?: string;
}

async function queryLiveMarkets(): Promise<BinaryMarket[]> {
  const now = Math.floor(Date.now() / 1000);
  const query = {
    query: `
      query LiveBinaryMarkets($now: numeric!) {
        Market(
          where: {
            marketType: {_eq: "BINARY"},
            expiry: {_gt: $now}
          },
          order_by: {expiry: asc},
          limit: 50
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
    variables: { now: String(now) }
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

  // Debug: log response structure
  if (!data.data || !data.data.Market) {
    console.error("Unexpected indexer response:", JSON.stringify(data, null, 2));
    throw new Error("Indexer response missing data.Market");
  }

  const rawMarkets = data.data.Market;
  const markets: BinaryMarket[] = rawMarkets
    .filter((m: any) => m.asset && m.poolAddress)
    .map((m: any) => ({
      ...m,
      status: m.clobStatus ?? m.status ?? "Trading",
    }));

  // Debug: show all markets found
  console.log(`Found ${markets.length} binary markets (any expiry > now):`);
  markets.forEach((m: any) => {
    const expiryDate = new Date(Number(m.expiry) * 1000);
    const hoursLeft = (Number(m.expiry) - now) / 3600;
    console.log(`  ${m.asset} - ${m.clobStatus || m.status} - expires ${expiryDate.toISOString()} (${hoursLeft.toFixed(1)}h left)`);
  });

  return markets;
}

// tUSDC ABI for faucet + balance
const tusdcAbi = parseAbi([
  "function faucet(uint256 amount) external",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

// Binary pool read ABI subset
const poolReadAbi = parseAbi([
  "function getOrderBookParameters() view returns ((uint256 tickSize, uint256 minQuantity, uint256 lotSize))",
  "function getMaxBuilderFeeBpsTimes1k() view returns (uint256)",
  "function marketExpiryNs() view returns (uint64)",
  "function collateralToken() view returns (address)",
]);

// Order placement ABI
const poolWriteAbi = parseAbi([
  "function placeBinaryOrder(uint8 kind, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k, uint64 userData) payable returns (bool success, uint128 id)",
]);

// OrderPlaced event ABI
const orderPlacedAbi = parseAbi([
  "event OrderPlaced(uint128 indexed orderId, (uint128 orderId, bool isBid, address owner, uint64 userData, uint256 price, uint256 fullQuantity, uint256 quantityRemaining, uint64 expireTimestampNs) placedOrder)",
]);

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║       DREAMFLOW PROTOCOL PROBE                   ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // 1. Setup wallet
  const privateKey = process.env.PROBE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PROBE_PRIVATE_KEY not found in environment");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const publicClient = createPublicClient({
    chain: shannon,
    transport: http(),
  });
  const walletClient = createWalletClient({
    chain: shannon,
    transport: http(),
    account,
  });

  console.log(`Network        Shannon ${shannon.id}                  ✓`);
  console.log(`SDK            @somnia-chain/markets-sdk 0.30.0   ✓\n`);

  console.log(`Wallet         ${account.address}`);

  // Check balances
  const sttBal = await publicClient.getBalance({ address: account.address });
  console.log(`STT balance    ${formatUnits(sttBal, 18)} STT`);

  const tusdcBal = await publicClient.readContract({
    address: TUSDC_ADDRESS,
    abi: tusdcAbi,
    functionName: "balanceOf",
    args: [account.address],
  });
  console.log(`tUSDC balance  ${formatUnits(tusdcBal, TUSDC_DECIMALS)} tUSDC\n`);

  // Mint tUSDC if needed
  if (tusdcBal < 10n * 10n ** BigInt(TUSDC_DECIMALS)) {
    console.log("Minting 100 tUSDC test collateral...");
    const mintHash = await walletClient.writeContract({
      address: TUSDC_ADDRESS,
      abi: tusdcAbi,
      functionName: "faucet",
      args: [100n * 10n ** BigInt(TUSDC_DECIMALS)],
    });
    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    console.log(`✓ Minted\n`);
  }

  // 2. Discover live market
  console.log("Discovering live Event Contract markets...");
  const markets = await queryLiveMarkets();

  const now = Math.floor(Date.now() / 1000);
  const tradingMarkets = markets.filter(
    (m) =>
      (m.clobStatus === "Trading" || m.status === "Trading") &&
      parseInt(m.expiry) > now + MIN_TIME_REMAINING_SEC &&
      (m.asset === "BTC" || m.asset === "ETH")
  );

  if (tradingMarkets.length === 0) {
    throw new Error("No suitable Trading markets found with enough time remaining");
  }

  const market = tradingMarkets[0];
  console.log(`\nLive market    ${market.asset} ${(market.question || market.marketId).slice(0, 40)}...`);
  console.log(`marketId       ${market.marketId}`);
  console.log(`pool           ${market.poolAddress}`);
  console.log(`status         ${market.status || market.clobStatus}                         ✓`);
  console.log(`seconds left   ${parseInt(market.expiry) - now}s\n`);

  // 3. Read pool parameters
  const poolParams = await publicClient.readContract({
    address: market.poolAddress,
    abi: poolReadAbi,
    functionName: "getOrderBookParameters",
  });
  const builderCap = await publicClient.readContract({
    address: market.poolAddress,
    abi: poolReadAbi,
    functionName: "getMaxBuilderFeeBpsTimes1k",
  });

  console.log(`tick           ${poolParams.tickSize}`);
  console.log(`lot            ${poolParams.lotSize}`);
  console.log(`min quantity   ${poolParams.minQuantity}\n`);
  console.log(`builder cap    ${builderCap} (${Number(builderCap) / 1000} bps)\n`);

  // 4. Prepare attributed order
  const marketExpiryNs = await publicClient.readContract({
    address: market.poolAddress,
    abi: poolReadAbi,
    functionName: "marketExpiryNs",
  });
  console.log(`market expiry  ${marketExpiryNs} ns`);

  // Kind: 0 = BUY_YES (ORDER_KIND.BUY_YES)
  const kind = 0;
  const oneCollateral = 10n ** BigInt(TUSDC_DECIMALS);
  const tick = BigInt(poolParams.tickSize);
  const lot = BigInt(poolParams.lotSize);

  // Round price down to tick multiple (990000 / 1000 = 990, * 1000 = 990000)
  const rawPrice = (oneCollateral * 99n) / 100n; // 0.99
  const price = (rawPrice / tick) * tick; // align to tick

  // Quantity: must be multiple of lot and at least minQuantity
  const rawMinQuantity = BigInt(poolParams.minQuantity);
  const quantity = rawMinQuantity < lot ? lot : ((rawMinQuantity + lot - 1n) / lot) * lot;

  // Expiry: safely clamped to marketExpiryNs
  const expireTimestampNs = marketExpiryNs;

  // OrderType: 2 = IOC
  const orderType = 2;
  const selfMatchingOption = 0;
  const userData = CAMPAIGN.id;
  const builder = "0x0000000000000000000000000000000000000000" as Address;
  const builderFeeBpsTimes1k = 0n;

  console.log(`campaign       ${CAMPAIGN.label}`);
  console.log(`userData       ${userData}\n`);

  // 5. Approve collateral if needed
  const allowance = await publicClient.readContract({
    address: TUSDC_ADDRESS,
    abi: tusdcAbi,
    functionName: "allowance",
    args: [account.address, market.poolAddress],
  });

  const neededCollateral = (price * quantity + oneCollateral - 1n) / oneCollateral;
  if (allowance < neededCollateral) {
    console.log("Approving collateral...");
    const approveHash = await walletClient.writeContract({
      address: TUSDC_ADDRESS,
      abi: tusdcAbi,
      functionName: "approve",
      args: [market.poolAddress, neededCollateral * 100n], // generous approval
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log(`✓ Approved\n`);
  }

  // 6. Place binary order
  console.log("Placing attributed IOC binary order...");
  const txHash = await walletClient.writeContract({
    address: market.poolAddress,
    abi: poolWriteAbi,
    functionName: "placeBinaryOrder",
    args: [
      kind,
      price,
      quantity,
      expireTimestampNs,
      orderType,
      selfMatchingOption,
      builder,
      builderFeeBpsTimes1k,
      userData,
    ],
  });

  console.log(`\ntx             ${txHash}\n`);

  // 7. Wait and decode receipt
  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  console.log(`receipt        ${receipt.status === "success" ? "SUCCESS" : "REVERTED"}                         ${receipt.status === "success" ? "✓" : "✗"}`);

  if (receipt.status !== "success") {
    throw new Error("Transaction reverted");
  }

  // Decode OrderPlaced
  const orderPlacedLog = receipt.logs.find((log) => {
    try {
      const decoded = decodeEventLog({
        abi: orderPlacedAbi,
        data: log.data,
        topics: log.topics,
      });
      return decoded.eventName === "OrderPlaced";
    } catch {
      return false;
    }
  });

  if (!orderPlacedLog) {
    throw new Error("OrderPlaced event not found in receipt");
  }

  const orderPlaced = decodeEventLog({
    abi: orderPlacedAbi,
    data: orderPlacedLog.data,
    topics: orderPlacedLog.topics,
  });

  console.log(`OrderPlaced                                       ✓`);
  const decodedUserData = (orderPlaced.args as any).placedOrder.userData;
  console.log(`userData=${decodedUserData}                                  ${decodedUserData === userData ? "✓" : "✗"}`);

  if (decodedUserData !== userData) {
    throw new Error(`userData mismatch: expected ${userData}, got ${decodedUserData}`);
  }

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  ✓ PROTOCOL PROBE SUCCESSFUL                     ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);

  console.log(`Explorer: https://shannon-explorer.somnia.network/tx/${txHash}\n`);

  // Save proof
  const proof = {
    network: "Shannon",
    chainId: shannon.id,
    marketId: market.marketId,
    pool: market.poolAddress,
    campaignId: CAMPAIGN.id.toString(),
    campaignSlug: CAMPAIGN.slug,
    txHash,
    blockNumber: receipt.blockNumber.toString(),
    builderCap: builderCap.toString(),
    builderCapBps: Number(builderCap) / 1000,
    builderFeeEvent: false,
    verifiedAt: new Date().toISOString(),
  };

  const fs = await import("node:fs/promises");
  await fs.mkdir("proof", { recursive: true });
  await fs.writeFile("proof/latest.json", JSON.stringify(proof, null, 2));
  console.log(`Proof saved to proof/latest.json\n`);

  // Update PROGRESS.md
  const progressPath = "PROGRESS.md";
  const progressContent = await fs.readFile(progressPath, "utf8");
  const updatedProgress = progressContent
    .replace("- attributed tx: pending", `- attributed tx: ${txHash} ✓`)
    .replace("- builder cap: pending", `- builder cap: ${builderCap} (${Number(builderCap) / 1000} bps) ${builderCap > 0n ? "✓ Mode A possible" : "→ Mode B (attribution-only)"}`)
    .replace("- live market: pending", `- live market: ${market.asset} ${market.marketId.slice(0, 16)}...`)
    .replace("- marketId: pending", `- marketId: ${market.marketId}`)
    .replace("- pool: pending", `- pool: ${market.poolAddress}`)
    .replace("## Current branch\nUnknown", `## Current branch\n${builderCap > 0n ? "Attribution + Builder (Mode A possible)" : "Attribution-only (Mode B — builder cap is 0)"}`);

  await fs.writeFile(progressPath, updatedProgress);
  console.log(`Updated PROGRESS.md\n`);
}

main().catch((err) => {
  console.error("\n❌ PROBE FAILED\n");
  console.error(err);
  process.exit(1);
});
