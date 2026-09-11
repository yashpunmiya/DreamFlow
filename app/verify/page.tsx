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
} from "lucide-react";
import { createPublicClient, http, isHex } from "viem";
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
              href="/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
              Independent Verification
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
              RAW LOGS DECODER
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Verify On-Chain Attribution
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Verify DreamFlow campaign attribution from any Shannon transaction hash.
            This decodes the raw receipt from scratch using Somnia ABIs — proving attribution
            exists directly on the blockchain without relying on any centralized server.
          </p>
        </div>

        {/* Input & 1-Click Proof */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 shadow-xl mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Somnia Shannon Transaction Hash
          </label>
          <div className="flex gap-2.5 mb-3">
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => verifyTransaction()}
              disabled={loading || !txHash}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              {loading ? (
                <span>Decoding...</span>
              ) : (
                <>
                  <Search size={15} />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-500">Need a test hash?</span>
            <button
              type="button"
              onClick={() => {
                setTxHash(DEFAULT_PROOF_TX);
                verifyTransaction(DEFAULT_PROOF_TX);
              }}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium underline underline-offset-4"
            >
              <Zap size={13} />
              1-Click Load Protocol Proof Transaction
            </button>
          </div>
        </div>

        {/* Verification Result */}
        {result && (
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-2xl space-y-6">
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
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Attributed Campaign</span>
                      <span className="font-bold text-slate-100 text-sm">
                        {result.campaign?.label || "Known Channel"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Campaign ID (userData)</span>
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        {result.orderPlaced?.userData.toString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Order Direction (isBid)</span>
                      <span className="font-semibold text-slate-200">
                        {result.orderPlaced?.isBid ? "BUY_YES (UP)" : "BUY_NO (DOWN)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Order ID</span>
                      <span className="font-mono text-slate-300">
                        {result.orderPlaced?.orderId || "Mined on-chain"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Full Quantity</span>
                      <span className="font-mono text-slate-300">
                        {result.orderPlaced?.fullQuantity.toString()} outcome lots
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Order Owner</span>
                      <span className="font-mono text-slate-300">
                        {truncateHash(result.orderPlaced?.owner || "", 12, 6)}
                      </span>
                    </div>
                  </div>
                </div>

                {receiptMeta && (
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <div>
                      Block: <span className="font-mono text-slate-200">{receiptMeta.blockNumber.toString()}</span>
                    </div>
                    <div>
                      Gas Used: <span className="font-mono text-slate-200">{receiptMeta.gasUsed.toString()}</span>
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
                    className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    View Raw Receipt on Shannon Explorer <ExternalLink size={14} />
                  </a>
                  <Link
                    href="/dashboard"
                    className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
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
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading DreamFlow Verifier...</div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
