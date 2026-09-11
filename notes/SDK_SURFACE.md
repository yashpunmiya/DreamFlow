# DreamFlow SDK Surface — markets-sdk 0.30.0

Based on direct inspection of `node_modules/@somnia-chain/markets-sdk/src/`.

## 1. Client Initialization

**Entry point:** `SomniaMarkets` class from `unified/exchange.ts`

```typescript
import { SomniaMarkets } from "@somnia-chain/markets-sdk";
import { createPublicClient, http } from "viem";
import { shannon } from "./lib/wallet/chain";

const exchange = new SomniaMarkets({
  chain: shannon,              // viem Chain
  wsRpcUrl: "wss://...",      // optional, only needed for live watches
  indexerUrl: "https://...",   // GraphQL indexer endpoint
  addresses: SOMNIA_TESTNET_ADDRESSES,  // from SDK
  privateKey: "0x...",         // optional, only for writes
});

await exchange.loadMarkets();
```

**Config type:** `SomniaMarketsConfig` (extends `ClientConfig` + optional signer)
- `chain`: viem Chain
- `wsRpcUrl?`: string (WebSocket RPC for watches)
- `indexerUrl`: string (Hasura GraphQL endpoint)
- `addresses`: SomniaMarketsAddresses
- `privateKey?` | `account?` | `walletClient?`: signing options

The SDK exports `SOMNIA_TESTNET_ADDRESSES` from `addresses.ts`.

## 2. Live Binary Market Discovery

**Function:** `listLiveBinaryMarkets` from `markets.ts` (line 1253)

```typescript
import { listLiveBinaryMarkets } from "@somnia-chain/markets-sdk";

const markets = await listLiveBinaryMarkets(
  {
    limit: 50,
    asset: "BTC",  // optional filter
    // orderBy defaults to expiry:asc (closing soon first)
  },
  indexerUrl
);
```

**Returns:** `Promise<BinaryMarket[]>`

**BinaryMarket key fields:**
- `id`: string (marketId, lowercased)
- `marketId`: Hex (bytes32)
- `poolAddress`: Address (lowercased)
- `status`: BinaryMarketStatus
- `asset`: string (e.g. "BTC")
- `question`: string
- `strike`: string (raw)
- `tradingStart`: string (unix seconds)
- `expiry`: string (unix seconds)
- `collateral`: Address
- `yesTokenId`, `noTokenId`: string
- `baseDecimals`, `quoteDecimals`: number

## 3. Market Status / Lifecycle

**Type:** `BinaryMarketStatus` from `store.ts` (line 61)

```typescript
type BinaryMarketStatus = 
  | "Listed"    // 0
  | "Trading"   // 1
  | "Locked"    // 2
  | "Settling"  // 3
  | "Resolved"  // 4
  | "Voided"    // 5
  | "Finalized" // indexer-derived, not on-chain enum
```

**On-chain status enum** (line 68): `BINARY_MARKET_STATUS` array confirms:
- Listed = 0
- Trading = 1
- Locked = 2
- Settling = 3
- Resolved = 4
- Voided = 5

build.md's assumption was **correct**.

## 4. On-Chain Market State Reads

**ABI:** `binaryPoolReadAbi` from `readsAbi.ts` (line 32)

Key functions:
- `getOrderBookParameters()` → `(uint256 tickSize, uint256 minQuantity, uint256 lotSize)`
- `getMaxBuilderFeeBpsTimes1k()` → `uint256`
- `getBuilderApproval(address user, address builder)` → `uint256`
- `getEffectiveBuilderApproval(address user, address builder)` → `uint256`
- `marketExpiryNs()` → `uint64`
- `getBinaryPoolParams()` → full pool struct including `maxBuilderFeeBpsTimes1k`

**Market ABI:** `binaryMarketReadAbi` from `readsAbi.ts` (line 102)
- `status()` → `uint8` (lifecycle enum)
- `expiry()` → `uint64`

Use viem `readContract` with these ABIs + pool/market addresses to get authoritative on-chain state.

## 5. Order Book

