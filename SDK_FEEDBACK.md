# DreamDEX SDK & Documentation Feedback

**Context:** Building DreamFlow, an attribution + monetization layer for DreamDEX Event Contracts, for the Somnia × DreamDEX hackathon.

**SDK Version:** @somnia-chain/markets-sdk 0.30.0  
**Network:** Shannon testnet (50312)  
**Date:** 2026-09-11

---

## 1. userData Field Accessibility

### Observation

The `userData` field (uint64) is critical for our use case — we use it to attribute orders to acquisition campaigns. However, it's only accessible via the low-level `trader.placeOrder()` API, not the high-level `exchange.createOrder()` helper.

**Code inspection:**
```typescript
// ❌ High-level API (src/unified/exchange.ts)
// createOrder() signature does NOT expose userData
await exchange.createOrder(symbol, "limit", "buy", quantity, price, {
  builder,
  builderFeeBpsTimes1k,
  // userData not available here
});

// ✓ Low-level API (src/trade.ts, src/tradeAbi.ts)
await trader.placeOrder({
  pool,
  side: "BUY_YES",
  price,
  quantity,
  userData: 1001n,  // ← Available here
  builder,
  builderFeeBpsTimes1k,
  orderType: 2,
});
```

### Impact

Integrators who want to use `userData` for attribution, referral tracking, or analytics must drop down to the low-level API and handle:
- Manual side conversion (BUY_YES = 0, SELL_YES = 1, etc.)
- Raw price/quantity units (6-decimal fixed-point)
- Manual expiry nanosecond calculation
- Direct pool address management

This increases implementation complexity and error surface.

### Recommendation

**Option A:** Add `userData` parameter to `createOrder()` options:
```typescript
exchange.createOrder(symbol, "limit", "buy", 10, 0.62, {
  userData: 1001n,  // ← New parameter
  builder: builderAddr,
  builderFeeBpsTimes1k: 25000n,
});
```

**Option B:** Document the low-level path prominently in "Event Contracts → Recipes" with a complete example showing userData usage. Current recipes focus on high-level API.

---

## 2. Builder Code Capability Documentation

### Observation

Multiple documentation sources provide conflicting information about Builder Code availability and caps on Shannon testnet:

- Some docs suggest Builder Codes are enabled with a 1% cap
- Other sections imply testnet has the same cap as mainnet
- The actual live pool cap is unknown until runtime

**Our approach:**
```typescript
// Read cap from LIVE pool state, never trust docs
const cap = await publicClient.readContract({
  address: poolAddress,
  abi: binaryPoolReadAbi,
  functionName: "getMaxBuilderFeeBpsTimes1k",
});

if (cap > 0n) {
  // Builder Codes available
} else {
  // Builder Codes disabled
}
```

### Impact

Integrators can build a builder-tagged order flow based on documentation, deploy it, and have all transactions revert because the deployed pool has `builderCap = 0`.

This is exactly the kind of friction that wastes hackathon time.

### Recommendation

1. **Lead with runtime detection** in all Builder Code docs:
   - "Always read `getMaxBuilderFeeBpsTimes1k()` from the current pool"
   - "Builder Code availability varies by pool and can change"
   - "Never hardcode assumptions about caps"

2. **Provide environment-aware examples:**
   ```typescript
   // ✓ Good example
   const cap = await pool.getMaxBuilderFeeBpsTimes1k();
   if (cap === 0n) {
     console.log("Builder Codes unavailable on this pool");
     // Proceed without builder tagging
   } else {
     // Proceed with builder flow
   }
   ```

3. **Update quick-start guides** to check builder cap before showing approval/tagging code.

---

## 3. Market Rollover Guidance

### Observation

Event Contract windows expire and new ones begin. Pool addresses may be recycled. However, current documentation doesn't emphasize the importance of marketId-based state management vs pool-address-based.

**What we learned:**
- Pool addresses CAN be reused across windows
- marketId is the stable identifier
- Caching by pool address causes stale data bugs

**Safe pattern:**
```typescript
const currentMarketId = market.marketId;

if (incomingMarket.marketId !== currentMarketId) {
  // Market rolled over
  clearOrderDraft();
  clearQuote();
  clearBuilderApprovalCache();
  clearPoolCapabilities();
  refetchEverything();
}
```

### Impact

Integrators who key state by pool address will serve stale quotes, stale builder caps, or submit orders to expired markets.

### Recommendation

Add a dedicated "Event Contracts → Market Lifecycle & Rollover" doc section covering:
- Why pool addresses recycle
- When to invalidate cached state
- marketId as the stable key
- Example rollover detection logic
- UI patterns for communicating window changes to users

---

