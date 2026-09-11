You are the lead engineer, product designer, QA engineer, protocol integrator, DevOps engineer, and hackathon submission owner for this project.

Your mission is to build the entire project end-to-end as fast as possible while maintaining enough technical correctness, polish, and verifiable on-chain proof to maximize our chance of winning the Somnia × DreamDEX Event Contracts Hackathon.

Do NOT ask me normal product or engineering questions.

Make good decisions yourself.

Only interrupt me when a HUMAN action is genuinely required, such as:
1. funding a test wallet with Shannon STT gas,
2. signing something in my browser wallet,
3. authenticating GitHub,
4. authenticating Vercel,
5. recording/uploading the final demo video,
6. supplying a credential that cannot safely be generated locally.

Never ask me for opinions about naming, colors, architecture, libraries, component structure, or minor implementation choices.

You own those decisions.

# ============================================================
# 0. PROJECT
# ============================================================

Project name:

DREAMFLOW

Tagline:

Growth rails for DreamDEX.

Primary pitch:

DreamFlow lets applications attribute real DreamDEX Event Contract orders to the acquisition channel that generated them, verify that attribution directly from on-chain order events, and activate native DreamDEX Builder Code monetization when the live Event Contract pool permits it.

The product is NOT:

- another AI trading agent,
- another prediction algorithm,
- another market maker,
- another generic Event Contract frontend,
- another browser extension,
- another auto-roll product,
- another trading terminal,
- another bot testing framework.

The hackathon already has many projects in those categories.

DreamFlow is infrastructure that those applications could use.

The core insight:

DreamDEX orders expose an arbitrary:

    uint64 userData

field.

DreamFlow uses that field as an on-chain campaign/source identifier.

Example:

    CryptoBrief campaign -> userData = 1001
    BossRaid campaign -> userData = 2001
    Creator Demo -> userData = 3001

A real DreamDEX order submitted from the CryptoBrief integration therefore contains:

    userData = 1001

DreamFlow decodes the actual OrderPlaced transaction log and proves:

    This trade came from campaign 1001.

This gives us acquisition analytics based on actual on-chain trading activity instead of browser clicks.

DreamDEX also supports optional Builder Codes:

    builder
    builderFeeBpsTimes1k

When Builder Codes are enabled on the current live pool, users can approve a builder and a tagged fill can emit:

    BuilderFeeCharged

DreamFlow then becomes both:

    attribution infrastructure
          +
    native monetization infrastructure

However:

DO NOT make the entire project depend on Builder Codes being enabled on Shannon.

The current documentation contains conflicting statements about the testnet Builder Code cap.

Therefore the application MUST read:

    getMaxBuilderFeeBpsTimes1k()

from the CURRENT LIVE EVENT CONTRACT POOL.

Runtime chain state wins over documentation.

If cap > 0:

    enable monetization

If cap == 0:

    builder monetization is unavailable on that pool
    attribution still works
    prominently and honestly display that fact

Never fake builder revenue.

Never fake protocol availability.

# ============================================================
# 1. WHY THIS CAN WIN
# ============================================================

Current hackathon judging weights:

Technical Implementation: 25%
Innovation & Originality: 20%
UX & Design: 20%
Business / Ecosystem Impact: 20%
Presentation / Demo: 15%

Optimize every engineering decision against those weights.

DreamFlow should score through:

TECHNICAL

- dynamic Event Contract discovery
- real Shannon testnet execution
- on-chain market-status verification
- valid tick/lot sizing
- IOC execution
- transaction receipt decoding
- real userData attribution
- Event Contract rollover handling
- runtime Builder Code capability detection
- BuilderApproved / BuilderFeeCharged decoding if available

INNOVATION

Most submissions optimize:

    what should I trade?
    how should I trade?
    how can AI trade?

DreamFlow asks:

    where did real DreamDEX trading activity come from?
    how can the application that drove it monetize that activity?

UX

A judge should understand DreamFlow within 10 seconds.

BUSINESS IMPACT

DreamFlow gives builders:

- measurable acquisition,
- verifiable conversion,
- partner/campaign attribution,
- native monetization readiness.

PRESENTATION

One real transaction should prove almost everything.

# ============================================================
# 2. COMPETITIVE POSITIONING
# ============================================================

Important:

There is already a submission called OddsLens whose public positioning is effectively turning webpages into live DreamDEX storefronts.

Therefore DO NOT position us as:

    "an embeddable DreamDEX widget"

Embedding can exist as part of the demonstration, but it is not the innovation.

There is already a project called WindTunnel focused on crash-testing DreamDEX bots.

Therefore DO NOT drift into generic testing/devtool positioning.

There are already many:

- trading bots,
- AI agents,
- fair value engines,
- market makers,
- auto-roll systems,
- guards,
- hedging products,
- consumer swipe apps.

Our positioning:

    DreamFlow = Attribution + Growth + Monetization rails.

Killer judge statement:

    "Other teams built products on DreamDEX.
     DreamFlow helps those products understand which distribution channels
     create actual trading activity and gives them a native path to revenue."

Another acceptable line:

    "Clicks are not conversions.
     DreamFlow attributes actual DreamDEX orders and fills."

Never say:

    "We are definitely the first ever"

unless independently verified.

# ============================================================
# 3. HACKATHON SUBMISSION REQUIREMENTS
# ============================================================

We must finish with:

- working Shannon testnet prototype
- public GitHub repository
- deployed application
- 2–3 minute demo video
- SDK/documentation feedback report

Required repository documents:

    README.md
    JUDGES.md
    CLAIMS.md
    SDK_FEEDBACK.md
    PROGRESS.md

Optional presentation deck:

DO NOT BUILD unless everything above is finished.

# ============================================================
# 4. OFFICIAL REFERENCES — READ BEFORE CODING
# ============================================================

Before implementing protocol interactions, inspect current official sources.

Prefer them in this order:

1. Current installed @somnia-chain/markets-sdk source/types
2. DreamDEX official documentation
3. Somnia official documentation
4. Official somnia-chain/dreamdex-bot-kit repository
5. Live Shannon chain state
6. Everything else

