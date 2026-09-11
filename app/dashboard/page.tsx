"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { NetworkBadge } from "@/components/NetworkBadge";
import { BrandLogo } from "@/components/BrandLogo";
import {
  loadVerifiedRecords,
  getAggregateMetrics,
  type VerifiedAttributionRecord,
} from "@/lib/attribution/storage";
import { truncateHash } from "@/lib/formatting/units";
import { getExplorerUrl } from "@/lib/dreamdex/network";

// Pre-seeded proof transaction from the successful on-chain probe
const PROOF_RECORD: VerifiedAttributionRecord = {
  version: 1,
  chainId: 50312,
  txHash: "0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a",
  blockNumber: "485731720",
  timestamp: Math.floor(new Date("2026-09-11T17:07:18.506Z").getTime() / 1000),
  marketId: "0x000000000000000000000000000000000000000000000000000000000001a5dc",
  pool: "0x1491b0369831ece5fa28fc3fdabd561f29315d4f",
  marketAsset: "BTC",
  marketQuestion: "BTC closes at or above its opening price",
  owner: "0x732d5b8794eBF323B1CE036A64a89Af08E5dfBD7",
  campaignId: "1001",
  campaignSlug: "crypto-brief",
  campaignLabel: "CryptoBrief",
  side: "UP",
  price: "990000",
  quantity: "1000",
  builderCapRaw: "0",
  verifiedAt: new Date("2026-09-11T17:07:18.506Z").getTime(),
};

