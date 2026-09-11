# DreamFlow — Hackathon Developer Feedback & Bug Report

**Project:** DreamFlow (Verifiable Attribution & Monetization Infrastructure for DreamDEX Event Contracts)  
**Hackathon:** Somnia × DreamDEX Event Contracts Hackathon  
**Target Network:** Somnia Shannon Testnet (Chain ID 50312)  
**SDK Inspected:** `@somnia-chain/markets-sdk` v0.30.0  
**Live Verified Proof Transaction:** [`0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a`](https://shannon-explorer.somnia.network/tx/0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a) (Block `485731720`)

---

## Executive Summary

While building **DreamFlow** — an infrastructure rail that routes trading traffic to DreamDEX Event Contracts with verifiable on-chain campaign attribution via `userData` — we tested the entire developer stack: smart contract execution on Somnia Shannon testnet, Hasura GraphQL indexer queries, TypeScript SDK methods, and transaction receipt event decoding.

Overall, the core Somnia chain infrastructure is remarkably fast, and the DreamDEX Event Contract architecture is clean and expressive. However, we identified several edge cases, undocumented contract requirements, and schema mismatches that cost significant debugging time.

Below is our detailed, transparent report of challenges, bugs, workarounds, and constructive recommendations.

---

## 1. Top Challenges & Bugs Encountered

### 1.1. `UseBinaryPlacement()` Contract Revert (`placeOrder` vs `placeBinaryOrder`)

- **The Challenge:**  
  When submitting binary orders to the live `BinaryPool` contract, invoking the generic `placeOrder` function (common across spot/perp documentation) fails immediately and reverts with error selector `0xc94a9c3f` (`UseBinaryPlacement()`).
- **Root Cause:**  
  BinaryPool contracts on Somnia require their own specific placement method:
  ```solidity
  function placeBinaryOrder(
      uint8 kind,                  // 0 = BUY_YES, 1 = SELL_YES, 2 = BUY_NO, 3 = SELL_NO
      uint256 price,
      uint256 quantity,
      uint64 expireTimestampNs,
      uint8 orderType,             // e.g. 2 = IOC
      uint8 selfMatchingOption,    // 0 = CANCEL_NEWEST
      address builder,
      uint96 builderFeeBpsTimes1k,
      uint64 userData              // ← Note: 9th parameter
  ) payable returns (bool success, uint128 id);
  ```
- **How We Solved It:**  
  We extracted the exact `placeBinaryOrder` ABI into our execution engine and documented the 9 parameters.
- **Recommendation for DreamDEX:**  
  Document the `placeBinaryOrder` requirement prominently in the "Event Contracts → Smart Contract Integration" section, highlighting that generic `placeOrder` will revert with `UseBinaryPlacement()`.

---

### 1.2. Hasura GraphQL Indexer Column Mismatch: `clobStatus` vs `status`

- **The Challenge:**  
  When querying the public Hasura GraphQL endpoint (`https://dev.smk.somnia.host/v1/graphql`) directly for active markets, requesting the `status` field threw a GraphQL validation error:  
  `field 'status' not found in type: 'Market'`.
- **Root Cause:**  
  The underlying PostgreSQL column exposed in Hasura is named `clobStatus`, not `status`. The TypeScript SDK maps this internally, but any custom or direct query breaks if following the documentation that refers to "market status".
- **How We Solved It:**  
  Adjusted our queries to request `clobStatus` and aliased it in our client-side models:
  ```graphql
  query GetLiveMarkets {
    Market(where: { clobStatus: { _eq: "OPEN" } }) {
      id
      clobStatus
      expiry
      poolAddress
    }
  }
  ```
- **Recommendation for DreamDEX:**  
  Add a GraphQL computed field or schema alias `status -> clobStatus` in Hasura, or explicitly document the GraphQL schema naming conventions.

---

### 1.3. SDK `SomniaMarkets` Requires `wsRpcUrl` for Trader Initialization

- **The Challenge:**  
  When instantiating `new SomniaMarkets({ chain, addresses, privateKey })` in Next.js serverless API routes or node scripts, accessing `exchange.trader` throws:  
  `NotConfiguredError: @somnia-chain/markets-sdk: this operation needs chain access — needs wsRpcUrl in createClient (or a chain whose rpcUrls carry a webSocket endpoint)`.
- **Root Cause:**  
  The SDK client architecture couples transaction signing with continuous WebSocket state sync. In serverless functions (like Vercel API routes) or one-off CLI scripts, persistent WebSockets are either unavailable or undesirable.
- **How We Solved It:**  
  We implemented a direct Viem client (`createWalletClient` / `createPublicClient`) using standard HTTP RPC (`https://dream-rpc.somnia.network`), completely bypassing the WebSocket requirement for write operations.
- **Recommendation for DreamDEX:**  
  Decouple read/write operations from WebSocket dependencies so developers can execute single transactions via standard HTTP RPC without requiring an active WebSocket stream.

---

### 1.4. `userData` Inaccessibility in High-Level SDK Helper

- **The Challenge:**  
  `userData` (uint64) is an incredible on-chain feature for campaign tracking, referral attribution, and analytics. However, it is only exposed in the low-level `trader.placeOrder()` API and is completely omitted from the high-level `exchange.createOrder()` helper.
- **Impact:**  
  Integrators must bypass the friendly high-level SDK helper and manually handle price scales (6-decimal fixed-point), lot sizes, nanosecond timestamps, and binary side enums just to pass `userData`.
- **Recommendation for DreamDEX:**  
  Add `userData?: bigint` to `createOrder(..., options)` in `src/unified/exchange.ts`.

---

### 1.5. Live Pool Builder Fee Cap Honesty (Mode B Detection)

- **The Challenge:**  
  Documentation indicated Builder Codes could monetize up to 100 bps (1%). However, querying the live deployed `BinaryPool` contract via `getMaxBuilderFeeBpsTimes1k()` returns `0n`.
- **Impact:**  
  Submitting any order with `builderFeeBpsTimes1k > 0` immediately causes the transaction to revert on-chain with fee cap exceeded errors.
- **How We Solved It (Strict Honesty Policy):**  
  Instead of hardcoding fee expectations or faking revenue, DreamFlow implemented dynamic runtime inspection:
  - If `getMaxBuilderFeeBpsTimes1k() > 0n`: Operates in **Mode A** (Attribution + Live Builder Monetization).
  - If `getMaxBuilderFeeBpsTimes1k() == 0n`: Operates in **Mode B** (Attribution-Only, Zero Fabricated Revenue).
- **Recommendation for DreamDEX:**  
  Emphasize in documentation: *"Always call `getMaxBuilderFeeBpsTimes1k()` at runtime before constructing builder transactions."*

---

### 1.6. Nanosecond Expiry vs Unix Seconds

- **The Challenge:**  
  Order expirations in Event Contracts use `uint64 expireTimestampNs` (nanoseconds).
- **Impact:**  
  Developers passing standard JavaScript `Date.now() / 1000` or standard Unix seconds experience immediate contract reverts because the timestamp is interpreted as 1970.
- **How We Solved It:**  
  Implemented explicit nanosecond conversion:
  ```typescript
  const expireTimestampNs = BigInt(Math.floor(Date.now() / 1000) + 300) * 1_000_000_000n;
  ```
- **Recommendation for DreamDEX:**  
  Add an explicit callout note in bold in the SDK order placement guide: *"Note: expireTimestampNs is in nanoseconds, not seconds or milliseconds."*

---

### 1.7. Tick Size and Lot Size Enforcement

- **The Challenge:**  
  Orders must strictly satisfy:
  - `price % tickSize == 0`
  - `quantity % lotSize == 0`
  - `quantity >= minQuantity`
  Violations revert with generic `InvalidPrice()` or `InvalidQuantity()`.
- **Recommendation for DreamDEX:**  
  Include a small helper in the SDK like `roundToGrid(price, tickSize)` to prevent new developers from hitting cryptic revert errors.

---

## 2. What We Loved About Somnia & DreamDEX

Despite the learning curve on low-level ABIs, building on Somnia and DreamDEX was an exciting experience:

1. **Native `userData` Field:**  
   Having a native `uint64 userData` field on the order struct is a visionary design decision. It transforms DreamDEX from just an exchange into an attributable growth rail for Web3.
2. **Sub-Second Confirmation on Shannon Testnet:**  
   Transactions consistently confirmed in under 1 second. The RPC was rock-solid throughout stress testing.
3. **Open TypeScript Source:**  
   The `@somnia-chain/markets-sdk` package ships with full TypeScript source code and ABI exports. When documentation was sparse, reading the clean source code unlocked the answers.
4. **Rich On-Chain Event Logs:**  
   `OrderPlaced`, `OrderFilled`, and `BuilderFeeCharged` contain complete state snapshots, making zero-backend verifiable analytics possible.

---

## 3. Summary of Recommendations Checklist

| Priority | Area | Recommendation |
| :--- | :--- | :--- |
| **High** | Event Contracts Docs | Document `placeBinaryOrder` vs `placeOrder` & the 9 parameters |
| **High** | Indexer GraphQL | Add alias for `clobStatus` or document the schema field name |
| **High** | TypeScript SDK | Allow HTTP-only mode in `SomniaMarkets` without requiring `wsRpcUrl` |
| **Medium** | TypeScript SDK | Expose `userData` in high-level `exchange.createOrder()` options |
| **Medium** | Event Contracts Docs | Add recipe for decoding `OrderPlaced` / `OrderFilled` receipt logs |
| **Low** | Docs / Helpers | Add `expireTimestampNs` nanosecond warning & grid rounding utilities |

---

*Submitted by the **DreamFlow** team for the Somnia × DreamDEX Event Contracts Hackathon.*  
*Repository includes full working code, unit tests, and live proof transactions on Somnia Shannon testnet.*