The important DreamDEX documentation sections are:

DreamDEX Docs
→ Developers
→ Event Contracts
→ Overview / Building on Event Contracts

DreamDEX Docs
→ Developers
→ Event Contracts
→ Recipes

DreamDEX Docs
→ Developers
→ Event Contracts
→ Market Structure & Lifecycle

DreamDEX Docs
→ Developers
→ Event Contracts
→ Contracts & Addresses

DreamDEX Docs
→ Developers
→ Event Contracts
→ Gotchas

DreamDEX Docs
→ Developers
→ Contracts
→ Functions

DreamDEX Docs
→ Developers
→ Contracts
→ Events

DreamDEX Docs
→ Developers
→ Contracts
→ Types

Also inspect the official GitHub repository:

    somnia-chain/dreamdex-bot-kit

When documentation and chain state disagree:

    LIVE CHAIN STATE WINS.

When documentation and installed TypeScript types disagree:

    INSTALLED CURRENT PACKAGE TYPES WIN FOR SDK CALL SIGNATURES.

Document discrepancies in SDK_FEEDBACK.md.

# ============================================================
# 5. VERIFIED NETWORK FACTS
# ============================================================

Target only Shannon testnet for hackathon execution.

Chain ID:

    50312

RPC:

    https://dream-rpc.somnia.network

Explorer:

    https://shannon-explorer.somnia.network

Native test gas token:

    STT

Event Contract collateral:

    tUSDC

Address:

    0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E

Decimals:

    6

The tUSDC token has:

    faucet(uint256 amount)

which mints test collateral to msg.sender.

Each faucet call is capped by the token contract.

The current docs show 10,000 tUSDC as the per-call cap.

Use something small such as:

    100 tUSDC

for development.

Example raw amount:

    100n * 10n ** 6n

Do not confuse:

    STT = gas

with:

    tUSDC = Event Contract collateral.

The user needs STT before ANY faucet transaction can execute.

# ============================================================
# 6. CORE EVENT CONTRACT ADDRESSES
# ============================================================

Current documented core Event Contract addresses:

BinaryMarketsModule:

    0x3ecC694Cef705358864a646142ac17A90E29e388

MarketsCore:

    0x2802504314685D89bF6C992CA5a8e7cC78bc0294

BinarySettlement:

    0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23

OutcomeToken6909:

    0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9

OracleHub:

    0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b

CollateralRouter:

    0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C

Important:

These are protocol-core addresses.

DO NOT hardcode individual Event Contract MARKET or POOL addresses.

Per-window markets and pools MUST be dynamically discovered.

Pool addresses may be recycled across windows.

Always key application state by:

    marketId

not:

    pool address

# ============================================================
# 7. SDK REQUIREMENTS
# ============================================================

Install:

    @somnia-chain/markets-sdk
    viem

The DreamDEX docs require:

    markets-sdk >= 0.28.0

Do not continue with anything older.

At bootstrap run:

    npm ls @somnia-chain/markets-sdk

If necessary explicitly upgrade.

Use Node 20+.

Event Contracts use the Markets SDK.

Do not try to build the Event Contract integration around the normal DreamDEX HTTP API.

HTTP API is primarily the spot surface.

# ============================================================
# 8. TECH STACK
# ============================================================

Use:

- Next.js current stable
- TypeScript strict
- App Router
- Tailwind
- viem
- @somnia-chain/markets-sdk >= 0.28
- lucide-react
- browser-injected EVM wallet

Use wagmi only if it clearly reduces implementation time.

Avoid unnecessary dependencies.

No:

- database initially,
- AI,
- custom blockchain,
- subgraph,
- The Graph,
- Redis,
- Firebase auth,
- Supabase auth,
- custom token,
- custom smart contract unless absolutely required,
- server-held production wallet.

The chain is our source of truth.

Use localStorage only as a cache/index for already verified transaction records.

# ============================================================
# 9. REPOSITORY INITIALIZATION
# ============================================================

If repository is empty:

Create Next.js TypeScript application.

Suggested dependencies:

    npm install @somnia-chain/markets-sdk viem lucide-react
    npm install -D tsx vitest

Configure scripts:

    dev
    build
    lint
    typecheck
    test
    probe
    verify:tx

Suggested package.json additions:

    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "probe": "tsx scripts/probe.ts",
    "verify:tx": "tsx scripts/verify-tx.ts"

Before generating secrets ensure:

    .env
    .env.local
    .env.*.local

are ignored.

Create:

    .env.example

Do not put real secrets inside it.

# ============================================================
# 10. HUMAN CHECKPOINT SYSTEM
# ============================================================

You may only interrupt the human for these situations.

## HUMAN CHECKPOINT A — GAS

If development wallet has insufficient native Shannon gas:

STOP.

Print only:

    HUMAN ACTION REQUIRED: SHANNON GAS

    Wallet address:
    0x...

    This wallet needs Somnia Shannon STT for transaction gas.

    Please fund this exact address using the official Somnia testnet faucet.

    After it is funded, reply:
    FUNDED

Do not ask anything else.

Do not ask for a private key.

## HUMAN CHECKPOINT B — LOCAL TEST SIGNER

Prefer creating a dedicated throwaway hackathon test wallet locally if PROBE_PRIVATE_KEY is absent.

Before generation:

1. verify .env.local is gitignored,
2. generate a secure random private key using viem/accounts,
3. write it directly to .env.local,
4. NEVER print the private key,
5. print only the generated address.

Then invoke HUMAN CHECKPOINT A if gas is needed.

Never commit this key.

Never put it into NEXT_PUBLIC environment variables.

## HUMAN CHECKPOINT C — BROWSER SIGNATURE

When browser interaction is required:

Display the appropriate Connect Wallet or transaction UI.

Do not ask the user to send private keys.

## HUMAN CHECKPOINT D — GITHUB

Only stop if GitHub CLI/browser authentication is required.

Explain one exact action.

## HUMAN CHECKPOINT E — VERCEL

