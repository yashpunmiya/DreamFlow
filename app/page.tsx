import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  ExternalLink,
  Layers,
  BarChart3,
  Sparkles,
  Search,
  ChevronRight,
  Database,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { NetworkBadge } from "@/components/NetworkBadge";
import { BrandLogo } from "@/components/BrandLogo";
import { getExplorerUrl } from "@/lib/dreamdex/network";

const PROOF_TX =
  "0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07090b] text-slate-100 selection:bg-[#2EB88A]/30 relative overflow-hidden bg-grid-pattern">
      {/* Ambient glowing radial lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#1E7F60]/15 via-[#145741]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] -left-64 w-[600px] h-[600px] bg-[#1E7F60]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Protocol Status Bar */}
      <div className="border-b border-white/[0.06] bg-[#0A0D10]/80 backdrop-blur-md px-6 py-2 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399]" />
            <span className="font-semibold text-slate-200">
              Shannon Testnet Verified:
            </span>
            <span className="hidden sm:inline text-slate-400">
              Real DreamDEX Event Contract orders attributed on-chain.
            </span>
          </div>
          <Link
            href={`/verify?tx=${PROOF_TX}`}
            className="text-[#34D399] hover:text-[#2EB88A] hover:underline flex items-center gap-1 font-medium transition-colors"
          >
            Verify Proof Tx (Block 485731720) <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-white/[0.06] bg-[#07090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <BrandLogo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
              <Link
                href="/trade"
                className="hover:text-white transition-colors"
              >
                Trade
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/integrations"
                className="hover:text-white transition-colors"
              >
                Integrations
              </Link>
              <Link
                href="/verify"
                className="hover:text-white transition-colors"
              >
                Verify Tx
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3.5">
            <NetworkBadge />
            <Link
              href="/trade"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white text-xs font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(46,184,138,0.25)] hover:shadow-[0_0_25px_rgba(46,184,138,0.4)]"
            >
              Launch Live App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
        <div className="max-w-3xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#145741]/20 border border-[#2EB88A]/30 text-xs font-semibold text-[#34D399] mb-8 shadow-[0_0_15px_rgba(46,184,138,0.15)]">
            <Zap size={13} />
            Attribution & Growth Rails for DreamDEX
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight mb-7">
            Attribute real orders.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] via-[#2EB88A] to-[#1E7F60]">
              Monetize verified flow.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl font-normal">
            Web3 marketing tracks clicks and bounces. DreamFlow uses DreamDEX&apos;s native{" "}
            <code className="text-[#34D399] font-mono bg-[#0D1512] px-1.5 py-0.5 rounded border border-[#2EB88A]/25">
              userData
            </code>{" "}
            field to attribute on-chain Event Contract orders to distribution channels,
            activating native Builder Code monetization when live pools permit.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-14">
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(46,184,138,0.3)] hover:shadow-[0_0_35px_rgba(46,184,138,0.5)]"
            >
              Try Live Demo
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass-panel hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] font-semibold text-sm transition-all"
            >
              <BarChart3 size={16} className="text-[#34D399]" />
              View Verified Ledger
            </Link>
            <Link
              href={`/verify?tx=${PROOF_TX}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#34D399] px-3 py-3 transition-colors"
            >
              <Search size={14} />
              Verify Proof on Shannon
            </Link>
          </div>

          {/* Key Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-white/[0.08]">
            <div className="p-4 rounded-xl glass-panel">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Network
              </div>
              <div className="text-base font-bold text-white font-mono">
                Shannon 50312
              </div>
            </div>
            <div className="p-4 rounded-xl glass-panel">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Contracts
              </div>
              <div className="text-base font-bold text-white font-mono">
                Live CLOB Pools
              </div>
            </div>
            <div className="p-4 rounded-xl glass-panel">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Attribution
              </div>
              <div className="text-base font-bold text-[#34D399] font-mono">
                Native userData
              </div>
            </div>
            <div className="p-4 rounded-xl glass-panel">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Policy
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                Zero Fake Data
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Architecture: 4-Step Rail */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#34D399] uppercase tracking-wider mb-3">
            <Layers size={14} />
            Cryptographic Flow Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How On-Chain Attribution Works
          </h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            A frictionless pipeline connecting off-chain marketing channels to on-chain DreamDEX CLOB execution without requiring proxy contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-[#2EB88A]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#145741]/30 border border-[#2EB88A]/30 flex items-center justify-center text-[#34D399] font-black text-sm mb-5 shadow-[0_0_12px_rgba(46,184,138,0.15)]">
              01
            </div>
            <h3 className="font-bold text-base text-white mb-2">Campaign Identity</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Every media partner, bot, or game receives a dedicated uint64 identifier (e.g., 1001 for CryptoBrief).
            </p>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#07090b] border border-white/[0.06] text-[11px] font-mono text-slate-300">
              CryptoBrief → ID: 1001
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-[#2EB88A]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#145741]/30 border border-[#2EB88A]/30 flex items-center justify-center text-[#34D399] font-black text-sm mb-5 shadow-[0_0_12px_rgba(46,184,138,0.15)]">
              02
            </div>
            <h3 className="font-bold text-base text-white mb-2">DreamFlow Router</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Orders placed encode the campaign identifier directly into DreamDEX’s native{" "}
              <code className="text-[#34D399] font-mono">userData</code> argument.
            </p>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#07090b] border border-white/[0.06] text-[11px] font-mono text-slate-300">
              placeBinaryOrder(..., 1001n)
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-[#2EB88A]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#145741]/30 border border-[#2EB88A]/30 flex items-center justify-center text-[#34D399] font-black text-sm mb-5 shadow-[0_0_12px_rgba(46,184,138,0.15)]">
              03
            </div>
            <h3 className="font-bold text-base text-white mb-2">OrderPlaced Event</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              The DreamDEX pool emits an on-chain event carrying the campaign identifier permanently in the block log.
            </p>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#07090b] border border-white/[0.06] text-[11px] font-mono text-emerald-400">
              event OrderPlaced(userData: 1001)
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl glass-panel relative group hover:border-[#2EB88A]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#145741]/30 border border-[#2EB88A]/30 flex items-center justify-center text-[#34D399] font-black text-sm mb-5 shadow-[0_0_12px_rgba(46,184,138,0.15)]">
              04
            </div>
            <h3 className="font-bold text-base text-white mb-2">Verified Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Verifiers decode the raw transaction receipt. Native Builder Code fees activate whenever pool caps permit.
            </p>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#07090b] border border-white/[0.06] text-[11px] font-mono text-slate-300">
              Attribution Proven ✓
            </div>
          </div>
        </div>

        {/* Highlighted Proof Card */}
        <div className="mt-8 p-6 rounded-2xl glass-panel-emerald flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#145741]/40 border border-[#2EB88A]/40 flex items-center justify-center text-[#34D399] flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-[#34D399] uppercase tracking-wider">
                  Verified On-Chain Proof
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#07090b] text-slate-300 border border-white/[0.08]">
                  Shannon Block 485731720
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                Live Protocol Probe: BTC Order Attributed to CryptoBrief (userData: 1001)
              </div>
              <div className="text-xs font-mono text-slate-400">
                Tx: {PROOF_TX}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/verify?tx=${PROOF_TX}`}
              className="px-4 py-2.5 rounded-xl glass-panel hover:bg-white/[0.08] text-slate-200 text-xs font-semibold transition-all"
            >
              Verify Receipt On-Chain
            </Link>
            <a
              href={getExplorerUrl(PROOF_TX)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(46,184,138,0.25)]"
            >
              Shannon Explorer <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* Comparison: Standard Web3 Clicks vs DreamFlow */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Real Trading Volume
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Why meta-infrastructure creates higher enterprise value than isolated frontends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Marketing */}
          <div className="p-8 rounded-2xl glass-panel">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Legacy Web3 Marketing
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-4">
              Clicks, Cookies & Sybil Noise
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Tracks clicks that bounce without placing a single order</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Vulnerable to bot inflation and referral spoofing</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Disconnected from actual DreamDEX pool settlement</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Zero cryptographic proof for distribution partners</span>
              </li>
            </ul>
          </div>

          {/* DreamFlow Attribution */}
          <div className="p-8 rounded-2xl glass-panel-emerald">
            <div className="text-xs font-bold text-[#34D399] uppercase tracking-wider mb-2">
              DreamFlow Infrastructure
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              Cryptographically Verified On-Chain Flow
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#34D399] flex-shrink-0 mt-0.5" />
                <span>Attributes actual mined DreamDEX Event Contract transactions</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#34D399] flex-shrink-0 mt-0.5" />
                <span>Permanent <code className="text-[#34D399] font-mono">userData</code> records inside the on-chain OrderPlaced event</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#34D399] flex-shrink-0 mt-0.5" />
                <span>Ready for native Builder Code fee monetization when live pools permit</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#34D399] flex-shrink-0 mt-0.5" />
                <span>Auditable independently by anyone using Somnia RPC or explorer</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-12 bg-[#050709]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" variant="full" />
            <span className="text-slate-600">|</span>
            <span>Somnia × DreamDEX Event Contracts Hackathon</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/trade" className="hover:text-white transition-colors">
              Trade Demo
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/integrations" className="hover:text-white transition-colors">
              Integrations
            </Link>
            <Link href="/verify" className="hover:text-white transition-colors">
              Verify Tx
            </Link>
            <a
              href="https://shannon-explorer.somnia.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              Shannon Explorer <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
