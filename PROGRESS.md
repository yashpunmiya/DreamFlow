# DreamFlow Build Progress

## Current branch
Attribution-only (Mode B — builder cap is 0)

## Protocol probe
- SDK: @somnia-chain/markets-sdk@0.30.0 installed (>=0.28 required) ✓
- wallet: 0x732d5b8794eBF323B1CE036A64a89Af08E5dfBD7 (local dev/probe wallet, key in .env.local, gitignored)
- STT: 50 STT (funded by human) ✓
- tUSDC: not yet minted
- live market: BTC 0x00000000000000...
- marketId: 0x000000000000000000000000000000000000000000000000000000000001a5dc
- pool: 0x1491b0369831ece5fa28fc3fdabd561f29315d4f
- builder cap: 0 (0 bps) → Mode B (attribution-only)
- attributed tx: 0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a ✓
- builder fee tx: pending

## Completed
- Repo initialized, Next.js (TypeScript, App Router, Tailwind, ESLint) bootstrapped.
- package.json scripts wired: dev, build, lint, typecheck, test, probe, verify:tx.
- .env.example created; .env* already gitignored.
- Installed @somnia-chain/markets-sdk@0.30.0, viem@2.56.3, lucide-react, tsx, vitest.
- lib/wallet/chain.ts: Shannon 50312 chain definition, tUSDC address/decimals.
- lib/attribution/campaigns.ts: CryptoBrief/BossRaid/CreatorDemo campaign IDs + parsing helpers.
- scripts/setup-test-wallet.ts + scripts/check-balance.ts: generated local probe wallet, confirmed 50 STT balance.
- SDK surface fully inspected manually from installed source, documented in notes/SDK_SURFACE.md.
- Key findings: userData available only via trader.placeOrder (not high-level exchange.createOrder), builder fields available at both levels, market status enum matches build.md assumptions.
- lib/dreamdex/* modules: network.ts (addresses, explorer), markets.ts (discovery, helpers), abi.ts (contract ABIs, side mappings).
- lib/attribution/storage.ts: VerifiedAttributionRecord type, localStorage persistence, aggregate metrics.
- lib/attribution/decoder.ts: Receipt verification, OrderPlaced/OrderFilled/BuilderFeeCharged decoding.
- lib/formatting/units.ts + tests: tUSDC formatting, builder fee conversion, hash truncation.
- components/: NetworkBadge, Countdown, CampaignBadge.
- app/page.tsx: Landing page with hero, flow diagram, value props.
- app/trade/page.tsx: Trade page UI (wallet integration pending).
- app/dashboard/page.tsx: Dashboard with metrics and verified orders table.
- app/integrations/page.tsx: Campaign URLs, code examples, integration steps.
- app/verify/page.tsx: Transaction hash verification from scratch.
- HANDOFF.md: Comprehensive 400+ line handoff document for continuity.

## Current blocker
None. Ready to execute probe script.

## Next
- Run npm run probe to place first attributed order on Shannon.
- Verify tx in explorer, confirm userData=1001 in OrderPlaced event.
- Determine Mode A (builder cap > 0) or Mode B (builder cap = 0).
- Add wallet integration to frontend (viem WalletClient or wagmi).
- Wire up actual order placement from /trade page.
- Deploy to Vercel.
- Record demo video.
- Write README, JUDGES, CLAIMS, SDK_FEEDBACK docs.

## Known proof transactions
(none yet)
