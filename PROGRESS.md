# DreamFlow Build Progress

## Current branch
Attribution-only (Mode B — builder cap is 0)

## Protocol probe
- SDK: @somnia-chain/markets-sdk@0.30.0 installed (>=0.28 required) ✓
- wallet: 0x732d5b8794eBF323B1CE036A64a89Af08E5dfBD7 (local dev/probe wallet, key in .env.local, gitignored)
- STT: 50 STT (funded by human) ✓
- tUSDC: 100 tUSDC minted via faucet ✓
- live market: BTC (0x000000000000000000000000000000000000000000000000000000000001a5dc) ✓
- marketId: 0x000000000000000000000000000000000000000000000000000000000001a5dc ✓
- pool: 0x1491b0369831ece5fa28fc3fdabd561f29315d4f ✓
- builder cap: 0 (0 bps) → Mode B confirmed (attribution-only, honest protocol transparency) ✓
- attributed tx: 0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a (Block 485731720) ✓
- orderId: 719423018874672610106 ✓

## Completed
- Repo initialized, Next.js 16 (TypeScript strict, App Router, Tailwind) bootstrapped.
- package.json scripts wired: dev, build, lint, typecheck, test, probe, verify:tx.
- Installed @somnia-chain/markets-sdk@0.30.0, viem@2.56.3, lucide-react, tsx, vitest.
- lib/wallet/chain.ts: Shannon 50312 chain definition, tUSDC address/decimals.
- lib/attribution/campaigns.ts: CryptoBrief/BossRaid/CreatorDemo campaign IDs + parsing helpers.
- scripts/setup-test-wallet.ts + scripts/check-balance.ts: generated local probe wallet, confirmed 50 STT balance.
- SDK surface inspected & documented in notes/SDK_SURFACE.md.
- **Protocol Probe Executed:** Real Shannon transaction submitted and mined:
  - Tx: `0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a`
  - OrderPlaced event decoded with `placedOrder.userData === 1001n`
  - Proof preserved in `proof/latest.json`.
- `scripts/verify-tx.ts`: CLI verifier for on-chain attribution testing (`npm run verify:tx`).
- `lib/dreamdex/execution.ts`: Order execution helper for `placeBinaryOrder` and tUSDC faucet.
- `app/trade/page.tsx`: Full interactive trade UI with dual wallet support (Instant Testnet Demo Wallet + MetaMask), live market countdown, campaign selector, and on-chain verification modal.
- `app/api/trade/place-demo-order/route.ts`: Server-side execution route allowing 1-click testnet trading for judges without requiring wallet extensions.
- `app/api/trade/faucet/route.ts`: Testnet token faucet integration.
- `app/dashboard/page.tsx`: Real verified activity ledger showing on-chain attributed orders.
- `app/verify/page.tsx`: Raw transaction receipt verifier with 1-click proof verification.
- `app/integrations/page.tsx`: Campaign URLs, custom URL builder, and smart contract code examples.
- `app/page.tsx`: Rich landing page with hero, flow diagram, and live proof badge.
- `SDK_FEEDBACK.md`: Detailed documentation of genuine SDK findings (placeBinaryOrder vs placeOrder, GraphQL clobStatus column, wsRpcUrl requirement).
- `CLAIMS.md`, `README.md`, `JUDGES.md`: All updated and aligned with actual verified on-chain reality.
- `npm run typecheck`, `npm test`, `npm run build`: All passing with 0 errors.

## Known proof transactions
- `0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a` (Shannon Testnet, Block 485731720, userData: 1001)