## 4. Receipt Event Decoding Examples

### Observation

We needed to decode `OrderPlaced`, `OrderFilled`, and `BuilderFeeCharged` events from transaction receipts. The SDK exports event ABIs in `eventsAbi.ts`, but there are no documented examples of using them with viem's `decodeEventLog`.

**What worked:**
```typescript
import { decodeEventLog } from "viem";
import { orderPlacedEventAbi } from "@somnia-chain/markets-sdk";

for (const log of receipt.logs) {
  try {
    const decoded = decodeEventLog({
      abi: orderPlacedEventAbi,
      data: log.data,
      topics: log.topics,
    });
    
    if (decoded.eventName === "OrderPlaced") {
      const userData = decoded.args.placedOrder.userData;
      // Now we can verify attribution
    }
  } catch {
    continue; // Not this event type
  }
}
```

### Impact

Without examples, integrators must:
1. Inspect SDK source to find event ABI exports
2. Figure out the correct viem decoding pattern
3. Handle the nested event args structure (`placedOrder.userData`, not `userData`)

This is solvable but adds friction.

### Recommendation

Add a recipe: **"Event Contracts → Decoding Transaction Events"**

Show:
- How to decode OrderPlaced, OrderFilled, BuilderApproved, BuilderFeeCharged
- How to access nested args (e.g., `placedOrder.userData`)
- How to handle multiple events in one receipt
- Example: building an attribution verifier

---

## 5. Binary Side Semantics

### Observation

Binary markets use `kind` (0-3) for order sides:
- BUY_YES = 0
- SELL_YES = 1
- BUY_NO = 2
- SELL_NO = 3

We found this by reading `tradeAbi.ts` source. It's not clearly documented in the Event Contracts recipes.

### Impact

Minor — integrators can infer it from TypeScript types or find it in source. But explicit documentation would save time.

### Recommendation

Add a small reference table to "Event Contracts → Building on Event Contracts":

| Side | kind | Description |
|------|------|-------------|
| BUY_YES | 0 | Buy outcome token for YES |
| SELL_YES | 1 | Sell outcome token for YES |
| BUY_NO | 2 | Buy outcome token for NO |
| SELL_NO | 3 | Sell outcome token for NO |

---

## 6. Tick/Lot Sizing Validation

### Observation

Orders must satisfy:
- `price % tickSize === 0`
- `quantity % lotSize === 0`
- `quantity >= minQuantity`

Pool will revert with `InvalidPrice` or `InvalidQuantity` if violated. We found this by reading pool contract source and inferring from error names. It's not explicitly documented in Event Contracts docs.

### Impact

Integrators will encounter cryptic reverts until they discover these constraints.

### Recommendation

Add validation rules to "Event Contracts → Building on Event Contracts":

**Price Validation:**
```typescript
const { tickSize } = await pool.getOrderBookParameters();
const rawPrice = 620_000n;  // 0.62 in 6-decimal units

if (rawPrice % tickSize !== 0n) {
  throw new Error("Price must be aligned to tick grid");
}
```

**Quantity Validation:**
```typescript
const { lotSize, minQuantity } = await pool.getOrderBookParameters();
const rawQuantity = 100_000n;

if (rawQuantity < minQuantity) {
  throw new Error("Quantity below minimum");
}

if (rawQuantity % lotSize !== 0n) {
  throw new Error("Quantity must be aligned to lot grid");
}
```

---

## 7. Nanosecond Expiry Handling

### Observation

Order expiry is `uint64` nanoseconds, not seconds. We found this by inspecting the ABI and seeing contract reverts.

**Wrong:**
```typescript
const expiry = Math.floor(Date.now() / 1000) + 300;  // seconds
await placeOrder({ expireTimestampNs: expiry });  // ❌ Will revert
```

**Right:**
```typescript
const expiry = BigInt(Math.floor(Date.now() / 1000) + 300) * 1_000_000_000n;
await placeOrder({ expireTimestampNs: expiry });  // ✓
```

### Impact

Subtle bug — order appears to expire instantly or far in the future depending on magnitude error.

### Recommendation

Document explicitly in Event Contracts order placement examples:

> **Important:** `expireTimestampNs` is in **nanoseconds** (not seconds or milliseconds). Convert Unix seconds to nanoseconds by multiplying by 1,000,000,000.

---

## 8. tUSDC Faucet Cap

### Observation

Current docs show the tUSDC faucet can mint 10,000 tUSDC per call. We used 100 tUSDC for development to stay conservative. The actual per-call cap is enforced on-chain but not clearly documented.

### Impact

Minor — users will discover the cap when they try to mint. But knowing the cap upfront helps with dev planning.

### Recommendation