**Via exchange:** `exchange.fetchOrderBook(symbol)` or `exchange.watchOrderBook(symbol)`

Returns `UnifiedOrderBook` with `bids` and `asks` arrays of `[price, quantity]` tuples.

**Via low-level ABI:** `getBookLevels(bool isBid, uint64 numLevels)` from `binaryPoolReadAbi`

## 6. Order Placement — HIGH-LEVEL (Unified Exchange)

**Function:** `exchange.createOrder(symbol, type, side, amount, price?, params?)`

**Params type:** `CreateOrderParams` from `unified/exchange.ts` (line 68)

```typescript
interface CreateOrderParams {
  timeInForce?: "GTC" | "IOC" | "FOK" | "PO";
  postOnly?: boolean;
  slippage?: number;
  builder?: Address;
  builderFeeBpsTimes1k?: bigint;
  // NO userData field here
}
```

**Critical finding:** `userData` is **NOT exposed** in the high-level `CreateOrderParams`.

## 7. Order Placement — LOW-LEVEL (Trader)

**Access trader:** `exchange.trader` (property, lazy-initialized)

**Function:** `trader.placeOrder(params)`

**Params type:** `PlaceOrderParams` from `trade.ts` (line 170)

```typescript
interface PlaceOrderParams {
  pool: Address;
  side: BinarySide;  // "BUY_YES" | "SELL_YES" | "BUY_NO" | "SELL_NO"
  price: bigint;  // raw collateral units per whole outcome token
  quantity: bigint;  // raw outcome token units
  outcomeToken?: Address;
  yesId?: bigint;
  noId?: bigint;
  collateral?: Address;
  expireTimestampNs?: bigint;  // NANOSECONDS, must be <= pool.marketExpiryNs
  orderType?: number;  // 0=GTC, 1=FOK, 2=IOC, 3=PO
  selfMatchingOption?: number;
  autoApprove?: boolean;  // default true
  builder?: Address;
  builderFeeBpsTimes1k?: bigint;
  userData?: bigint;  // ✓ HERE IT IS
  gas?: bigint;
}
```

**Key:** `userData?: bigint` exists on line 236.

**Returns:** `Promise<PlaceOrderResult>` with `{ hash, receipt, orderId?, fills: OrderFill[] }`

## 8. Binary Sides

**Type:** `BinarySide` from `store.ts` (line 37)

```typescript
type BinarySide = "BUY_YES" | "SELL_YES" | "BUY_NO" | "SELL_NO";
```

The SDK uses string literals, not numeric enums.

## 9. Builder Code Functions

**Approval:** `trader.approveBuilder(params)`

**Params type:** `ApproveBuilderParams` from `trade.ts` (line 251)

```typescript
interface ApproveBuilderParams {
  pool: Address;
  builder: Address;
  maxFeeBpsTimes1k: bigint;  // pool bps×1000 unit, 0 to revoke
  gas?: bigint;
}
```

**Read cap from pool:** Use viem `readContract` with `binaryPoolReadAbi`:

```typescript
const cap = await publicClient.readContract({
  address: poolAddress,
  abi: binaryPoolReadAbi,
  functionName: "getMaxBuilderFeeBpsTimes1k",
});
```

**Read effective approval:**

```typescript
const approval = await publicClient.readContract({
  address: poolAddress,
  abi: binaryPoolReadAbi,
  functionName: "getEffectiveBuilderApproval",
  args: [userAddress, builderAddress],
});
```

## 10. Event ABIs / Receipt Decoding

**Events ABI:** `orderBookEventsAbi` from `eventsAbi.ts` (line 256)

Key events (shared by all pool types):
- `OrderPlaced`
- `OrderFilled`
- `OrderCancelled`
- `OrderExpired`
- `OrderReduced`
- `OrderRested`

The `OrderPlaced` event signature from inspection includes `userData` field in the order struct.

**Builder events:** Not in `orderBookEventsAbi`. Need to check `binaryPoolWriteAbi` or module ABIs for `BuilderFeeCharged`, `BuilderApproved`.