Only stop if Vercel CLI/browser authentication is required.

Explain one exact action.

# ============================================================
# 11. CREATE PROGRESS.MD IMMEDIATELY
# ============================================================

First file after bootstrap:

    PROGRESS.md

Structure:

# DreamFlow Build Progress

## Current branch
Unknown / Attribution-only / Attribution+Builder

## Protocol probe
- SDK:
- wallet:
- STT:
- tUSDC:
- live market:
- marketId:
- pool:
- builder cap:
- attributed tx:
- builder fee tx:

## Completed
...

## Current blocker
...

## Next
...

## Known proof transactions
...

Update this continuously.

# ============================================================
# 12. DO NOT START WITH UI
# ============================================================

The biggest mistake would be spending two hours making a landing page before proving the protocol interaction.

First build:

    scripts/inspect-sdk.ts
    scripts/probe.ts

No UI polish until probe succeeds.

# ============================================================
# 13. INSPECT THE CURRENT SDK
# ============================================================

Create:

    scripts/inspect-sdk.ts

Inspect package source and exported TypeScript types.

Use grep/ripgrep if useful:

    rg "userData" node_modules/@somnia-chain/markets-sdk
    rg "builderFee" node_modules/@somnia-chain/markets-sdk
    rg "approveBuilder" node_modules/@somnia-chain/markets-sdk
    rg "placeOrder" node_modules/@somnia-chain/markets-sdk
    rg "listLiveBinaryMarkets" node_modules/@somnia-chain/markets-sdk
    rg "BUY_YES|BUY_NO|SELL_YES|SELL_NO" node_modules/@somnia-chain/markets-sdk

Determine:

1. exact SDK initialization API
2. testnet config exports
3. live binary market discovery API
4. order book fetch API
5. on-chain market read API
6. unified Event Contract order call
7. raw trader call
8. whether userData is exposed
9. whether builder fields are exposed
10. which ABIs the SDK exports
11. how receipt/result objects are shaped
12. how binary sides are represented

Write findings to:

    notes/SDK_SURFACE.md

Do NOT blindly copy an API signature from this prompt.

The installed current package types are authoritative.

# ============================================================
# 14. PROTOCOL PROBE — MOST IMPORTANT MILESTONE
# ============================================================

Create:

    scripts/probe.ts

Goal:

Produce ONE real attributed DreamDEX Event Contract order on Shannon.

Expected terminal output:

    DREAMFLOW PROTOCOL PROBE

    Network       Shannon 50312                  ✓
    SDK           0.28.x or newer                ✓

    Wallet        0x...
    STT balance   ...
    tUSDC balance ...

    Live market   BTC ...
    marketId      0x...
    pool          0x...
    status        Trading                         ✓
    seconds left  ...

    best bid      ...
    best ask      ...
    tick          ...
    lot           ...
    min quantity  ...

    builder cap   ...

    campaign      CryptoBrief
    userData      1001

    tx            0x...

    receipt       SUCCESS                         ✓
    OrderPlaced                                    ✓
    userData=1001                                  ✓
    OrderFilled                                    ✓ / no fill

    BuilderFeeCharged                              ✓ / unavailable

# ============================================================
# 15. LIVE MARKET DISCOVERY
# ============================================================

Use the SDK's current equivalent of:

    listLiveBinaryMarkets({ limit: 50 })

Prefer:

1. BTC,
2. then ETH,
3. market status Trading,
4. sufficient time remaining,
5. executable order book.

Do not hardcode a symbol if discovery can select dynamically.

For each candidate:

read the authoritative on-chain market state.

The lifecycle values are:

    Listed   = 0
    Trading  = 1
    Locked   = 2
    Resolved = 4
    Voided   = 5

ONLY write when:

    status === 1

Require comfortable expiry headroom.

For development prefer:

    >180 seconds remaining

If no market has enough time:

retry.

Do not send a transaction into a nearly expired window.

# ============================================================
# 16. MARKET STATE SAFETY
# ============================================================

Every trade preflight MUST:

1. re-read current market state,
2. confirm current marketId,
3. confirm Trading state,
4. re-read expiry,
5. re-fetch current order book,
6. validate tick,
7. validate lot,
8. validate minimum quantity,
9. validate collateral balance,
10. validate allowance,
11. validate gas balance,
12. validate builder cap when relevant.

Indexer state is helpful for discovery.

On-chain state is authoritative for writes.

# ============================================================
# 17. MARKET ROLLOVER
# ============================================================

Event Contract windows roll.

Pools may be recycled.

Never retain stale state when marketId changes.

Pseudo:

    if (incoming.marketId !== current.marketId) {
        clearQuote()
        clearOrderDraft()
        clearPoolCapabilities()
        clearBuilderApprovalCache()
        current = incoming
        fetchFreshBook()
        fetchFreshBuilderCap()
    }

Never carry over:

- old market expiry,
- old best price,
- old order IDs,
- old status,
- old builder cap,
- old cached approval,
- old market-specific position data.

# ============================================================
# 18. TEST COLLATERAL
# ============================================================

Before a trade:

read tUSDC balance.

If insufficient:

call the tUSDC faucet.

Use:

    100 * 10^6

raw units as a reasonable development amount.

Implement:

    scripts/mint-test-collateral.ts

and later a UI button:

    Mint 100 tUSDC

The tUSDC faucet transaction itself requires STT gas.

If STT is missing:

trigger HUMAN CHECKPOINT A.

# ============================================================
# 19. CAMPAIGN ATTRIBUTION
# ============================================================

Create:

    lib/attribution/campaigns.ts

Use static development campaigns:

    export const CAMPAIGNS = {
      cryptoBrief: {
        id: 1001n,
        slug: "crypto-brief",
        label: "CryptoBrief",
        type: "News Partner"
      },

      bossRaid: {
        id: 2001n,
        slug: "boss-raid",
        label: "BossRaid",
        type: "Game Partner"
      },

      creatorDemo: {
        id: 3001n,
        slug: "creator-demo",
        label: "Creator Demo",
        type: "Creator"
      }
    }

