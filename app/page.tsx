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
  Coins,
  Search,
} from "lucide-react";
import { NetworkBadge } from "@/components/NetworkBadge";
import { getExplorerUrl } from "@/lib/dreamdex/network";

const PROOF_TX = "0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500/20">
      {/* Top Protocol Status Bar */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-950 border-b border-cyan-500/20 px-6 py-2">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between text-xs text-cyan-200/90 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="font-semibold text-cyan-300">Live on Shannon Testnet:</span>
            <span>
              Real DreamDEX Event Contracts order attributed on-chain.
            </span>
          </div>
          <Link
            href={`/verify?tx=${PROOF_TX}`}
            className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
          >
            Verify Proof Tx (Block 485731720) <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                D
              </span>
              DreamFlow
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <Link href="/trade" className="hover:text-cyan-400 transition-colors">
                Trade
              </Link>
              <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/integrations" className="hover:text-cyan-400 transition-colors">
                Integrations
              </Link>
              <Link href="/verify" className="hover:text-cyan-400 transition-colors">
                Verify Tx
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NetworkBadge />
            <Link
              href="/trade"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/25 rounded-full text-xs font-bold text-cyan-400 uppercase tracking-wide mb-6">
            <Zap size={13} />
            Growth Infrastructure for DreamDEX
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Attribute on-chain orders.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Verify real growth.
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            Most Web3 marketing tracks clicks and bounces. DreamFlow uses DreamDEX’s native{" "}
            <code className="text-cyan-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
              userData
            </code>{" "}
            field to attribute real on-chain Event Contract orders to distribution channels,
            with native Builder Code monetization when live pools permit.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-xl shadow-cyan-500/20"
            >
              Try Live Trading Demo
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-sm transition-all"
            >
              <BarChart3 size={16} className="text-cyan-400" />
              View Verified Dashboard
            </Link>
            <Link
              href={`/verify?tx=${PROOF_TX}`}
              className="inline-flex items-center gap-2 px-4 py-3.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Search size={14} />
              Verify Proof on Shannon
            </Link>
          </div>

          {/* Proof Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <div className="text-[11px] text-slate-500 font-medium">Network</div>
              <div className="text-sm font-bold text-slate-200">Shannon 50312</div>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <div className="text-[11px] text-slate-500 font-medium">Markets</div>
              <div className="text-sm font-bold text-slate-200">Live CLOB Contracts</div>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <div className="text-[11px] text-slate-500 font-medium">Attribution</div>
              <div className="text-sm font-bold text-cyan-400">Native userData</div>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <div className="text-[11px] text-slate-500 font-medium">Protocol Transparency</div>
              <div className="text-sm font-bold text-emerald-400">Zero Fake Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Architecture & Flow */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            How On-Chain Attribution Works
          </h2>
          <p className="text-sm text-slate-400">
            A frictionless pipeline translating off-chain distribution into cryptographically verifiable DreamDEX order events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mb-4">
              1
            </div>
            <h3 className="font-bold text-base text-slate-100 mb-2">Campaign Identity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every distribution channel receives a dedicated <code className="text-cyan-300 font-mono">uint64</code> ID (e.g. 1001 for CryptoBrief).
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold mb-4">
              2
            </div>
            <h3 className="font-bold text-base text-slate-100 mb-2">DreamFlow Router</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Orders placed via DreamFlow encode the campaign ID into the contract&apos;s native{" "}
              <code className="text-cyan-300 font-mono">userData</code> argument.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-4">
              3
            </div>
            <h3 className="font-bold text-base text-slate-100 mb-2">OrderPlaced Event</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The DreamDEX pool contract emits <code className="text-emerald-300 font-mono">OrderPlaced</code> carrying the exact campaign identifier in its event logs.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold mb-4">
              4
            </div>
            <h3 className="font-bold text-base text-slate-100 mb-2">Growth & Monetization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Partners verify conversions transparently. Native Builder Code fees activate automatically whenever pool caps allow.
            </p>
          </div>
        </div>

        {/* Highlighted Proof Box */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-cyan-400" />
            <div>
              <div className="text-sm font-bold text-white">
                Verified Proof Transaction on Shannon Testnet
              </div>
              <div className="text-xs font-mono text-slate-400">
                Hash: {PROOF_TX} (userData: 1001)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/verify?tx=${PROOF_TX}`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              Verify On-Chain
            </Link>
            <a
              href={getExplorerUrl(PROOF_TX)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
            >
              Shannon Explorer <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* Honest Positioning & Mode B disclosure */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Coins className="text-cyan-400" size={20} />
              Growth Infrastructure, Not Another Bot
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Other hackathon projects build isolated trading bots or prediction interfaces. DreamFlow is meta-infrastructure: we build the acquisition rails that allow ANY trading application, media site, or game to measure and monetize order flow on DreamDEX.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              By separating attribution from settlement and anchoring it in native pool parameters, DreamFlow provides verifiable attribution without requiring custom smart contracts.
            </p>
          </div>

          <div className="p-8 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={20} />
              Aggressive Honesty (Mode B)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              When our probe executed on Shannon, we read the live pool&apos;s{" "}
              <code className="text-slate-300 font-mono">getMaxBuilderFeeBpsTimes1k()</code>. The value was 0 bps.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rather than fabricate fake builder fee events, DreamFlow operates transparently in Mode B: full on-chain attribution active, with zero fake revenue. When DreamDEX governance raises the builder cap, the approval rail activates seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Built for <span className="text-slate-300 font-medium">Somnia × DreamDEX Event Contracts Hackathon</span>.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/trade" className="hover:text-slate-300 transition-colors">
              Trade Demo
            </Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/integrations" className="hover:text-slate-300 transition-colors">
              Integrations
            </Link>
            <Link href="/verify" className="hover:text-slate-300 transition-colors">
              Verify
            </Link>
            <a
              href="https://shannon-explorer.somnia.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              Shannon Explorer <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
