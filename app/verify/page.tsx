"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Database,
  Layers,
  Sparkles,
  Hash,
} from "lucide-react";
import { createPublicClient, http, isHex } from "viem";
import { BrandLogo } from "@/components/BrandLogo";
import { NetworkBadge } from "@/components/NetworkBadge";
import { shannon } from "@/lib/wallet/chain";
import {
  verifyAttributionFromReceipt,
  type AttributionVerificationResult,
} from "@/lib/attribution/decoder";
import { truncateHash, formatTUSDC } from "@/lib/formatting/units";
import { getExplorerUrl } from "@/lib/dreamdex/network";

const DEFAULT_PROOF_TX =
  "0xf963e78106461c5184811c49f6a2bb8abb748ace11c51b194c85ace4492a211a";

function VerifyContent() {
  const searchParams = useSearchParams();
  const txParam = searchParams.get("tx");

  const [txHash, setTxHash] = useState(txParam || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AttributionVerificationResult | null>(null);
  const [receiptMeta, setReceiptMeta] = useState<{
    blockNumber: bigint;
    gasUsed: bigint;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (txParam && isHex(txParam)) {
      setTxHash(txParam);
      verifyTransaction(txParam);
    }
  }, [txParam]);

  async function verifyTransaction(hashToVerify?: string) {
    const hash = (hashToVerify || txHash).trim();
    if (!hash || !isHex(hash)) {
      alert("Please enter a valid 0x transaction hash");
      return;
    }

    setLoading(true);
    setResult(null);
    setReceiptMeta(null);

    try {
      const publicClient = createPublicClient({
        chain: shannon,
        transport: http(),
      });

      const receipt = await publicClient.getTransactionReceipt({
        hash: hash as `0x${string}`,
      });

      setReceiptMeta({
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
      });

      const verification = verifyAttributionFromReceipt(receipt);
      setResult(verification);
    } catch (err: any) {
      setResult({
        verified: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch transaction from Shannon RPC",
      });
    } finally {
      setLoading(false);
    }
  }

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
              href="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/trade"
              className="text-xs font-semibold px-3.5 py-1.5 bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:brightness-110 text-white rounded-xl shadow-lg shadow-[#1E7F60]/20 transition-all"
            >
              Live Trade
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1E7F60]/15 text-[#2EB88A] border border-[#1E7F60]/30 mb-4">
            <ShieldCheck size={14} />
            RAW LOGS CRYPTOGRAPHIC VERIFIER
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verify On-Chain Attribution
          </h1>
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
            Verify DreamFlow campaign attribution from any Somnia Shannon transaction hash.
            This decodes the raw receipt from scratch using Somnia ABIs — cryptographically proving attribution
            exists directly on the blockchain without relying on any centralized server.
          </p>
        </div>

        {/* Input & 1-Click Proof */}
        <div className="glass-panel p-6 shadow-xl mb-6 border-slate-800/90">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Hash size={14} className="text-[#2EB88A]" />
            Somnia Shannon Transaction Hash
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-3 bg-[#0a0d12] border border-slate-800 rounded-xl font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#1E7F60] focus:ring-1 focus:ring-[#1E7F60] transition-all"
            />
            <button
              onClick={() => verifyTransaction()}
              disabled={loading || !txHash}
              className="px-6 py-3 bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:brightness-110 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#1E7F60]/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Decoding...</span>
                </>
              ) : (
                <>
                  <Search size={15} />
                  <span>Verify Hash</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60 text-xs">
            <span className="text-slate-500">Looking for a verified proof on Shannon?</span>
            <button
              type="button"
              onClick={() => {
                setTxHash(DEFAULT_PROOF_TX);
                verifyTransaction(DEFAULT_PROOF_TX);
              }}
              className="text-[#2EB88A] hover:text-[#38e2aa] flex items-center gap-1.5 font-semibold transition-colors"
            >
              <Zap size={14} className="animate-pulse" />
              1-Click Load Protocol Proof Transaction
            </button>
          </div>
        </div>

        {/* Verification Result */}
        {result && (
          <div className="glass-panel p-6 shadow-2xl space-y-6 border-slate-800/90 animate-fadeIn">
            {result.verified ? (
              <>
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                      Valid DreamFlow Attributable Order ✓
                    </div>
                    <div className="text-xs text-slate-400">
                      OrderPlaced event verified with valid campaign userData on Shannon
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div className="p-3.5 bg-[#0a0d12] rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-1 font-medium">Attributed Campaign</span>
                      <span className="font-bold text-slate-100 text-sm">
                        {result.campaign?.label || "Known Channel"}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#0a0d12] rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-1 font-medium">Campaign ID (userData)</span>
                      <span className="font-mono font-bold text-[#2EB88A] text-sm">
                        {result.orderPlaced?.userData.toString()}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#0a0d12] rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-1 font-medium">Order Direction (isBid)</span>
                      <span className="font-semibold text-slate-200">
                        {result.orderPlaced?.isBid ? "BUY_YES (UP)" : "BUY_NO (DOWN)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-[#0a0d12] rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-1 font-medium">Order ID</span>
                      <span className="font-mono text-slate-300">
                        {result.orderPlaced?.orderId || "Mined on-chain"}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#0a0d12] rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-1 font-medium">Full Quantity</span>
                      <span className="font-mono text-slate-300">
                        {result.orderPlaced?.fullQuantity.toString()} outcome lots
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#0a0d12] rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-1 font-medium">Order Owner</span>
                      <span className="font-mono text-slate-300">
                        {truncateHash(result.orderPlaced?.owner || "", 12, 6)}
                      </span>
                    </div>
                  </div>
                </div>

                {receiptMeta && (
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <div>
                      Block: <span className="font-mono text-slate-200 font-semibold">{receiptMeta.blockNumber.toString()}</span>
                    </div>
                    <div>
                      Gas Used: <span className="font-mono text-slate-200 font-semibold">{receiptMeta.gasUsed.toString()}</span>
                    </div>
                    <div>
                      Receipt Status: <span className="text-emerald-400 font-semibold uppercase">{receiptMeta.status}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:brightness-110 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#1E7F60]/20"
                  >
                    View Raw Receipt on Shannon Explorer <ExternalLink size={14} />
                  </a>
                  <Link
                    href="/dashboard"
                    className="py-3 px-5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    View Dashboard <ArrowUpRight size={14} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 text-center">
                <XCircle className="text-rose-400 mx-auto mb-3" size={36} />
                <div className="text-lg font-bold text-rose-400 mb-1">
                  Attribution Not Verified
                </div>
                <div className="text-xs text-slate-400 max-w-md mx-auto">
                  {result.error || "No valid DreamDEX OrderPlaced event with campaign attribution found in this transaction."}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090b] text-slate-100 flex items-center justify-center">
          <div className="text-slate-400 text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#1E7F60] border-t-white rounded-full animate-spin" />
            Loading DreamFlow Verifier...
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