These IDs must fit:

    uint64

The real demo will primarily use:

    1001

Do not over-engineer hashing.

A readable campaign ID is better for the judge.

Support URL:

    /trade?campaign=1001

Parse it safely.

Unknown campaign:

    show "Unknown campaign"
    allow trade only if we explicitly choose fallback campaign

# ============================================================
# 20. ATTRIBUTED ORDER
# ============================================================

The critical order metadata is:

    userData = campaignId

We need an actual DreamDEX Event Contract order containing:

    userData = 1001

First try to use the current official SDK surface.

If the high-level/unified trade method does not expose userData:

inspect the lower-level trader API.

If that still does not expose it:

use the canonical ABI exported by @somnia-chain/markets-sdk with viem.

Do NOT hand-write ABI signatures unless necessary.

Do NOT guess Event Contract binary-side semantics.

Inspect SDK internals to learn the correct transformation.

# ============================================================
# 21. ORDER EXECUTION
# ============================================================

For demo execution:

Use an IOC taker order.

Important:

IOC must actually CROSS THE BOOK.

A buy price of zero is NOT a market order.

For a BUY:

    price >= current best ask

Use a small safety cushion only if it remains valid and on-grid.

Never send an arbitrary JS float to raw contract methods.

Respect:

    tickSize
    lotSize
    minQuantity

If using unified SDK human-unit helpers, still verify the final amount is not rounded to zero.

Trade size should be very small but above minimum.

Goal:

proof, not PnL.

# ============================================================
# 22. PRICE / QUANTITY SAFETY
# ============================================================

The pool rejects:

    InvalidPrice
    InvalidQuantity
    QuantityBelowMinimum

Therefore:

raw price must be:

    price % tickSize == 0

raw quantity must satisfy:

    quantity >= minQuantity

and:

    quantity % lotSize == 0

Use BigInt for raw values.

Avoid IEEE floating point for contract units.

If SDK precision helpers exist, use them.

# ============================================================
# 23. ORDER EXPIRY
# ============================================================

Order expiry is nanoseconds.

It must be:

    > current time

and appropriate for market expiry.

Do NOT pass:

    0

as "no expiry".

Create a safe value comfortably before Event Contract window end.

When direct contract interaction is used:

    expireTimestampNs = BigInt(unixSeconds) * 1_000_000_000n

plus only an appropriate future lifetime.

Never send expiry after the market is no longer tradable.

# ============================================================
# 24. RECEIPT DECODING
# ============================================================

After successful trade:

fetch the transaction receipt.

Decode pool events.

Must attempt to decode:

    OrderPlaced
    OrderFilled
    BuilderFeeCharged

The minimum success condition:

    receipt.status === success

and:

    OrderPlaced exists

and:

    OrderPlaced.placedOrder.userData === campaignId

For demo campaign:

    === 1001

If userData does not match:

DO NOT mark attribution as verified.

# ============================================================
# 25. VERIFIED ATTRIBUTION RECORD
# ============================================================

Create a type:

    type VerifiedAttributionRecord = {
      version: 1

      chainId: 50312

      txHash: `0x${string}`

      blockNumber: string

      marketId: `0x${string}`

      pool: `0x${string}`

      owner: `0x${string}`

      orderId?: string

      campaignId: string

      campaignSlug: string

      campaignLabel: string

      side: "UP" | "DOWN"

      filledQuantity?: string

      fillPrice?: string

      quoteVolume?: string

      builderAddress?: `0x${string}`

      builderCapRaw: string

      builderFeeRaw?: string

      builderFeeToken?: `0x${string}`

      verifiedAt: number
    }

Only create it AFTER receipt verification.

# ============================================================
# 26. SAVE PROTOCOL PROOF
# ============================================================

After successful CLI probe create:

    proof/latest.json

Containing PUBLIC information only.

Example:

    {
      "network": "Shannon",
      "chainId": 50312,
      "marketId": "0x...",
      "pool": "0x...",
      "campaignId": "1001",
      "txHash": "0x...",
      "builderCap": "...",
      "builderFeeEvent": false,
      "verifiedAt": "..."
    }

Safe to commit if it contains only public chain data.

Also add tx hash to:

    PROGRESS.md
    JUDGES.md

# ============================================================
# 27. BUILDER CODE CAPABILITY
# ============================================================

For EVERY newly selected pool:

read:

    getMaxBuilderFeeBpsTimes1k()

Never hardcode:

    100000

even if current documentation says 1%.

Store:

    builderCapRaw

Display it.

Convert correctly:

    1000 = 1 basis point

Therefore:

    25000 = 25 bps = 0.25%
    100000 = 100 bps = 1%

# ============================================================
# 28. BUILDER MODE DECISION
# ============================================================

After probe:

Choose ONE mode.

## MODE A — ATTRIBUTION + BUILDER MONETIZATION

Use if:

    builderCap > 0

and builder flow works.

Then build approval and tagged order support.

## MODE B — ATTRIBUTION-FIRST

Use if:

    builderCap == 0

or protocol rejects builder path.

Then:

- attribution remains the product,
- builder capability is displayed as disabled,
- no fee claims,
- no simulated fee revenue.

Do not switch product.

Do not spend hours trying to bypass a zero protocol cap.

Update PROGRESS.md:

    Current branch: MODE A

or:

    Current branch: MODE B

# ============================================================
# 29. BUILDER ADDRESS
# ============================================================

For Mode A we need a builder receiving address.

If NEXT_PUBLIC_BUILDER_ADDRESS is not configured:

generate a second local test wallet.

Store its private key locally only if future withdrawal testing is required.

For the core demo we only require:

    builder address

Do not expose builder private key in browser.

Never commit it.

# ============================================================
# 30. BUILDER APPROVAL
# ============================================================

Before submitting a tagged order:

user must approve the builder.

Use:

    approveBuilder(builder, maxFeeBpsTimes1k)

Recommended demo fee ceiling:

    25 bps

Raw:

    25000

