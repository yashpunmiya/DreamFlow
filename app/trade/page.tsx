"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Wallet,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Coins,
  ChevronRight,
} from "lucide-react";
import { NetworkBadge } from "@/components/NetworkBadge";
import { Countdown } from "@/components/Countdown";
import { CampaignBadge } from "@/components/CampaignBadge";
import {
  getBestDemoMarket,
  formatMarketName,
  type BinaryMarket,
} from "@/lib/dreamdex/markets";
import {
  CAMPAIGNS,
  DEFAULT_CAMPAIGN,
  parseCampaignParam,
  type Campaign,
} from "@/lib/attribution/campaigns";
import { truncateHash, formatTUSDC } from "@/lib/formatting/units";
import { getExplorerUrl } from "@/lib/dreamdex/network";
import { saveVerifiedRecord } from "@/lib/attribution/storage";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  type Address,
} from "viem";
import { shannon, TUSDC_ADDRESS, TUSDC_DECIMALS } from "@/lib/wallet/chain";
import { tusdcAbi } from "@/lib/dreamdex/abi";
import { placeAttributedOrder, mintFaucet } from "@/lib/dreamdex/execution";

function TradeContent() {
  const searchParams = useSearchParams();
  const campaignParam = searchParams.get("campaign");

  const [market, setMarket] = useState<BinaryMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campaign selection
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(() => {
    return parseCampaignParam(campaignParam) || DEFAULT_CAMPAIGN;
  });

  // Trade inputs
  const [side, setSide] = useState<"UP" | "DOWN">("UP");
  const [quantity, setQuantity] = useState(1000);
  const [price] = useState(0.99);

  // Wallet mode: 'demo' or 'browser'
  const [walletMode, setWalletMode] = useState<"demo" | "browser">("demo");
  const [browserAddress, setBrowserAddress] = useState<Address | null>(null);
  const [isConnectingBrowser, setIsConnectingBrowser] = useState(false);
  const [sttBalance, setSttBalance] = useState<string>("0");
  const [tusdcBalance, setTusdcBalance] = useState<string>("0");

  // Execution state
  const [tradingStatus, setTradingStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);

  // Success modal/result
  const [verifiedResult, setVerifiedResult] = useState<any | null>(null);

  useEffect(() => {
    loadMarket();
    const interval = setInterval(loadMarket, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (campaignParam) {
      const found = parseCampaignParam(campaignParam);
      if (found) setSelectedCampaign(found);
    }
  }, [campaignParam]);

  useEffect(() => {
    if (walletMode === "browser" && browserAddress) {
      updateBalances(browserAddress);
    }
  }, [walletMode, browserAddress]);

  async function loadMarket() {
    try {
      const m = await getBestDemoMarket();
      if (!m) {
        setError("No suitable Trading markets found. Waiting for next window...");
        return;
      }
      setMarket(m);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live market");
    } finally {
      setLoading(false);
    }
  }

  async function updateBalances(address: Address) {
    try {
      const publicClient = createPublicClient({ chain: shannon, transport: http() });
      const [sttBal, tusdcBal] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: TUSDC_ADDRESS,
          abi: tusdcAbi,
          functionName: "balanceOf",
          args: [address],
        }),
      ]);
      setSttBalance(formatUnits(sttBal, 18));
      setTusdcBalance(formatUnits(tusdcBal, TUSDC_DECIMALS));
    } catch (err) {
      console.error("Failed to load balances:", err);
    }
  }

  async function connectBrowserWallet() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("No Web3 wallet (MetaMask) detected. Please use the Instant Demo Wallet.");
      return;
    }

    setIsConnectingBrowser(true);
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        const addr = accounts[0] as Address;
        setBrowserAddress(addr);

        // Switch or add Shannon chain
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xc488" }], // 50312 in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xc488",
                  chainName: "Somnia Shannon Testnet",
                  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
                  rpcUrls: ["https://dream-rpc.somnia.network"],
                  blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
                },
              ],
            });
          }
        }
        await updateBalances(addr);
      }
    } catch (err: any) {
      alert("Failed to connect wallet: " + err.message);
    } finally {
      setIsConnectingBrowser(false);
    }
  }

  async function handleMintFaucet() {
    setFaucetLoading(true);
    try {
      if (walletMode === "browser" && browserAddress) {
        const walletClient = createWalletClient({
          chain: shannon,
          transport: custom((window as any).ethereum),
          account: browserAddress,
        });
        const publicClient = createPublicClient({ chain: shannon, transport: http() });
        await mintFaucet(walletClient, publicClient, 100);
        await updateBalances(browserAddress);
        alert("Minted 100 tUSDC test collateral successfully!");
      } else {
        alert("Demo wallet is already pre-funded with 100 tUSDC and gas on Shannon.");
      }
    } catch (err: any) {
      alert("Faucet failed: " + err.message);
    } finally {
      setFaucetLoading(false);
    }
  }

  async function handleSubmitTrade() {
    if (!market) return;
    setIsSubmitting(true);
    setTradingStatus("Initiating attributed trade on Shannon testnet...");

    try {
      if (walletMode === "demo") {
        setTradingStatus("Submitting via pre-funded server wallet with userData...");
        const res = await fetch("/api/trade/place-demo-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            market,
            side,
            campaignId: selectedCampaign.id.toString(),
            quantityNum: quantity,
            priceNum: price,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Demo trade execution failed");
        }

        // Save to browser localStorage so dashboard reflects immediately
        if (data.record) {
          saveVerifiedRecord(data.record);
        }

        setVerifiedResult({
          txHash: data.txHash,
          record: data.record,
          verification: data.verification,
        });
      } else {
        if (!browserAddress) {
          throw new Error("Please connect your browser wallet first");
        }

        setTradingStatus("Checking collateral allowance & signing order...");
        const walletClient = createWalletClient({
          chain: shannon,
          transport: custom((window as any).ethereum),
          account: browserAddress,
        });
        const publicClient = createPublicClient({ chain: shannon, transport: http() });

        const result = await placeAttributedOrder({
          walletClient,
          publicClient,
          userAddress: browserAddress,
          market,
          side,
          campaignId: selectedCampaign.id,
          priceNum: price,
          quantityNum: quantity,
        });

        setVerifiedResult({
          txHash: result.txHash,
          record: result.record,
          verification: result.verification,
        });
        await updateBalances(browserAddress);
      }
    } catch (err: any) {
      console.error(err);
      alert("Order placement failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
      setTradingStatus(null);
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
            <Link
              href="/verify"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 transition-colors"
            >
              Verify Tx
            </Link>
          </div>
        </div>
      </header>

      {/* Mode B Notice Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-950 border-b border-cyan-500/20 px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between text-xs text-cyan-200/90 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="font-semibold text-cyan-300">Mode B Active:</span>
            <span>
              Native Builder Fee Cap on pool is 0 bps. Honest on-chain attribution
              active via <code className="font-mono bg-cyan-950 px-1 py-0.5 rounded text-cyan-200">userData</code>.
            </span>
          </div>
          <span className="text-slate-400">Zero fake revenue policy strictly enforced</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-24">
            <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-4" size={32} />
            <div className="text-slate-300 font-medium">Discovering live DreamDEX Event Contracts...</div>
            <div className="text-xs text-slate-500 mt-1">Connecting to Hasura GraphQL & Shannon RPC</div>
          </div>
        )}

        {error && !market && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-8 text-center backdrop-blur-sm shadow-xl">
            <AlertCircle className="text-amber-400 mx-auto mb-3" size={36} />
            <div className="text-slate-200 font-semibold text-lg mb-2">Market Discovery Status</div>
            <div className="text-slate-400 text-sm mb-6 max-w-md mx-auto">{error}</div>
            <button
              onClick={loadMarket}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/20"
            >
              Retry Discovery
            </button>
          </div>
        )}

        {market && (
          <div className="space-y-6">
            {/* Market Banner Card */}
            <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase tracking-wide">
                      {market.asset} Event Contract
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Shannon 50312</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {formatMarketName(market)}
                  </h1>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {market.status}
                  </div>
                  <Countdown market={market} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block">Market ID</span>
                  <span className="font-mono text-slate-300 font-medium">
                    {truncateHash(market.marketId, 8, 4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">CLOB Pool</span>
                  <span className="font-mono text-slate-300 font-medium">
                    {truncateHash(market.poolAddress, 8, 4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Builder Fee Cap</span>
                  <span className="text-slate-300 font-medium font-mono">0 bps (Mode B)</span>
                </div>
                <div className="text-right">
                  <a
                    href={getExplorerUrl(market.poolAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Contract <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Campaign Selection */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="text-cyan-400" size={18} />
                    1. Select Acquisition Campaign
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Orders will encode this campaign&apos;s uint64 ID into the native on-chain{" "}
                    <code className="text-cyan-300 font-mono">userData</code> field.
                  </p>
                </div>
                <Link
                  href="/integrations"
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                >
                  View campaign URLs <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.values(CAMPAIGNS).map((c) => {
                  const isSelected = selectedCampaign.id === c.id;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setSelectedCampaign(c)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/40"
                          : "border-slate-800/90 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/40"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-cyan-400">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      <div className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase mb-1">
                        {c.type}
                      </div>
                      <div className="font-bold text-slate-100 text-sm mb-1.5">{c.label}</div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <span className="text-slate-500">userData:</span>
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-semibold">
                          {c.id.toString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Execution Setup & Trading Panel */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Wallet className="text-cyan-400" size={18} />
                    2. Choose Execution Mode
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Execute with the 1-click funded testnet wallet or connect your browser wallet.
                  </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setWalletMode("demo")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      walletMode === "demo"
                        ? "bg-cyan-500 text-slate-950 font-semibold shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ⚡ Instant Testnet Wallet (1-Click)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletMode("browser")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      walletMode === "browser"
                        ? "bg-cyan-500 text-slate-950 font-semibold shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    MetaMask / Browser
                  </button>
                </div>
              </div>

              {/* Wallet Status Box */}
              {walletMode === "demo" ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">
                        Pre-Funded Shannon Test Wallet Active
                      </div>
                      <div className="text-slate-400 font-mono">
                        0x732d5b8794eBF323B1CE036A64a89Af08E5dfBD7
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div>
                      <span className="text-slate-500">Gas:</span>{" "}
                      <span className="text-emerald-400 font-semibold font-mono">~50 STT</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Collateral:</span>{" "}
                      <span className="text-cyan-400 font-semibold font-mono">100 tUSDC</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {browserAddress ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">Browser Wallet Connected</div>
                          <div className="text-slate-400 font-mono">
                            {truncateHash(browserAddress, 10, 6)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono text-slate-200">
                            {parseFloat(sttBalance).toFixed(3)} STT
                          </div>
                          <div className="font-mono text-cyan-300">
                            {parseFloat(tusdcBalance).toFixed(1)} tUSDC
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleMintFaucet}
                          disabled={faucetLoading}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Coins size={14} />
                          {faucetLoading ? "Minting..." : "Faucet (+100)"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-slate-400">
                        Connect MetaMask to sign with your own Shannon testnet address
                      </span>
                      <button
                        type="button"
                        onClick={connectBrowserWallet}
                        disabled={isConnectingBrowser}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition-all"
                      >
                        {isConnectingBrowser ? "Connecting..." : "Connect MetaMask"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Order Form */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Outcome Direction
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSide("UP")}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        side === "UP"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <TrendingUp size={18} />
                      UP (BUY_YES)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("DOWN")}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        side === "DOWN"
                          ? "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <TrendingUp size={18} className="rotate-180" />
                      DOWN (BUY_NO)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Order Type & Price
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex justify-between items-center">
                      <span>IOC Crossing</span>
                      <span className="text-cyan-400 font-semibold">$0.99 tUSDC</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Quantity (Lots)
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1000, parseInt(e.target.value) || 1000))}
                      min="1000"
                      step="1000"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Status indicator during submission */}
                {tradingStatus && (
                  <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 flex items-center gap-2.5 animate-pulse">
                    <RefreshCw className="animate-spin" size={14} />
                    <span>{tradingStatus}</span>
                  </div>
                )}

                {/* Place Order CTA */}
                <button
                  type="button"
                  onClick={handleSubmitTrade}
                  disabled={isSubmitting || (walletMode === "browser" && !browserAddress)}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-base rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Submitting on Shannon...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Place Attributed Order (userData: {selectedCampaign.id.toString()})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Verified Result Modal / Card */}
            {verifiedResult && (
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-emerald-500/20">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-400">
                      Attribution Verified On-Chain ✓
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real OrderPlaced event mined and confirmed on Somnia Shannon testnet
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Transaction</span>
                      <a
                        href={getExplorerUrl(verifiedResult.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {truncateHash(verifiedResult.txHash, 10, 6)} <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Campaign</span>
                      <span className="font-semibold text-slate-200">
                        {verifiedResult.record?.campaignLabel}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Attributed userData</span>
                      <span className="font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">
                        {verifiedResult.record?.campaignId}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Market</span>
                      <span className="text-slate-200 font-medium">
                        {verifiedResult.record?.marketAsset} (Side: {verifiedResult.record?.side})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Order ID</span>
                      <span className="font-mono text-slate-300">
                        {verifiedResult.record?.orderId || "Mined on-chain"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Protocol Mode</span>
                      <span className="text-slate-300">
                        Mode B (Cap: 0 bps — Attribution Active)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg text-center transition-all shadow"
                  >
                    View in Acquisition Dashboard →
                  </Link>
                  <Link
                    href={`/verify?tx=${verifiedResult.txHash}`}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg text-center transition-all"
                  >
                    Verify Raw Receipt from Scratch
                  </Link>
                  <a
                    href={getExplorerUrl(verifiedResult.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    Shannon Explorer <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading DreamFlow Trade...</div>
        </div>
      }
    >
      <TradeContent />
    </Suspense>
  );
}
