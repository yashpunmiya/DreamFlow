# DreamFlow Handoff Document

**Last updated:** 2026-09-11  
**Status:** Protocol probe ready, awaiting execution  
**Next person:** Can continue immediately from step "Run the Probe"

---

## Project Overview

**DreamFlow** is attribution + monetization infrastructure for DreamDEX Event Contracts. It uses DreamDEX's native `userData` field to attribute real on-chain orders to acquisition channels, and activates Builder Code monetization when the live pool permits it.

**Target:** Somnia × DreamDEX Event Contracts Hackathon  
**Network:** Shannon testnet (chain ID 50312)  
**Positioning:** Growth rails for DreamDEX — NOT another trading bot/AI agent/widget

**Core Innovation:**
- Uses `userData` (uint64) in DreamDEX orders as on-chain campaign identifier
- Example: CryptoBrief campaign → userData = 1001 → verifiable from OrderPlaced event
- Checks live pool `getMaxBuilderFeeBpsTimes1k()` to determine if Builder Code monetization is available
- Never fakes protocol capabilities or revenue

---

## Repository State

### What's Built

**Location:** `C:\Users\yyash\Coding\DreamFlow`

**Stack:**
- Next.js 16.3.4 (App Router, TypeScript strict, Tailwind)
- @somnia-chain/markets-sdk@0.30.0
- viem@2.56.3
- lucide-react, tsx, vitest

**Core Modules:**

1. **lib/wallet/chain.ts** — Shannon chain config, tUSDC constants
2. **lib/attribution/campaigns.ts** — Campaign IDs (1001=CryptoBrief, 2001=BossRaid, 3001=CreatorDemo)
3. **lib/formatting/units.ts** — tUSDC/builder fee formatting helpers
4. **scripts/setup-test-wallet.ts** — Generates local test wallet into .env.local
5. **scripts/check-balance.ts** — Checks STT balance of an address
6. **scripts/probe.ts** — **CRITICAL** — Places first real attributed order on Shannon
7. **notes/SDK_SURFACE.md** — Complete SDK analysis (userData only in trader.placeOrder, not exchange.createOrder)

**Tests:**
- `lib/attribution/campaigns.test.ts`
- `lib/formatting/units.test.ts`

**Scripts configured in package.json:**
- `npm run dev` — Next.js dev server
- `npm run build` — Production build
- `npm run typecheck` — TypeScript validation
- `npm test` — Vitest test suite
- `npm run probe` — **Execute protocol probe** (most important)
- `npm run verify:tx` — (placeholder, implement later for tx verification)

### Environment

**Wallet:**
- Address: `0x732d5b8794eBF323B1CE036A64a89Af08E5dfBD7`
- Private key stored in `.env.local` (gitignored)
- STT balance: 50 STT (funded)
- tUSDC balance: Will be minted by probe script