ONLY if:

    25000 <= live cap

Read back:

    getEffectiveBuilderApproval(user, builder)

Do not rely only on raw approval.

UI copy:

    "Approve DreamFlow as a builder for up to 0.25% on builder-tagged fills on this pool."

Explain:

    "Set approval to 0 to revoke."

Do not hide fee authorization.

# ============================================================
# 31. BUILDER-TAGGED TRADE
# ============================================================

When enabled:

order metadata contains:

    builder = configured builder address

    builderFeeBpsTimes1k = 25000

    userData = campaignId

Therefore ONE order proves:

    acquisition source
          +
    monetization routing

Decode:

    BuilderFeeCharged

Note:

The event may emit amount=0 for very small fills because of floor rounding.

A zero amount event still proves the builder code path ran.

If practical, choose a test order size that generates a non-zero amount.

Never oversize the trade solely for demo optics.

# ============================================================
# 32. FRONTEND PAGES
# ============================================================

Build:

    /
    /trade
    /dashboard
    /integrations
    /verify

# ============================================================
# 33. LANDING PAGE
# ============================================================

Hero:

    DreamFlow

    Growth rails for DreamDEX.

Subheading:

    Attribute real Event Contract orders to the channel that drove them.
    Verify conversions on-chain.
    Monetize routed flow with native Builder Codes when available.

Primary CTA:

    Try live demo

Secondary:

    View verified activity

Show four proof chips:

    Shannon 50312
    Live DreamDEX markets
    On-chain campaign attribution
    Builder capability detected live

Below hero:

flow diagram:

    Campaign
        ↓
    DreamFlow
        ↓
    DreamDEX Event Contract Order
        userData=1001
        ↓
    OrderPlaced / OrderFilled
        ↓
    Verified Acquisition
        ↓
    BuilderFeeCharged (if supported)

No fake numerical metrics.

# ============================================================
# 34. TRADE PAGE
# ============================================================

This is the centerpiece.

Top:

    BTC / ETH
    interval
    countdown
    current marketId shortened
    Trading status
    network badge

Live odds card:

    UP
    DOWN

Order panel:

    campaign
    side
    quantity
    estimated spend
    campaign ID
    builder status
    builder fee if enabled

Example:

    Campaign
    CryptoBrief
    On-chain ID: 1001

    Side
    UP

    Estimated cost
    1.02 tUSDC

    Attribution
    userData = 1001

    Builder fee
    0.25%

Button:

    Place attributed testnet trade

If Mode B:

    Native builder fee
    Unavailable — current pool cap is 0

Do not make this look like an error.

# ============================================================
# 35. VERIFIED RECEIPT UI
# ============================================================

After transaction:

large status:

    VERIFIED ON-CHAIN ✓

Show:

    Campaign
    CryptoBrief

    Campaign ID
    1001

    Market
    BTC ...

    Side
    UP

    Order ID
    ...

    Transaction
    0x...

    OrderPlaced
    ✓

    userData
    1001 ✓

    Fill
    ... / No fill

    Builder
    ...

    Builder fee
    ...

Button:

    Open Shannon Explorer

Button:

    View in DreamFlow verifier

# ============================================================
# 36. VERIFY PAGE
# ============================================================

This is strategically valuable.

Create:

    /verify

Input:

    Paste Shannon transaction hash

Button:

    Verify attribution

Fetch chain receipt.

Decode it from scratch.

Do not use localStorage as authoritative data.

Display:

    Valid DreamFlow-attributable order ✓

or:

    No attributable DreamDEX OrderPlaced event found

Show decoded:

- owner
- market/pool
- order ID
- campaign userData
- fill
- builder
- builder fee event

This proves DreamFlow's attribution exists outside our UI.

Priority:

P1.

Build after primary trade path is stable.

# ============================================================
# 37. DASHBOARD
# ============================================================

Title:

    On-chain acquisition

Metric cards:

    Verified orders
    Filled volume
    Active campaigns
    Builder fees

Every metric MUST derive from verified records.

No seeded fake history.

If we only executed 2 trades:

display 2.

That is a strength.

Table:

    Time
    Campaign
    Market
    Side
    Filled
    Builder Fee
    Transaction

Each row links to explorer.

State badge:

    VERIFIED

Dashboard storage:

Use localStorage as a convenience cache.

Each cached record MUST contain a tx hash.

On load:

revalidate receipts where practical.

Local cache != source of truth.

# ============================================================
# 38. INTEGRATIONS PAGE
# ============================================================

Do not pitch this as an embed widget product.

Position it as:

    "Give every distribution channel a verifiable campaign identity."

Integration generator:

Campaign:

    CryptoBrief

Generated URL:

    /trade?campaign=1001

Code example:

    const campaignId = 1001n;

    await placeDreamDexOrder({
        ...,
        userData: campaignId
    });

Explain:

    Step 1 — assign campaign ID
    Step 2 — route user into live DreamDEX experience
    Step 3 — attach ID to real order
    Step 4 — verify conversion from OrderPlaced
    Step 5 — optionally attach Builder Code

Show hypothetical partner categories:

    Media
    Games
    Wallets
    Communities
    Trading apps
    Agents

Do not claim real partners.

# ============================================================
# 39. WALLET IMPLEMENTATION
# ============================================================

Use browser injected EVM wallet.

Create Somnia Shannon chain definition.

Network:

    id: 50312

    name: Somnia Shannon

    native currency:
        name: Somnia Test Token
        symbol: STT
        decimals: 18

    rpc:
        https://dream-rpc.somnia.network

    explorer:
        https://shannon-explorer.somnia.network

UI handles:

- disconnected,
- connected,
- wrong chain,
- switching chain,
- adding chain if unsupported.

Show:

    wallet address
    STT balance
    tUSDC balance

Never send transactions automatically.

# ============================================================
# 40. tUSDC FAUCET BUTTON
# ============================================================

If balance low show:

    Get test collateral

Click:

    call tUSDC faucet

Suggested amount:

    100 tUSDC

Then:

    wait receipt
    refresh balance