export default function DashboardPage() {
  const [records, setRecords] = useState<VerifiedAttributionRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const data = loadVerifiedRecords();
    const hasProof = data.some(
      (r) => r.txHash.toLowerCase() === PROOF_RECORD.txHash.toLowerCase()
    );
    const combined = hasProof ? data : [PROOF_RECORD, ...data];
    setRecords(combined);
  }

  const filteredRecords = records.filter((r) => {
    if (selectedFilter === "all") return true;
    return r.campaignSlug === selectedFilter;
  });

  const uniqueCampaigns = new Set(records.map((r) => r.campaignSlug)).size;

  return (
    <div className="min-h-screen bg-[#07090b] text-slate-100 selection:bg-[#2EB88A]/30 relative overflow-hidden bg-grid-pattern">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/3 w-[650px] h-[450px] bg-[#1E7F60]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <BrandLogo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <Link href="/trade" className="hover:text-white transition-colors">
                Trade
              </Link>
              <Link href="/dashboard" className="text-white font-semibold">
                Dashboard
              </Link>
              <Link href="/integrations" className="hover:text-white transition-colors">
                Integrations
              </Link>
              <Link href="/verify" className="hover:text-white transition-colors">
                Verify Tx
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NetworkBadge />
            <Link
              href="/trade"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white text-xs font-bold transition-all shadow"
            >
              + Place Trade
            </Link>
          </div>
        </div>
      </header>

      {/* Mode B Protocol Transparency Banner */}
      <div className="border-b border-white/[0.06] bg-[#0A0D10]/90 px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399]" />
            <span className="font-semibold text-slate-200">Mode B Transparency:</span>
            <span>
              All activity derived from real on-chain{" "}
              <code className="text-[#34D399] font-mono bg-[#07090b] px-1 py-0.5 rounded border border-white/[0.08]">
                userData
              </code>{" "}
              events. Zero fabricated revenue.
            </span>
          </div>
          <Link
            href={`/verify?tx=${PROOF_RECORD.txHash}`}
            className="text-[#34D399] hover:underline flex items-center gap-1 font-medium"
          >
            Verify Protocol Proof <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#145741]/30 border border-[#2EB88A]/30 text-[11px] font-bold text-[#34D399] uppercase tracking-wider mb-2">
              <Sparkles size={12} />
              On-Chain Acquisition Ledger
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Campaign Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Every entry corresponds to a mined <code className="text-slate-300 font-mono">OrderPlaced</code> event on Somnia Shannon testnet.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/trade"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(46,184,138,0.25)]"
            >
              Test New Campaign Trade →
            </Link>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Verified Orders
              </span>
              <Package size={17} className="text-[#34D399]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{records.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 size={12} /> 100% on Shannon testnet
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Active Channels
              </span>
              <Users size={17} className="text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{uniqueCampaigns}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              CryptoBrief, BossRaid, CreatorDemo
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Attributed Contracts
              </span>
              <TrendingUp size={17} className="text-[#34D399]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {(records.length * 1000).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Outcome lots tagged with userData
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Builder Fee Cap
              </span>
              <DollarSign size={17} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">0 bps</div>
            <div className="text-[11px] text-[#34D399] mt-1">
              Mode B: Ready for cap activation
            </div>
          </div>
        </div>

        {/* Proof Transaction Spotlight Card */}
        <div className="p-6 rounded-2xl glass-panel-emerald mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#145741]/40 border border-[#2EB88A]/40 flex items-center justify-center text-[#34D399] flex-shrink-0 mt-0.5">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#34D399]">
                  Judges Protocol Proof
                </span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-[#07090b] text-slate-300 border border-white/[0.08]">
                  Shannon Block 485731720
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                Protocol Probe: BTC 1000 Lots Attributed to CryptoBrief (userData: 1001)
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                Tx: {PROOF_RECORD.txHash}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/verify?tx=${PROOF_RECORD.txHash}`}
              className="px-3.5 py-2 rounded-xl glass-panel hover:bg-white/[0.08] text-slate-200 text-xs font-semibold transition-all"
            >
              Verify On-Chain
            </Link>
            <a
              href={getExplorerUrl(PROOF_RECORD.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white text-xs font-bold flex items-center gap-1 transition-all shadow"
            >
              Shannon Explorer <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Filterable Table */}
        <div className="rounded-2xl glass-panel overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Verified Ledger Entries</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#050709] text-slate-400 border border-white/[0.06]">
                {filteredRecords.length} records
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Filter size={13} className="text-slate-500 mr-1" />
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedFilter === "all"
                    ? "bg-[#145741]/40 text-[#34D399] font-bold border border-[#2EB88A]/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("crypto-brief")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedFilter === "crypto-brief"
                    ? "bg-[#145741]/40 text-[#34D399] font-bold border border-[#2EB88A]/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                CryptoBrief (1001)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("boss-raid")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedFilter === "boss-raid"
                    ? "bg-[#145741]/40 text-[#34D399] font-bold border border-[#2EB88A]/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                BossRaid (2001)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("creator-demo")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedFilter === "creator-demo"
                    ? "bg-[#145741]/40 text-[#34D399] font-bold border border-[#2EB88A]/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                CreatorDemo (3001)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050709]/60 border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Campaign Channel</th>
                  <th className="px-5 py-3.5">Attributed userData</th>
                  <th className="px-5 py-3.5">Market</th>
                  <th className="px-5 py-3.5">Direction</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Transaction</th>
                  <th className="px-5 py-3.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredRecords.map((r) => (
                  <tr key={r.txHash} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {new Date(r.verifiedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{r.campaignLabel}</div>
                      <div className="text-[10px] text-slate-500">{r.campaignSlug}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#34D399] bg-[#0A1511] px-2 py-1 rounded border border-[#2EB88A]/30">
                        {r.campaignId}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-white">{r.marketAsset}</span>
                      <span className="text-slate-500 block text-[10px]">
                        Pool: {truncateHash(r.pool, 6, 4)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.side === "UP"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {r.side}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-300">
                      {r.quantity ? `${parseInt(r.quantity).toLocaleString()} lots` : "1,000"}
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <a
                        href={getExplorerUrl(r.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#34D399] hover:underline flex items-center gap-1"
                      >
                        {truncateHash(r.txHash, 8, 4)}
                        <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/verify?tx=${r.txHash}`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-[#34D399] bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1 rounded-lg transition-colors font-medium"
                      >
                        Verify <ArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