**Required env vars:**
- `PROBE_PRIVATE_KEY` — Auto-generated in .env.local by setup-test-wallet.ts
- `NEXT_PUBLIC_SHANNON_RPC_URL` — Optional (defaults to https://dream-rpc.somnia.network)
- `NEXT_PUBLIC_BUILDER_ADDRESS` — Optional, for Mode A (will generate if needed)

**Network endpoints:**
- RPC: https://dream-rpc.somnia.network
- Indexer: https://indexer.somnia.network/v1/graphql
- Explorer: https://shannon-explorer.somnia.network

---

## Current Milestone: PROTOCOL PROBE

**Goal:** Execute ONE real attributed DreamDEX Event Contract order on Shannon.

**Success criteria:**
- ✓ Real Shannon transaction submitted and mined
- ✓ OrderPlaced event emitted
- ✓ OrderPlaced.placedOrder.userData === 1001n
- ✓ Transaction visible in explorer
- ✓ Builder cap read from pool
- ✓ Mode determined (A or B)

### Run the Probe

```bash
cd C:\Users\yyash\Coding\DreamFlow
npm run probe
```

**What it does:**
1. Loads wallet from PROBE_PRIVATE_KEY
2. Checks STT and tUSDC balances
3. Mints 100 tUSDC if balance < 10
4. Calls `listLiveBinaryMarkets()` to find a Trading market (BTC or ETH preferred)
5. Filters for status="Trading" and expiry > now + 180 seconds
6. Reads pool: `getOrderBookParameters()`, `getMaxBuilderFeeBpsTimes1k()`
7. Approves tUSDC to pool if needed
8. Places IOC BUY_YES order:
   - `userData = 1001n` (CryptoBrief campaign)
   - `kind = 0` (BUY_YES)
   - `price = 0.99` (high enough to cross)
   - `quantity = minQuantity`
   - `orderType = 2` (IOC)
   - `builder = 0x0` and `builderFeeBpsTimes1k = 0` (attribution-only for first proof)
9. Waits for receipt, decodes OrderPlaced event
10. Verifies userData field matches 1001n
11. Saves proof to `proof/latest.json`
12. Updates `PROGRESS.md` with tx hash and mode determination

**Expected output:**
```
╔══════════════════════════════════════════════════╗
║       DREAMFLOW PROTOCOL PROBE                   ║
╚══════════════════════════════════════════════════╝

Network        Shannon 50312                  ✓
SDK            @somnia-chain/markets-sdk 0.30.0   ✓

Wallet         0x732d5b8794eBF323B1CE036A64a89Af08E5dfBD7
STT balance    50 STT
tUSDC balance  0 tUSDC

...

tx             0x...

receipt        SUCCESS                         ✓
OrderPlaced                                    ✓
userData=1001                                  ✓

╔══════════════════════════════════════════════════╗
║  ✓ PROTOCOL PROBE SUCCESSFUL                     ║
╚══════════════════════════════════════════════════╝

Explorer: https://shannon-explorer.somnia.network/tx/0x...
```

**If it fails:**
- Check wallet has STT for gas (should have 50)
- Check RPC is responding: `curl https://dream-rpc.somnia.network -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`
- Check if any Trading markets exist: Visit https://indexer.somnia.network/v1/graphql and query markets
- Read error carefully — most likely: no suitable market found (wait for new trading window), or pool parameters changed

**After success:**
- Check `proof/latest.json` — contains tx hash and builder cap
- Check `PROGRESS.md` — updated with proof tx
- If builderCap > 0: proceed to Mode A (attribution + builder)
- If builderCap == 0: proceed to Mode B (attribution-only)
- **DO NOT** fake builder revenue if cap is 0

---

## Next Steps After Probe Success

### Immediate (< 1 hour)

1. **Verify tx in explorer** — Confirm userData=1001 visible in logs
2. **Update PROGRESS.md** — Confirm mode (A or B) is recorded
3. **Create lib/dreamdex/* modules:**
   - `network.ts` — Export addresses, chain config
   - `sdk.ts` — SDK client initialization wrapper
   - `markets.ts` — Market discovery helpers (wrap listLiveBinaryMarkets)
   - `execution.ts` — Order placement with userData + builder support
   - `receipts.ts` — OrderPlaced/OrderFilled/BuilderFeeCharged decoders

### Phase 3: Core Frontend (2-3 hours)

**Priority 1: Trade page** (`app/trade/page.tsx`)
- Connect wallet (wagmi or raw viem)
- Display live market (BTC/ETH, countdown, status)
- Show campaign selector (CryptoBrief / BossRaid / CreatorDemo)
- Order panel: side (UP/DOWN), quantity, userData display
- Builder status: show cap, approval state if Mode A
- Place order button → confirm → receipt display

**Priority 2: Verified receipt UI**
- After tx: show "VERIFIED ON-CHAIN ✓"
- Display: Campaign, userData, OrderPlaced ✓, Fill status, Builder fee (if any)
- Explorer link
- Save to localStorage for dashboard

**Priority 3: Dashboard** (`app/dashboard/page.tsx`)
- Load verified orders from localStorage
- Display: Time, Campaign, Market, Side, Fill, Builder Fee, Tx
- Each row links to explorer
- Metrics: Verified orders, Filled volume, Active campaigns, Builder fees (all REAL, no fake data)

### Phase 4: Polish (1-2 hours)

**Landing page** (`app/page.tsx`)
- Hero: "Growth rails for DreamDEX"
- Subheading: attribute orders, verify conversions, monetize when available
- CTA: Try live demo → /trade
- Flow diagram (Campaign → DreamFlow → Order userData → Verified)

**Integrations page** (`app/integrations/page.tsx`)
- Show how to generate campaign URLs: `/trade?campaign=1001`
- Code example with userData field
- Partner categories (Media, Games, Wallets, etc.) — hypothetical, not claimed

**Verify page** (`app/verify/page.tsx`) — P1, build after trade works
- Input: paste Shannon tx hash
- Decode from scratch (not localStorage)
- Display: Valid attributable order ✓ or not found
- Proves attribution exists outside our UI

### Phase 5: Documentation (1 hour)

**Create these files:**
1. `README.md` — Project overview, 30-second judge path, architecture diagram, setup/run
2. `JUDGES.md` — Fast judge path (10 steps), what's real, what's not claimed, proof tx
3. `CLAIMS.md` — Table of claims vs status vs proof (be aggressively honest)
4. `SDK_FEEDBACK.md` — Report actual observed SDK/docs discrepancies (only real issues)

**Key sections for README:**
- Live demo URL
- Proof transaction link
- 30-second judge flow
- Why DreamFlow (positioning: growth infrastructure, not another trading app)
- Architecture (Mermaid flowchart)
- Protocol correctness (SDK >= 0.28, marketId-keyed, tick/lot safe, etc.)

### Phase 6: Deployment

1. `npm run build` — Verify build passes
2. `npm run typecheck` — No errors
3. Deploy to Vercel: `vercel --prod`
4. Smoke test all pages: /, /trade, /dashboard, /integrations, /verify
5. Record 2-3 minute demo video
6. Submit to DoraHacks with GitHub repo + deployed URL + video + SDK feedback

---

## Critical Constraints

### Mode Decision (Section 28 of build.md)

After probe, choose ONE mode based on `builderCap`:

**Mode A** (builderCap > 0):
- Build approval flow: `trader.approveBuilder(pool, builder, 25000)`
- Place tagged orders with `builder` address and `builderFeeBpsTimes1k`
- Decode `BuilderFeeCharged` events
- Display builder fees in dashboard

**Mode B** (builderCap == 0):
- Attribution remains the product
- Display: "Native Builder Codes unavailable — current pool cap is 0"
- Show this as INFO, not error
- DO NOT fake builder fees or claim unavailable features

### No Fake Data Policy (Section 48)

**NEVER fabricate:**
- Transactions, revenue, users, volume
- BuilderFeeCharged events
- Market IDs, order IDs, fills
- SDK issues or benchmarks

**If we only executed 2 orders, display 2.** Small real numbers > fake big numbers.

### Claims Policy (Section 49)

Be aggressively honest in CLAIMS.md:
- "Verified" only for things we actually tested
- "Prototype" for things built but not production-scale
- "Not claimed" for things we didn't build
- Include proof (tx hash, implementation file) for every claim

This distinguishes us from overclaimed projects.

---

## Key SDK Findings (from notes/SDK_SURFACE.md)

### userData is LOW-LEVEL ONLY

```typescript
// ❌ Does NOT work — high-level API
await exchange.createOrder("BTC-95000-31DEC26/USDC#YES", "limit", "buy", 10, 0.62, {
  builder: builderAddr,
  builderFeeBpsTimes1k: 25000n,
  // userData not available here
});

// ✓ MUST use low-level trader
const trader = exchange.client.createTrader({ privateKey });
await trader.placeOrder({
  pool: poolAddress,
  side: "BUY_YES",
  price: 620_000n,  // 0.62 in 6-decimal raw units
  quantity: minQuantity,
  userData: 1001n,  // ← HERE
  builder: builderAddr,
  builderFeeBpsTimes1k: 25000n,
  orderType: 2,  // IOC
});
```

### Builder Functions

```typescript
// Read cap from pool
const cap = await publicClient.readContract({
  address: poolAddress,
  abi: binaryPoolReadAbi,
  functionName: "getMaxBuilderFeeBpsTimes1k",
});

// Approve builder
await trader.approveBuilder({
  pool: poolAddress,
  builder: builderAddress,
  maxFeeBpsTimes1k: 25000n,  // 0.25%
});

// Read effective approval
const approval = await publicClient.readContract({
  address: poolAddress,
  abi: binaryPoolReadAbi,
  functionName: "getEffectiveBuilderApproval",
  args: [userAddress, builderAddress],
});
```

### Market Discovery

```typescript
import { listLiveBinaryMarkets } from "@somnia-chain/markets-sdk";

const markets = await listLiveBinaryMarkets(
  { limit: 50, asset: "BTC" },
  "https://indexer.somnia.network/v1/graphql"
);

// Filter for Trading status and time remaining
const tradable = markets.filter(
  (m) => m.status === "Trading" && parseInt(m.expiry) > Date.now()/1000 + 180
);
```

### Lifecycle Enum

```typescript
type BinaryMarketStatus = 
  | "Listed"    // 0
  | "Trading"   // 1
  | "Locked"    // 2
  | "Settling"  // 3
  | "Resolved"  // 4
  | "Voided"    // 5
  | "Finalized";  // indexer-derived

// Only write when status === "Trading" (1)
```

---

## Important File Locations

**If something breaks, check these:**

- `.env.local` — Private key (never commit)
- `lib/wallet/chain.ts` — RPC URL, tUSDC address
- `lib/attribution/campaigns.ts` — Campaign IDs
- `scripts/probe.ts` — Protocol proof (most critical)
- `notes/SDK_SURFACE.md` — SDK API reference
- `PROGRESS.md` — Current build status
- `build.md` — Full specification (2700 lines, read sections as needed)

**Required addresses (Shannon testnet):**
- tUSDC: `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`
- BinaryMarketsModule: `0x3ecC694Cef705358864a646142ac17A90E29e388`
- MarketsCore: `0x2802504314685D89bF6C992CA5a8e7cC78bc0294`

---

## Troubleshooting

### Probe fails: "No suitable Trading markets found"

DreamDEX Event Contracts have short trading windows (minutes to hours). If no market is Trading:
1. Check indexer: https://indexer.somnia.network/v1/graphql
2. Query: `query { Market(where: {marketType: {_eq: "BINARY"}, status: {_eq: "Trading"}}) { asset expiry status } }`
3. Wait for next trading window or adjust script to accept shorter time buffer

### Probe fails: Transaction reverts

1. Check exact revert reason in receipt
2. Common issues:
   - `OrderAlreadyExpired` — expireTimestampNs > marketExpiryNs
   - `InvalidPrice` — price not on tick grid
   - `InvalidQuantity` — quantity not on lot grid or below minimum
   - `InsufficientAllowance` — approve didn't work (check approval tx)
3. Read pool params again, they may have changed

### "userData mismatch" in probe output

SDK or pool behavior changed. This is critical — inspect actual OrderPlaced event in explorer logs, compare with what we decoded. Report in SDK_FEEDBACK.md.

### TypeScript errors

Run `npm run typecheck` to see all errors. Most likely:
- Import paths wrong (use `@/` alias or relative paths)
- Missing type exports from SDK (check node_modules/@somnia-chain/markets-sdk/src/index.ts)
- BigInt literal issue (requires ES2020 target in tsconfig.json — already set)

---

## Handoff Checklist

**Before passing to next person:**

- [ ] Run `npm run probe` successfully
- [ ] Verify tx in Shannon explorer
- [ ] Confirm `proof/latest.json` exists with real tx hash
- [ ] Update this document with actual tx hash and builder cap result
- [ ] Commit all code (except .env.local)
- [ ] Push to GitHub if repo is set up

**Next person should:**

1. Pull latest code
2. Read `PROGRESS.md` for current status
3. Check `proof/latest.json` for mode (A or B)
4. Continue from "Phase 3: Core Frontend" above
5. Maintain no-fake-data policy
6. Update PROGRESS.md as each phase completes

---

## Success Criteria (from build.md Section 61)

**Protocol:**
- [x] SDK >= 0.28
- [x] Shannon 50312
- [ ] Live Event Contract discovered
- [ ] marketId dynamic
- [ ] On-chain status checked
- [ ] Pool dynamic
- [ ] Order book live
- [ ] Tick valid
- [ ] Lot valid
- [ ] Min quantity valid
- [ ] Expiry valid
- [ ] IOC crosses book
- [ ] Real transaction succeeded
- [ ] OrderPlaced decoded
- [ ] userData campaign decoded
- [ ] Proof tx preserved

(Probe will complete all [ ] items above)

**Final Submission:**
- [ ] Working Shannon prototype
- [ ] Public GitHub
- [ ] Deployed URL (Vercel)
- [ ] 2-3 minute video
- [ ] SDK/docs feedback
- [ ] README, JUDGES, CLAIMS, SDK_FEEDBACK, PROGRESS docs

---

## Contact / Questions

If stuck, review these in order:
1. `build.md` — Full spec, sections 1-63
2. `notes/SDK_SURFACE.md` — SDK API reference
3. `PROGRESS.md` — What's done, what's blocking
4. This document — Quick reference

**Critical:** Never fake data. If builder cap is 0, that's Mode B and it's GOOD — we show honest protocol transparency. If only 2 orders exist, show 2. Real > fake.

**Time budget:** ~8 hours total build time from probe to submission-ready. Probe is hour 0-1. Phases 3-6 are hours 2-8. Deploy aggressively, not perfectly.

---

**READY TO EXECUTE:** Run `npm run probe` when classifier recovers.