If wallet has no STT:

show:

    You have no Shannon gas.
    Get STT from the official Somnia testnet faucet.

Do not call this tUSDC faucet the Somnia gas faucet.

They are separate.

# ============================================================
# 41. STATE ARCHITECTURE
# ============================================================

Suggested structure:

    lib/
      dreamdex/
        network.ts
        sdk.ts
        markets.ts
        market-state.ts
        orderbook.ts
        execution.ts
        receipts.ts
        builder.ts
        collateral.ts
        abi.ts

      attribution/
        campaigns.ts
        decoder.ts
        storage.ts
        analytics.ts

      wallet/
        chain.ts
        client.ts

      formatting/
        units.ts
        hashes.ts

    components/
      NetworkBadge.tsx
      WalletButton.tsx
      MarketCard.tsx
      Countdown.tsx
      CampaignBadge.tsx
      TradePanel.tsx
      BuilderStatus.tsx
      VerifiedReceipt.tsx
      AttributionTable.tsx
      FlowDiagram.tsx

    scripts/
      inspect-sdk.ts
      setup-test-wallet.ts
      probe.ts
      mint-test-collateral.ts
      verify-tx.ts

# ============================================================
# 42. MARKET SERVICE
# ============================================================

Implement roughly:

    getLiveEventMarkets()

    getBestDemoMarket()

    getVerifiedMarketState(marketId)

    getExecutableBook(market)

    getPoolCapabilities(pool)

The demo selector prefers:

1. BTC
2. ETH
3. enough time left
4. Trading status
5. non-empty executable order book

Do not assume BTC always has liquidity.

# ============================================================
# 43. REFRESH CADENCE
# ============================================================

Avoid aggressive polling.

Suggested:

market discovery:

    10–15 seconds

order book while trade page visible:

    2–5 seconds

countdown:

    local every second

on-chain state:

    immediately before transaction

dashboard:

    receipt-driven

# ============================================================
# 44. TRADE PREFLIGHT
# ============================================================

Immediately before wallet signature:

perform:

    market still same?
    market still Trading?
    enough time remains?
    current touch price?
    quantity valid?
    price valid?
    collateral sufficient?
    allowance sufficient?
    STT sufficient?
    builder cap still valid?
    approval still valid?

Then submit.

If market rolled:

abort draft.

Refresh successor market.

Show:

    "That window closed while you were preparing the trade.
     DreamFlow moved you to the new live market."

# ============================================================
# 45. ERROR UX
# ============================================================

Never use generic:

    Something went wrong.

Implement actionable errors.

Examples:

NO GAS

    "This wallet needs Shannon STT for gas."

NO COLLATERAL

    "You need test tUSDC. Mint 100 tUSDC."

WRONG NETWORK

    "Switch to Somnia Shannon (50312)."

MARKET ROLLED

    "The trading window closed. Loading the successor market."

EMPTY BOOK

    "There is no executable ask right now. Trying another live market."

IOC MISS

    "The order book moved before inclusion. Refreshing the quote."

BUILDER DISABLED

    "Native Builder Codes are disabled by this pool's live protocol cap.
     Campaign attribution remains active."

BUILDER NOT APPROVED

    "Approve the builder fee ceiling before submitting this tagged order."

INVALID QUANTITY

    explain lot/minimum.

REVERT

Attempt to decode reason.

# ============================================================
# 46. VISUAL DESIGN
# ============================================================

Make DreamFlow look credible and expensive.

Aesthetic:

    Stripe Dashboard
    ×
    Vercel
    ×
    institutional trading terminal

Use:

- near black / graphite background
- off-white text
- subtle borders
- one restrained green for verified state
- one restrained blue for links/actions
- monospace for hashes and IDs
- minimal icons
- tight responsive cards

Avoid:

- neon rainbow
- gradients everywhere
- giant crypto coins
- cartoon AI robots
- glassmorphism overload
- animated background particles
- generic purple Web3 hero

Focus attention on:

    VERIFIED ON-CHAIN

# ============================================================
# 47. RESPONSIVE UX
# ============================================================

Desktop is judge priority.

Still make mobile usable.

Critical pages should look correct at:

    1440px
    1024px
    390px

No horizontal overflow.

Hashes should truncate gracefully.

# ============================================================
# 48. NO FAKE DATA POLICY
# ============================================================

Absolute rule.

Do not fabricate:

- transactions
- revenue
- users
- volume
- campaigns used by external users
- BuilderFeeCharged events
- market IDs
- order IDs
- fills
- SDK issues
- benchmarks

Mock UI data is allowed ONLY during development.

Before final submission remove it or clearly label:

    DEMO EXAMPLE

Prefer no mock metrics at all.

Real small numbers are better.

# ============================================================
# 49. CLAIMS POLICY
# ============================================================

Create CLAIMS.md.

Example:

| Claim | Status | Proof |
|------|------|------|
| Finds live Event Contracts | Verified | live application |
| Reads on-chain market status | Verified | implementation |
| Places Shannon Event Contract order | Verified | tx |
| Attaches campaign userData | Verified | OrderPlaced decode |
| Attributes fills | Verified / partial | receipt |
| Reads live Builder Code cap | Verified | pool read |
| Charges builder fee | Verified OR unavailable | actual event only |
| Production-scale analytics | Prototype | not claimed |

Be aggressively honest.

This will distinguish us from overclaimed hackathon projects.

# ============================================================
# 50. JUDGES.MD
# ============================================================

Create:

    JUDGES.md

Opening:

    # Review DreamFlow in 3 Minutes

    DreamFlow attributes real DreamDEX Event Contract orders to the
    distribution channel that generated them using DreamDEX's native
    userData field.

Include:

    Live demo:
    Demo video:
    GitHub:
    Network:
    Known proof tx:

Fast judge path:

    1. Open /trade
    2. Connect Shannon wallet
    3. Select CryptoBrief / campaign 1001
    4. Place tiny UP order
    5. Wait for confirmation
    6. Inspect VERIFIED ON-CHAIN receipt
    7. Confirm userData=1001
    8. Open explorer
    9. Open /dashboard
    10. Open /verify and paste tx

