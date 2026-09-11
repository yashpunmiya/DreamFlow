# Review DreamFlow in 3 Minutes

DreamFlow attributes real DreamDEX Event Contract orders to the distribution channel that generated them using DreamDEX's native userData field.

---

## Fast Links

- **Live Demo:** (Deploy URL pending)
- **Demo Video:** (Recording pending)
- **GitHub:** (Repo URL pending)
- **Known Proof Tx:** [`0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a`](https://shannon-explorer.somnia.network/tx/0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a) (Block 485731720)

---

## 10-Step Judge Path

1. **Open `/trade`** — Live trading interface
2. **Connect Shannon wallet** — Browser-injected EVM wallet
3. **Select CryptoBrief** — Campaign 1001
4. **Place tiny UP order** — Minimal testnet trade
5. **Wait for confirmation** — 5-15 seconds
6. **Inspect VERIFIED ON-CHAIN receipt** — OrderPlaced ✓, userData=1001 ✓
7. **Confirm userData=1001** — Matches CryptoBrief campaign
8. **Open Shannon Explorer** — View raw transaction logs
9. **Open `/dashboard`** — See verified order in table
10. **Open `/verify` and paste tx** — Verify attribution decodes from scratch

**Total time: 2-3 minutes**

---

## What Is Real

### Protocol Integration

- **✓ Shannon testnet (50312)** — All transactions execute on live Shannon RPC
- **✓ Real Event Contract markets** — Dynamically discovered via `listLiveBinaryMarkets()`
- **✓ On-chain status verification** — Only writes to markets with `status === "Trading"`
- **✓ Live pool state reads** — `getOrderBookParameters()`, `getMaxBuilderFeeBpsTimes1k()`, `marketExpiryNs()`
- **✓ Real attributed orders** — `userData = campaignId` in actual `placeOrder()` calls
- **✓ Transaction receipts** — Decoded from actual Shannon tx receipts
- **✓ OrderPlaced event verification** — Proves userData field on-chain
- **✓ tUSDC faucet integration** — Real ERC20 faucet calls for test collateral
- **✓ Builder cap detection** — Runtime check, never assumes docs are correct

### Attribution

- **✓ Campaign IDs map to userData** — CryptoBrief=1001, BossRaid=2001, CreatorDemo=3001
- **✓ OrderPlaced.userData decoded** — Proves which campaign generated the order
- **✓ Fill tracking** — OrderFilled events decoded when present
- **✓ Verified records** — Only created after on-chain verification succeeds
- **✓ Dashboard metrics** — All derived from verified transaction receipts

### Builder Code Support

- **✓ Live cap reading** — `getMaxBuilderFeeBpsTimes1k()` from current pool
- **✓ Mode determination** — Cap > 0 → Mode A (attribution + builder), Cap = 0 → Mode B (attribution-only)
- **✓ Honest display** — If cap is 0, we say so prominently
- **✓ BuilderFeeCharged decoding** — When present in receipts (Mode A only)

---

## What Is Not Claimed

### Production Infrastructure

- ❌ **Production database** — Uses localStorage as cache only
- ❌ **Historical aggregation** — Beyond last 100 verified orders
- ❌ **Real-time market streaming** — Polls indexer/RPC at 10-15 second intervals
- ❌ **Subgraph indexing** — Direct GraphQL queries to official indexer
- ❌ **Multi-chain support** — Shannon testnet only

### Advanced Features

- ❌ **Automatic campaign ID generation** — Static predefined campaigns only
- ❌ **Builder fee withdrawal** — Detection only, no automated withdrawal UI
- ❌ **Outcome token redemption** — Not implemented
- ❌ **Position tracking** — Orders only, not position state
- ❌ **PnL calculation** — Not implemented

### Business Claims

- ❌ **Real external partners** — All partner categories are hypothetical examples
- ❌ **Production users** — Hackathon prototype only
- ❌ **Revenue generated** — Builder fees shown if detected, but this is testnet
- ❌ **"First ever"** — No claims about being first to use userData or Builder Codes

---

## Protocol Correctness

### SDK Integration

- **SDK version:** @somnia-chain/markets-sdk 0.30.0 (exceeds required >=0.28)
- **userData access:** Uses low-level `trader.placeOrder()` (high-level API doesn't expose it)
- **Builder fields:** Available at both high and low level, but userData forces low-level path
- **Event decoding:** OrderPlaced, OrderFilled, BuilderFeeCharged all decoded correctly

### Safety Guarantees

- **marketId keying** — Never cache by pool address (pools recycle across windows)
- **Status gating** — Only write to `status === "Trading"` markets
- **Expiry validation** — Reject markets with < 180 seconds remaining
- **Tick alignment** — `price % tickSize === 0`
- **Lot alignment** — `quantity % lotSize === 0` and `quantity >= minQuantity`
- **IOC execution** — Crosses the book with price >= best ask (for BUY)
- **Nanosecond handling** — Order expiry correctly converted to uint64 nanoseconds

### Rollover Handling

When a market window ends and a new one begins:
- Old marketId detected
- Stale state discarded (quote, order draft, cached approval, builder cap)
- Fresh market loaded
- User notified of window change

### Builder Code Logic

```typescript
const cap = await readContract(pool, "getMaxBuilderFeeBpsTimes1k");

if (cap > 0n) {
  // Mode A: Attribution + Builder
  // - Show builder approval UI
  // - Allow tagged orders
  // - Decode BuilderFeeCharged
} else {
  // Mode B: Attribution-only
  // - Show "Builder Codes unavailable on this pool"
  // - Attribution still works
  // - No fake revenue claims
}
```

**Critical:** We check `cap` from live chain state, never trust documentation.

---

## Technical Highlights

### Market Discovery

Uses official indexer GraphQL endpoint with intelligent filtering:
1. Query `listLiveBinaryMarkets({ limit: 50, asset: "BTC" })`
2. Filter `status === "Trading"` and `expiry > now + 180s`
3. Prefer BTC, then ETH, then any tradable market
4. Re-query every 10-15 seconds

### Attribution Verification

```typescript
// 1. Submit order with userData
await trader.placeOrder({
  pool,
  side: "BUY_YES",
  userData: 1001n,  // CryptoBrief
  // ... other params
});

// 2. Wait for receipt
const receipt = await publicClient.waitForTransactionReceipt({ hash });

// 3. Decode OrderPlaced event
const orderPlaced = decodeEventLog({
  abi: orderPlacedEventAbi,
  topics: log.topics,
  data: log.data,
});

// 4. Verify userData matches campaign
assert(orderPlaced.args.placedOrder.userData === 1001n);

// ✓ Attribution proven on-chain
```

### Receipt Verification

The `/verify` page accepts any Shannon tx hash and:
1. Fetches receipt from RPC
2. Decodes OrderPlaced event from logs
3. Checks userData against known campaigns
4. Displays full verification result

**This proves attribution exists independently of our UI or database.**

---

## Known Proof Transactions

**Transaction Hash:** [`0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a`](https://shannon-explorer.somnia.network/tx/0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a)

- **Network:** Somnia Shannon Testnet (Chain ID 50312)
- **Block Number:** `485731720`
- **Market:** BTC Event Contract (`0x000000000000000000000000000000000000000000000000000000000001a5dc`)
- **Pool Address:** `0x1491b0369831ece5fa28fc3fdabd561f29315d4f`
- **Order ID:** `719423018874672610106`
- **Attributed Campaign:** CryptoBrief (Slug: `crypto-brief`)
- **userData Decoded:** `1001` (0x3e9)
- **Live Pool Builder Fee Cap:** 0 bps → Verified Mode B (Attribution-Only, Zero Fake Revenue)

**How to verify independently:**
1. Open Shannon Explorer: https://shannon-explorer.somnia.network/tx/0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a
2. Navigate to "Logs" tab
3. Find the `OrderPlaced` event
4. Inspect `placedOrder.userData` → Value is `1001`
5. Alternatively, open `/verify` in DreamFlow or run `npm run verify:tx` to decode raw receipt directly via RPC.

---

## Competitive Positioning

**DreamFlow is NOT:**
- Another AI trading agent
- Another prediction algorithm
- Another market maker
- Another generic Event Contract frontend
- Another browser extension
- Another trading terminal

**DreamFlow IS:**
- Attribution infrastructure
- Growth measurement rails
- Native monetization readiness

**Killer judge statement:**

> "Other teams built products on DreamDEX. DreamFlow helps those products understand which distribution channels create actual trading activity and gives them a native path to revenue."

---

## Why This Can Win

### Technical Implementation (25%)

- Dynamic Event Contract discovery ✓
- Real Shannon testnet execution ✓
- On-chain market status verification ✓
- Valid tick/lot sizing ✓
- IOC execution ✓
- Transaction receipt decoding ✓
- Real userData attribution ✓
- Event Contract rollover handling ✓
- Runtime Builder Code capability detection ✓

### Innovation & Originality (20%)

Most submissions optimize *what* or *how* to trade. DreamFlow asks *where* real trading activity came from and *how* to monetize it.

Uses DreamDEX's native userData field for verifiable attribution — not clicks, not page views, but actual on-chain orders.

### UX & Design (20%)

- Understands within 10 seconds (clear hero, flow diagram)
- Professional Stripe/Vercel-inspired aesthetic
- Real-time market status with countdown
- "VERIFIED ON-CHAIN ✓" receipt is the centerpiece
- Actionable errors ("This wallet needs Shannon STT for gas")

### Business / Ecosystem Impact (20%)

DreamFlow gives builders:
- Measurable acquisition
- Verifiable conversion
- Partner/campaign attribution
- Native monetization readiness

Works for trading apps, agents, media platforms, games, wallets, communities.

### Presentation / Demo (15%)

One real transaction proves almost everything:
1. Market discovery ✓
2. Campaign attribution ✓
3. Order placement ✓
4. Receipt decoding ✓
5. Builder capability check ✓
6. Dashboard display ✓
7. Independent verification ✓

---

## Questions?

Check:
- `README.md` — Project overview, setup
- `CLAIMS.md` — Detailed claim verification
- `SDK_FEEDBACK.md` — Observed SDK/docs issues
- `PROGRESS.md` — Build status
- `HANDOFF.md` — Continuity document
- `build.md` — Full 2700-line specification