Use viem `decodeEventLog` with the exported ABIs to decode receipts.

## 11. tUSDC Collateral

**Address:** `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E` (from build.md)
**Decimals:** 6

**Faucet:** The SDK does NOT export a faucet helper. Call directly via viem:

```typescript
import { parseAbi } from "viem";

const tusdcAbi = parseAbi([
  "function faucet(uint256 amount) external",
  "function balanceOf(address) view returns (uint256)",
]);

await walletClient.writeContract({
  address: "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E",
  abi: tusdcAbi,
  functionName: "faucet",
  args: [100n * 10n ** 6n],  // 100 tUSDC
});
```

## 12. Expiry Handling

**Critical:** Binary order `expireTimestampNs` is in **NANOSECONDS** and must satisfy:
```
0 < expireTimestampNs <= pool.marketExpiryNs
```

Unlike spot/perp (default ~50y), binary orders default to the MARKET EXPIRY if omitted, per `trade.ts` line 194-206 comment.

## 13. Precision / Units

**Helper:** `units.ts` exports decimal conversion utilities (not inspected in detail).

For 6-decimal tUSDC:
- 1 tUSDC = `1_000_000n` (1e6) raw units
- Price for binary: raw collateral units per whole outcome token
- So a 0.62 YES price (human) = `620_000n` raw (0.62 × 1e6)

## 14. SDK Discrepancies vs build.md Assumptions

1. **userData placement:** build.md section 20 suggested trying the "high-level/unified trade method" first. **Verdict:** The unified `exchange.createOrder` does NOT expose `userData`. Must use low-level `trader.placeOrder`.

2. **Builder fields:** BOTH high-level (`CreateOrderParams`) and low-level (`PlaceOrderParams`) expose `builder` and `builderFeeBpsTimes1k`. Only `userData` requires dropping to the trader.

3. **Market status enum:** build.md's Listed=0/Trading=1/Locked=2/Resolved=4/Voided=5 assumption is **correct** (store.ts confirms it).

4. **Testnet config:** The SDK exports `SOMNIA_TESTNET_ADDRESSES` from `addresses.ts`, which should match build.md section 6 addresses. Should verify at runtime.

## 15. Recommended Probe Flow

1. Init `SomniaMarkets` with Shannon chain + indexer URL + private key
2. Call `listLiveBinaryMarkets` to discover a live BTC or ETH market
3. Filter for `status === "Trading"` and `expiry > now + 180s`
4. Read pool on-chain: `getOrderBookParameters()`, `getMaxBuilderFeeBpsTimes1k()`, `marketExpiryNs()`
5. Fetch order book via exchange or `getBookLevels`
6. Create `trader` instance via `exchange.client.createTrader()`
7. Mint tUSDC if balance low
8. Approve tUSDC to pool if needed (auto-approve should handle this)
9. Call `trader.placeOrder` with:
   - `userData: 1001n` (CryptoBrief campaign)
   - `builder` and `builderFeeBpsTimes1k` if cap > 0
   - IOC crossing order
10. Decode receipt for `OrderPlaced` event, verify `userData === 1001n`
11. Decode `BuilderFeeCharged` if applicable
12. Save proof to `proof/latest.json`

## 16. File Map

- `src/index.ts` — barrel exports
- `src/unified/exchange.ts` — SomniaMarkets class, CreateOrderParams (no userData)
- `src/trade.ts` — Trader, PlaceOrderParams (has userData), ApproveBuilderParams
- `src/markets.ts` — listLiveBinaryMarkets, BinaryMarket type
- `src/store.ts` — BinaryMarketStatus, BinarySide, BINARY_MARKET_STATUS array
- `src/readsAbi.ts` — binaryPoolReadAbi, binaryMarketReadAbi, erc6909Abi, binarySettlementAbi
- `src/eventsAbi.ts` — orderBookEventsAbi (OrderPlaced, OrderFilled, etc.)
- `src/addresses.ts` — SOMNIA_TESTNET_ADDRESSES export
- `src/config.ts` — ClientConfig, SomniaMarketsAddresses types