Then:

    ## What is real

    ## What is not claimed

    ## Protocol correctness

    ## Known proof transactions

# ============================================================
# 51. SDK_FEEDBACK.MD
# ============================================================

This is required by hackathon.

Only report issues actually observed.

Potential real issue already worth checking:

Builder Code documentation appears inconsistent regarding testnet cap.

Do NOT accuse documentation until verifying current pages and chain state.

Suggested entry:

    ## Builder Code capability should be presented runtime-first

    Observation:
    Multiple current materials describe different Shannon testnet
    Builder Code availability/caps.

    Live result:
    pool:
    marketId:
    getMaxBuilderFeeBpsTimes1k():
    timestamp:

    Impact:
    Integrators can build a builder-tagged flow that reverts when the
    deployed cap differs from the documentation they followed.

    Recommendation:
    Put "always read getMaxBuilderFeeBpsTimes1k()" in every Builder Code
    quick-start and expose environment-aware examples.

Other useful feedback IF actually encountered:

- non-zero userData Event Contract recipe
- builder fields in raw trader documentation
- receipt shape documentation
- binary-side raw order mapping
- rollover helper
- finalized market discovery
- decimal differences between mainnet/testnet

Five strong observations are enough.

# ============================================================
# 52. README
# ============================================================

Top:

    # DreamFlow

    Growth rails for DreamDEX.

Then:

    DreamFlow attributes real Event Contract orders to the channel
    that generated them using DreamDEX's native on-chain userData.

Links immediately:

    Live
    Video
    Proof transaction

Then:

    ## 30-second judge path

Then:

    ## Why DreamFlow

Then architecture.

Use Mermaid:

    flowchart LR
      A[Campaign / Partner] --> B[DreamFlow]
      B --> C[Live Event Contract]
      C --> D[Trading state check]
      D --> E[Attributed order]
      E -->|userData=campaignId| F[DreamDEX pool]
      F --> G[OrderPlaced]
      F --> H[OrderFilled]
      F --> I[BuilderFeeCharged]
      G --> J[DreamFlow verifier]
      H --> J
      I --> J
      J --> K[Verified acquisition dashboard]

Then:

    ## Protocol correctness

List:

- SDK >=0.28
- Shannon 50312
- marketId keyed
- live status gate
- tick safe
- lot safe
- IOC crossing
- rollover safe
- dynamic builder cap
- 6-decimal testnet collateral

Then setup/run.

# ============================================================
# 53. TESTS
# ============================================================

Use Vitest.

At minimum:

    campaigns.test.ts
    receipt-decoder.test.ts
    units.test.ts

Campaign tests:

- IDs within uint64
- correct mapping
- unknown ID handling

Receipt tests:

Once a real probe succeeds:

save sanitized public receipt fixture.

Test:

- finds OrderPlaced
- decodes userData
- matches campaign
- finds fill when present
- handles missing builder fee
- handles builder fee event

Units:

- tUSDC 6 decimals
- fee conversion
- tick snapping if custom

# ============================================================
# 54. BUILD QUALITY GATES
# ============================================================

Continuously run:

    npm run typecheck
    npm run lint
    npm test

Before deployment:

    npm run build

No TypeScript errors.

No ESLint fatal errors.

No broken imports.

No console crashes.

# ============================================================
# 55. SECURITY
# ============================================================

NEVER:

- expose private key client-side
- put PRIVATE_KEY into NEXT_PUBLIC
- commit .env.local
- log private key
- paste private key into README
- put test signer into source

Dedicated test wallet only.

Browser production demo uses user's wallet.

Validate addresses.

Restrict network to Shannon.

# ============================================================
# 56. DEPLOYMENT
# ============================================================

Preferred:

    Vercel

Deploy only after production build passes.

If Vercel CLI authenticated:

deploy.

If not:

trigger HUMAN CHECKPOINT E.

No secret private key is needed in production browser app.

Set public environment variables only if required.

After deployment perform smoke test:

    /
    /trade
    /dashboard
    /integrations
    /verify

Use deployed application for final video.

# ============================================================
# 57. BUILD TIME BUDGET
# ============================================================

Treat time as scarce.

PHASE 1 — 45 minutes

- bootstrap
- SDK inspection
- wallet
- live market discovery
- balances

PHASE 2 — next 45 minutes

- real attributed trade
- receipt decode
- save proof

If no proof after ~90 minutes:

diagnose aggressively.

Do not move to UI polish.

PHASE 3 — ~90 minutes

- core trade UI
- wallet
- live market
- receipt

PHASE 4 — ~60 minutes

- dashboard
- verifier
- campaign links

PHASE 5 — ~45 minutes

- Builder Code path if available

PHASE 6 — ~45 minutes

- polish
- responsive
- error states

PHASE 7 — ~45 minutes

- README
- JUDGES
- CLAIMS
- SDK feedback

PHASE 8

- deploy
- demo
- submission

# ============================================================
# 58. SCOPE CUTTING
# ============================================================

If behind schedule:

NEVER CUT:

- real Event Contract integration
- real transaction
- userData attribution
- receipt decode
- deployed demo
- README
- JUDGES
- video
- feedback

CUT FIRST:

1. fancy charts
2. redemption
3. package publishing
4. extra campaigns
5. fancy animations
6. verifier import if necessary
7. extensive historical aggregation
8. Builder Code write path if protocol cap makes it difficult

# ============================================================
# 59. DEMO VIDEO
# ============================================================

Target:

    2 minutes 15 seconds to 2 minutes 40 seconds

Never exceed 3 minutes.

SCRIPT:

0:00–0:15

    "This hackathon has dozens of DreamDEX agents, frontends and trading
    tools. But a frontend still needs to answer two questions:
    which channel actually generated a real trader, and how can that
    distribution become sustainable?"

0:15–0:30

    "DreamFlow is growth infrastructure for DreamDEX.
    We attach an acquisition campaign directly to the real DreamDEX
    order using its native userData field."

