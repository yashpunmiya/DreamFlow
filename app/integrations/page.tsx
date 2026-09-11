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
} from "lucide-react";
import { NetworkBadge } from "@/components/NetworkBadge";
import { CAMPAIGNS } from "@/lib/attribution/campaigns";

export default function IntegrationsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [customCampaignId, setCustomCampaignId] = useState("5001");
  const [customName, setCustomName] = useState("MyCommunity");

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500/20">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-semibold tracking-tight text-slate-200">
              DreamFlow
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <NetworkBadge />
            <Link
              href="/trade"
              className="text-xs font-semibold px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
              Distribution Rail
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
              ON-CHAIN TRACKING
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Channel Integrations & URLs
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Give every acquisition partner, crypto media publication, Telegram bot, or creator
            a verifiable on-chain identity. DreamFlow routes orders with their unique{" "}
            <code className="text-cyan-300 font-mono">userData</code> identifier directly into DreamDEX Event Contracts.
          </p>
        </div>

        {/* Standard Campaign URLs */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Link2 className="text-cyan-400" size={18} />
            Pre-Configured Campaign Tracking URLs
          </h2>
          <div className="space-y-3">
            {Object.values(CAMPAIGNS).map((campaign) => {
              const url = `${origin}/trade?campaign=${campaign.id}`;
              return (
                <div
                  key={campaign.slug}
                  className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-100">
                        {campaign.label}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-mono text-cyan-300 rounded border border-slate-700">
                        userData: {campaign.id.toString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{campaign.type}</div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <code className="flex-1 sm:w-80 px-3 py-2 bg-slate-950 border border-slate-800/90 rounded-xl text-xs font-mono text-cyan-300 truncate">
                      {url}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(url, campaign.slug)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors flex-shrink-0"
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
                      className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl transition-colors flex-shrink-0"
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
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="text-cyan-400" size={18} />
              Custom Campaign URL Builder
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Generate a unique DreamFlow entry point for your own community or channel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Partner / Campaign Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Unique Campaign ID (uint64)
                </label>
                <input
                  type="number"
                  value={customCampaignId}
                  onChange={(e) => setCustomCampaignId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <code className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-300 truncate">
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
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
              >
                {copied === "custom" ? (
                  <>
                    <CheckCircle2 size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy URL
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Protocol Code Example */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Code2 className="text-cyan-400" size={18} />
            Direct Smart Contract Call (TypeScript & viem)
          </h2>
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl overflow-hidden">
            <div className="text-xs text-slate-400 mb-3 leading-relaxed">
              Attaching campaign attribution to DreamDEX Event Contracts directly in your smart contracts or bot:
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <code>{`import { createWalletClient, custom } from "viem";
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
});`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