Document the faucet cap in "Shannon Testnet" or "Getting Started" docs:

```typescript
// tUSDC faucet: 0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E
// Per-call cap: 10,000 tUSDC (enforced on-chain)
---

## 9. Binary Placement: `placeBinaryOrder` vs `placeOrder`

### Observation

When submitting binary orders to `BinaryPool`, calling the generic `placeOrder` function reverts with `UseBinaryPlacement()` (selector `0xc94a9c3f`). The contract requires using `placeBinaryOrder`:

```solidity
function placeBinaryOrder(
  uint8 kind,                  // 0 = BUY_YES, 1 = SELL_YES, 2 = BUY_NO, 3 = SELL_NO
  uint256 price,
  uint256 quantity,
  uint64 expireTimestampNs,
  uint8 orderType,
  uint8 selfMatchingOption,
  address builder,
  uint96 builderFeeBpsTimes1k,
  uint64 userData              // ← Note position as 9th argument
) payable returns (bool success, uint128 id);
```

### Recommendation

Document explicitly that `BinaryPool` does not accept generic `placeOrder` calls. For developers constructing viem contract calls, clearly highlight the exact argument order of `placeBinaryOrder` and note that `userData` is the 9th parameter.

---

## 10. Indexer GraphQL Schema: `clobStatus` vs `status`

### Observation

In the Hasura GraphQL schema at `https://dev.smk.somnia.host/v1/graphql`, querying the field `status` on `Market` throws a validation error:
`field 'status' not found in type: 'Market'`.

The actual column name in the GraphQL schema is `clobStatus`. The TypeScript SDK internally maps this to `status`, but developers making direct GraphQL queries or extending queries will encounter schema validation errors unless querying `clobStatus`.

### Recommendation

Document the GraphQL schema column mapping or include an alias in the schema / documentation:
```graphql
query {
  Market {
    id
    clobStatus # Notice: clobStatus, not status
    expiry
  }
}
```

---

## 11. `SomniaMarkets` Requires `wsRpcUrl` for Trader Initialization

### Observation

Initializing `new SomniaMarkets({ chain, addresses, privateKey })` and accessing `exchange.trader` throws `NotConfiguredError: @somnia-chain/markets-sdk: this operation needs chain access — needs wsRpcUrl in createClient (or a chain whose rpcUrls carry a webSocket endpoint)`.

### Impact

Developers building server-side API routes, scripts, or environments without active WebSocket RPC connections are blocked from using `exchange.trader` unless they supply a dummy/active WebSocket URL or bypass `exchange.trader` with low-level viem calls.

### Recommendation

Allow `createClient` and `createTrader` to operate in HTTP-only mode for one-shot order execution, reserving the WebSocket requirement strictly for subscriptions/watches.

---

## Overall SDK Quality

**What worked well:**
- TypeScript types are accurate and helpful
- ABI exports are complete
- SDK structure is logical (binary/, spot/, perp/ separation)
- viem compatibility is excellent
- Source code is readable and well-organized

**What would help integrators:**
- More recipes for non-obvious patterns (userData, Builder Codes, event decoding)
- Explicit guidance on runtime state checks vs documentation assumptions
- Rollover handling patterns
- Validation rule documentation

---

## Positive Observations

**Not feedback, just appreciation:**

1. **markets-sdk publishes full TypeScript source** — This made inspection possible. Seeing actual implementation helped us understand edge cases.

2. **Consistent naming** — `getMaxBuilderFeeBpsTimes1k`, `getEffectiveBuilderApproval`, `getOrderBookParameters` all follow predictable patterns.

3. **Event ABI exports** — Having `orderPlacedEventAbi` etc. exported made receipt decoding straightforward once we found them.

4. **Shannon testnet stability** — RPC and indexer were reliable throughout development.

5. **listLiveBinaryMarkets() works great** — Market discovery was smooth, no issues.

---

## Summary

**Critical issues:** None. Everything works when you figure out the patterns.

**High-value improvements:**
1. userData exposure in high-level API or prominent low-level recipe
2. Runtime-first Builder Code documentation
3. Market rollover guidance

**Nice-to-haves:**
4. Event decoding examples
5. Binary side reference table
6. Tick/lot validation rules
7. Nanosecond expiry callout
8. Faucet cap documentation

**Overall:** The SDK is solid. Documentation gaps are the main friction point for hackathon integrators who are moving fast and reading docs linearly rather than exploring source code.

---

## Contact

If DreamDEX team wants to discuss any of these observations, we're happy to clarify or provide code examples.

Built by: DreamFlow team  
Hackathon: Somnia × DreamDEX Event Contracts  
Date: 2026-09-11