Show diagram.

0:30–1:05

Open live trade.

Show:

    Shannon
    BTC
    live countdown
    CryptoBrief
    campaign 1001

Place tiny UP trade.

Wallet confirmation.

1:05–1:30

Show:

    VERIFIED ON-CHAIN

Point to:

    OrderPlaced
    userData = 1001
    tx hash

Open explorer briefly.

1:30–1:50

Dashboard.

Say:

    "DreamFlow measures actual orders and fills, not clicks."

Show row.

1:50–2:10

MODE A:

    "This live pool also supports Builder Codes. The user has explicitly
    approved a 0.25% builder ceiling, and the fill produced this
    BuilderFeeCharged event."

Show real event.

MODE B:

    "DreamFlow also checks the live Builder Code cap. This pool currently
    reports zero, so native builder fees are transparently disabled.
    Attribution remains fully live, and we never pretend unavailable
    protocol functionality exists."

2:10–2:25

Open verifier.

Paste tx.

Verify.

2:25–2:35

    "Other teams build things on DreamDEX.
     DreamFlow gives those products measurable distribution
     and a native path to monetization."

End.

# ============================================================
# 60. DORAHACKS SUBMISSION COPY
# ============================================================

At the end generate polished final submission copy based only on what
we actually completed.

Base version:

    DreamFlow is the growth and monetization layer for DreamDEX Event
    Contracts.

    Applications can assign every acquisition channel a campaign ID.
    When a user places an Event Contract order, DreamFlow writes that
    identifier into DreamDEX's native uint64 userData field.

    We then decode DreamDEX's actual on-chain OrderPlaced and OrderFilled
    events to produce verifiable conversion analytics based on trading
    activity rather than clicks.

    DreamFlow also reads each live pool's Builder Code cap. Where native
    Builder Codes are enabled, users can explicitly approve a builder
    fee and tagged fills can be tracked through BuilderFeeCharged.

    The Shannon prototype demonstrates live Event Contract discovery,
    on-chain status gating, real testnet execution, campaign attribution,
    transaction verification, rollover-safe handling, and live Builder
    Code capability detection.

Modify this based on actual implemented features.

# ============================================================
# 61. FINAL ACCEPTANCE CHECKLIST
# ============================================================

Do NOT declare completion until checking:

PROTOCOL

[ ] SDK >= 0.28
[ ] Shannon 50312
[ ] live Event Contract discovered
[ ] marketId dynamic
[ ] on-chain status checked
[ ] pool dynamic
[ ] order book live
[ ] tick valid
[ ] lot valid
[ ] min quantity valid
[ ] expiry valid
[ ] IOC crosses book
[ ] real transaction succeeded
[ ] OrderPlaced decoded
[ ] userData campaign decoded
[ ] proof tx preserved

WALLET

[ ] connects
[ ] switches Shannon
[ ] STT displayed
[ ] tUSDC displayed
[ ] faucet works or documented
[ ] no key exposed

BUILDER

[ ] live cap read
[ ] UI correctly displays enabled/disabled
[ ] approval tested if enabled
[ ] effective approval read if enabled
[ ] tagged fill tested if enabled
[ ] BuilderFeeCharged decoded if present
[ ] zero fake revenue

ROLLOVER

[ ] new marketId detected
[ ] stale state discarded
[ ] UI survives rollover

UI

[ ] landing
[ ] trade
[ ] receipt
[ ] dashboard
[ ] integrations
[ ] verify if time allows
[ ] responsive
[ ] actionable error states

REPO

[ ] README
[ ] JUDGES
[ ] CLAIMS
[ ] SDK_FEEDBACK
[ ] PROGRESS
[ ] tests
[ ] no secrets

DEPLOY

[ ] build passes
[ ] deployed URL works
[ ] explorer links work
[ ] known proof tx included

SUBMISSION

[ ] public GitHub
[ ] deployed prototype
[ ] 2–3 minute video
[ ] SDK/docs feedback
[ ] final DoraHacks description

# ============================================================
# 62. EXECUTION STYLE
# ============================================================

Work autonomously.

Do not stop after creating scaffolding.

Do not hand me snippets and tell me to assemble them.

Edit files yourself.

Run commands yourself.

Inspect errors yourself.

Fix errors yourself.

Test the application yourself.

Continue from one phase to the next.

Whenever you encounter an issue:

1. inspect the actual error,
2. inspect package source/types,
3. inspect official docs if needed,
4. inspect live contract state if needed,
5. fix it,
6. record meaningful SDK/docs friction,
7. continue.

Do not solve problems by replacing real protocol behavior with mocks.

Do not turn off TypeScript safety simply to make errors disappear.

Do not use `any` everywhere.

Do not fabricate successful states.

# ============================================================
# 63. FIRST ACTIONS — START NOW
# ============================================================

Perform these immediately and in this exact priority:

1. Inspect repository.
2. Create/update .gitignore.
3. Create PROGRESS.md.
4. Initialize Next.js if necessary.
5. Install current dependencies.
6. Confirm markets-sdk >=0.28.
7. Create Shannon chain configuration.
8. Create scripts/inspect-sdk.ts.
9. Inspect installed SDK types/source.
10. Create local dedicated test wallet if no PROBE_PRIVATE_KEY exists.
11. Print ONLY its address.
12. Check STT balance.
13. If STT balance is zero, invoke HUMAN CHECKPOINT A.
14. Once gas exists, mint small amount of tUSDC.
15. Discover live Event Contract.
16. Verify Trading status.
17. Inspect order book.
18. Read current pool builder cap.
19. Place real order with campaign userData=1001.
20. Decode receipt.
21. Save proof transaction.
22. Choose Mode A or Mode B.
23. Only now begin polished frontend implementation.

The SINGLE MOST IMPORTANT milestone is:

    REAL SHANNON TX                ✓
    REAL EVENT CONTRACT            ✓
    OrderPlaced                    ✓
    userData = 1001                ✓
    Explorer-verifiable            ✓

Everything else comes second.

Start execution now.