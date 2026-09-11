"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  ExternalLink,
  Code2,
  Sparkles,
  Link2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { NetworkBadge } from "@/components/NetworkBadge";
import { CAMPAIGNS } from "@/lib/attribution/campaigns";

export default function IntegrationsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [customCampaignId, setCustomCampaignId] = useState("5001");
  const [customName, setCustomName] = useState("MyCommunity");
  const [codeCopied, setCodeCopied] = useState(false);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const snippetCode = `import { createWalletClient, custom } from "viem";
import { binaryPoolWriteAbi } from "@/lib/dreamdex/abi";

// Unique campaign ID assigned to your acquisition channel
const CAMPAIGN_ID = 1001n; // e.g. CryptoBrief

// Place order with native userData field
const txHash = await walletClient.writeContract({
  address: poolAddress,
  abi: binaryPoolWriteAbi,
  functionName: "placeBinaryOrder",
  args: [
    0,                  // kind: 0 = BUY_YES (UP), 2 = BUY_NO (DOWN)
    990000n,            // price (aligned to tickSize)
    1000n,              // quantity (aligned to lotSize)
    marketExpiryNs,     // expireTimestampNs (<= marketExpiryNs)
    2,                  // orderType: 2 = IOC
    0,                  // selfMatchingOption
    "0x0000000000000000000000000000000000000000", // builder
    0n,                 // builderFeeBpsTimes1k (0 when pool cap is 0)
    CAMPAIGN_ID,        // ← ON-CHAIN ATTRIBUTION (userData)
  ],
});`;

  return (
    <div className="min-h-screen bg-[#07090b] text-slate-100 relative selection:bg-[#1E7F60]/30 selection:text-emerald-300">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-[#1E7F60]/10 blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#07090b]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform hover:opacity-90"
          >
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <NetworkBadge />
            <Link
              href="/trade"
              className="text-xs font-semibold px-4 py-2 bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:brightness-110 text-white rounded-xl shadow-lg shadow-[#1E7F60]/20 transition-all"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1E7F60]/15 text-[#2EB88A] border border-[#1E7F60]/30 mb-4">
            <Sparkles size={14} />
            DISTRIBUTION RAIL & SDK
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Channel Integrations & Deep Links
          </h1>
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
            Give every acquisition partner, crypto media publication, Telegram trading bot, or creator
            a cryptographically verifiable on-chain identity. DreamFlow routes orders with their unique{" "}
            <code className="text-[#2EB88A] font-mono bg-[#1E7F60]/10 px-1.5 py-0.5 rounded">userData</code> identifier directly into DreamDEX Event Contracts.
          </p>
        </div>

        {/* Standard Campaign URLs */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Link2 className="text-[#2EB88A]" size={18} />
            Pre-Configured Campaign Tracking URLs
          </h2>
          <div className="space-y-3">
            {Object.values(CAMPAIGNS).map((campaign) => {
              const url = `${origin}/trade?campaign=${campaign.id}`;
              return (
                <div
                  key={campaign.slug}
                  className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800/80 hover:border-slate-700/90 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-100">
                        {campaign.label}
                      </span>
                      <span className="px-2 py-0.5 bg-[#0a0d12] text-[10px] font-mono text-[#2EB88A] rounded border border-slate-800">
                        userData: {campaign.id.toString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">{campaign.type}</div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <code className="flex-1 sm:w-80 px-3.5 py-2 bg-[#0a0d12] border border-slate-800/90 rounded-xl text-xs font-mono text-[#2EB88A] truncate">
                      {url}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(url, campaign.slug)}
                      className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors flex-shrink-0"
                      title="Copy URL"
                    >
                      {copied === campaign.slug ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <Link
                      href={`/trade?campaign=${campaign.id}`}
                      className="p-2.5 bg-[#1E7F60]/15 hover:bg-[#1E7F60]/25 border border-[#1E7F60]/30 text-[#2EB88A] rounded-xl transition-colors flex-shrink-0"
                      title="Open in Trade"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Custom URL Builder */}
        <section className="mb-12">
          <div className="glass-panel-emerald p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="text-[#2EB88A]" size={18} />
              Custom Campaign URL Builder
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Generate a unique DreamFlow entry point for your own community, sub-brand, or affiliate channel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Partner / Campaign Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0d12] border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-[#1E7F60] focus:ring-1 focus:ring-[#1E7F60] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Unique Campaign ID (uint64)
                </label>
                <input
                  type="number"
                  value={customCampaignId}
                  onChange={(e) => setCustomCampaignId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0d12] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-[#1E7F60] focus:ring-1 focus:ring-[#1E7F60] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <code className="flex-1 px-3.5 py-2.5 bg-[#0a0d12] border border-[#1E7F60]/40 rounded-xl text-xs font-mono text-[#2EB88A] truncate">
                {`${origin}/trade?campaign=${customCampaignId}`}
              </code>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `${origin}/trade?campaign=${customCampaignId}`,
                    "custom"
                  )
                }
                className="px-5 py-2.5 bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#1E7F60]/20 flex items-center justify-center gap-1.5"
              >
                {copied === "custom" ? (
                  <>
                    <CheckCircle2 size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Custom URL
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Protocol Code Example */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="text-[#2EB88A]" size={18} />
              Direct Smart Contract Call (TypeScript & viem)
            </h2>
            <button
              type="button"
              onClick={() => copyCode(snippetCode)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0a0d12] hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {codeCopied ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <div className="glass-panel p-5 shadow-xl overflow-hidden border-slate-800/90">
            <div className="text-xs text-slate-400 mb-3 leading-relaxed">
              Attaching campaign attribution to DreamDEX Event Contracts directly in your smart contracts, telegram bots, or trading algorithmic execution:
            </div>
            <pre className="p-4 bg-[#0a0d12] rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <code>{snippetCode}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
