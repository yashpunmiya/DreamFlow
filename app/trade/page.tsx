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
  ArrowUpRight,
  Clock,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { NetworkBadge } from "@/components/NetworkBadge";
import { BrandLogo } from "@/components/BrandLogo";
import { Countdown } from "@/components/Countdown";
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
import { truncateHash } from "@/lib/formatting/units";
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
      alert("No Web3 wallet (MetaMask) detected. Please use the 1-Click Instant Demo Wallet.");
      return;
    }

    setIsConnectingBrowser(true);
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        const addr = accounts[0] as Address;
        setBrowserAddress(addr);

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
    setTradingStatus("Discovering pool parameters & checking expiry...");

    try {
      if (walletMode === "demo") {
        setTradingStatus("Broadcasting placeBinaryOrder with userData on Shannon...");
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

        setTradingStatus("Checking collateral allowance & signing on-chain...");
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
    <div className="min-h-screen bg-[#07090b] text-slate-100 selection:bg-[#2EB88A]/30 relative overflow-hidden bg-grid-pattern">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-[#1E7F60]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <BrandLogo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <Link href="/trade" className="text-white font-semibold">
                Trade
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
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NetworkBadge />
          </div>
        </div>
      </header>

      {/* Transparency status ticker */}
      <div className="border-b border-white/[0.06] bg-[#0A0D10]/90 px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399]" />
            <span className="font-semibold text-slate-200">Mode B Verified:</span>
            <span>
              Live pool Builder Cap is 0 bps. On-chain attribution active via{" "}
              <code className="text-[#34D399] font-mono bg-[#07090b] px-1 py-0.5 rounded border border-white/[0.08]">
                userData
              </code>
              .
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            Tick: 1,000 | Lot: 1,000 | Expiry: ns
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading && (
          <div className="text-center py-28">
            <RefreshCw className="animate-spin text-[#34D399] mx-auto mb-4" size={32} />
            <div className="text-slate-200 font-semibold text-base">
              Discovering live DreamDEX Event Contracts...
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Querying Somnia Hasura Indexer & reading pool parameters
            </div>
          </div>
        )}

        {error && !market && (
          <div className="p-8 rounded-2xl glass-panel text-center max-w-md mx-auto">
            <AlertCircle className="text-amber-400 mx-auto mb-3" size={36} />
            <div className="text-slate-100 font-bold text-lg mb-2">
              No Tradable Market Window Active
            </div>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">{error}</p>
            <button
              onClick={loadMarket}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(46,184,138,0.25)]"
            >
              Refresh Discovery
            </button>
          </div>
        )}

        {market && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Market Overview */}
            <div className="lg:col-span-5 space-y-5">
              {/* Market Card */}
              <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#145741]/40 border border-[#2EB88A]/30 flex items-center justify-center font-black text-xs text-[#34D399] shadow-[0_0_10px_rgba(46,184,138,0.15)]">
                      {market.asset}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400">
                        Binary Event Contract
                      </div>
                      <div className="text-base font-bold text-white tracking-tight">
                        {market.asset} / tUSDC
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#145741]/30 text-[#34D399] border border-[#2EB88A]/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                      {market.status}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#050709] border border-white/[0.06] mb-5">
                  <div className="text-xs text-slate-400 mb-1 font-medium">Market Question</div>
                  <div className="text-sm font-semibold text-slate-100 leading-snug">
                    {formatMarketName(market)}
                  </div>
                </div>

                {/* Countdown urgency bar */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0E11] border border-white/[0.06] mb-5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} className="text-[#34D399]" />
                    <span>Trading Window Expiry</span>
                  </div>
                  <Countdown market={market} />
                </div>

                {/* Contract specifics */}
                <div className="space-y-2 pt-4 border-t border-white/[0.06] text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Market ID</span>
                    <span className="font-mono text-slate-200">
                      {truncateHash(market.marketId, 8, 4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>CLOB Pool</span>
                    <a
                      href={getExplorerUrl(market.poolAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#34D399] hover:underline flex items-center gap-1"
                    >
                      {truncateHash(market.poolAddress, 8, 4)}
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Builder Fee Cap</span>
                    <span className="font-mono text-slate-300">0 bps (Mode B)</span>
                  </div>
                </div>
              </div>

              {/* Attribution Architecture Explanation Card */}
              <div className="p-5 rounded-2xl glass-panel">
                <div className="flex items-center gap-2 text-xs font-bold text-[#34D399] uppercase tracking-wider mb-2">
                  <ShieldCheck size={14} />
                  Native userData Attribution
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When you submit this order, DreamFlow encodes your selected campaign ID directly into the 9th parameter of{" "}
                  <code className="text-[#34D399] font-mono">placeBinaryOrder</code>.
                  The event log will emit <code className="text-white font-mono">OrderPlaced.placedOrder.userData = {selectedCampaign.id.toString()}</code>.
                </p>
              </div>
            </div>

            {/* Right Column: Order Placement Console */}
            <div className="lg:col-span-7 space-y-6">
              {/* Campaign Selection */}
              <div className="p-6 rounded-2xl glass-panel">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <Zap size={15} className="text-[#34D399]" />
                      1. Select Campaign Channel
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose which acquisition source will be attributed on-chain.
                    </p>
                  </div>
                  <Link
                    href="/integrations"
                    className="text-xs text-slate-400 hover:text-[#34D399] flex items-center gap-1 transition-colors"
                  >
                    Partner URLs <ChevronRight size={13} />
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
                        className={`p-4 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "border-[#2EB88A] bg-[#145741]/20 shadow-[0_0_15px_rgba(46,184,138,0.2)] ring-1 ring-[#2EB88A]/40"
                            : "border-white/[0.08] bg-[#0A0D10]/50 hover:border-white/[0.15] hover:bg-[#0A0D10]"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-[#34D399]">
                            <CheckCircle2 size={15} />
                          </div>
                        )}
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] mb-1">
                          {c.type}
                        </div>
                        <div className="text-sm font-bold text-white mb-1.5">
                          {c.label}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          userData:{" "}
                          <span className="text-[#34D399] font-semibold">
                            {c.id.toString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Execution Console */}
              <div className="p-6 rounded-2xl glass-panel space-y-6">
                {/* Dual Wallet Selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <Wallet size={15} className="text-[#34D399]" />
                      2. Execution Wallet
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Use the 1-click funded testnet wallet or connect your browser wallet.
                    </p>
                  </div>

                  <div className="flex p-1 rounded-xl bg-[#050709] border border-white/[0.08] text-xs">
                    <button
                      type="button"
                      onClick={() => setWalletMode("demo")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        walletMode === "demo"
                          ? "bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ⚡ 1-Click Demo Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletMode("browser")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        walletMode === "browser"
                          ? "bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      MetaMask
                    </button>
                  </div>
                </div>

                {/* Wallet Info Pill */}
                {walletMode === "demo" ? (
                  <div className="p-4 rounded-xl bg-[#0A0D10] border border-[#2EB88A]/25 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#145741]/40 border border-[#2EB88A]/30 flex items-center justify-center text-[#34D399] font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          Pre-Funded Shannon Testnet Wallet Active
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          0x732d5b8794eBF323B1CE036A64a89Af08E5dfBD7
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">STT:</span>{" "}
                        <span className="text-emerald-400 font-semibold">~50</span>
                      </div>
                      <div>
                        <span className="text-slate-500">tUSDC:</span>{" "}
                        <span className="text-[#34D399] font-semibold">100</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0A0D10] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
                    {browserAddress ? (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                            ✓
                          </div>
                          <div>
                            <div className="font-semibold text-white">MetaMask Connected</div>
                            <div className="text-slate-400 font-mono text-[11px]">
                              {truncateHash(browserAddress, 10, 6)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <div className="text-white">{parseFloat(sttBalance).toFixed(3)} STT</div>
                            <div className="text-[#34D399]">{parseFloat(tusdcBalance).toFixed(1)} tUSDC</div>
                          </div>
                          <button
                            type="button"
                            onClick={handleMintFaucet}
                            disabled={faucetLoading}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                          >
                            <Coins size={13} />
                            {faucetLoading ? "Minting..." : "Faucet (+100)"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-slate-400 text-xs">
                          Connect MetaMask to sign trades from your personal testnet account.
                        </span>
                        <button
                          type="button"
                          onClick={connectBrowserWallet}
                          disabled={isConnectingBrowser}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white text-xs font-bold transition-all shadow"
                        >
                          {isConnectingBrowser ? "Connecting..." : "Connect MetaMask"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Outcome Direction (UP / DOWN) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Outcome Direction
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSide("UP")}
                      className={`p-3.5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        side === "UP"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "border-white/[0.08] bg-[#0A0D10]/50 text-slate-400 hover:border-white/[0.15]"
                      }`}
                    >
                      <TrendingUp size={18} />
                      UP (BUY_YES)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("DOWN")}
                      className={`p-3.5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        side === "DOWN"
                          ? "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                          : "border-white/[0.08] bg-[#0A0D10]/50 text-slate-400 hover:border-white/[0.15]"
                      }`}
                    >
                      <TrendingUp size={18} className="rotate-180" />
                      DOWN (BUY_NO)
                    </button>
                  </div>
                </div>

                {/* Price & Quantity Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Execution Type & Price
                    </label>
                    <div className="px-3.5 py-2.5 bg-[#050709] border border-white/[0.08] rounded-xl text-xs font-mono text-slate-300 flex justify-between items-center">
                      <span>IOC Crossing</span>
                      <span className="text-[#34D399] font-bold">$0.99 tUSDC</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Quantity (Lots)
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1000, parseInt(e.target.value) || 1000))}
                      min="1000"
                      step="1000"
                      className="w-full px-3.5 py-2.5 bg-[#050709] border border-white/[0.08] rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-[#2EB88A]"
                    />
                  </div>
                </div>

                {/* Progress message during submission */}
                {tradingStatus && (
                  <div className="p-3.5 rounded-xl bg-[#145741]/20 border border-[#2EB88A]/30 text-xs text-[#34D399] flex items-center gap-2.5 animate-pulse">
                    <RefreshCw className="animate-spin" size={15} />
                    <span>{tradingStatus}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmitTrade}
                  disabled={isSubmitting || (walletMode === "browser" && !browserAddress)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(46,184,138,0.3)] hover:shadow-[0_0_35px_rgba(46,184,138,0.45)] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={17} />
                      Mining on Shannon Blockchain...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Place Attributed Trade (userData: {selectedCampaign.id.toString()})
                    </>
                  )}
                </button>
              </div>

              {/* Verified Result Card */}
              {verifiedResult && (
                <div className="p-6 rounded-2xl glass-panel-emerald relative overflow-hidden space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
                    <div className="w-10 h-10 rounded-xl bg-[#145741]/40 border border-[#2EB88A]/40 flex items-center justify-center text-[#34D399]">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Attribution Verified On-Chain ✓
                      </h3>
                      <p className="text-xs text-slate-400">
                        OrderPlaced event mined on Somnia Shannon testnet carrying campaign userData
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-slate-400">Tx Hash</span>
                        <a
                          href={getExplorerUrl(verifiedResult.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[#34D399] hover:underline flex items-center gap-1"
                        >
                          {truncateHash(verifiedResult.txHash, 8, 4)}
                          <ExternalLink size={11} />
                        </a>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-slate-400">Campaign</span>
                        <span className="font-bold text-white">
                          {verifiedResult.record?.campaignLabel}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-slate-400">Decoded userData</span>
                        <span className="font-mono font-bold text-[#34D399]">
                          {verifiedResult.record?.campaignId}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-slate-400">Direction / Size</span>
                        <span className="font-semibold text-white">
                          {verifiedResult.record?.side} ({verifiedResult.record?.quantity} lots)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-slate-400">Order ID</span>
                        <span className="font-mono text-slate-300">
                          {verifiedResult.record?.orderId || "Mined on-chain"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-slate-400">Builder Cap</span>
                        <span className="text-slate-300 font-mono">0 bps (Mode B)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href="/dashboard"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1E7F60] to-[#2EB88A] hover:from-[#196B51] hover:to-[#279E76] text-white font-bold text-xs text-center transition-all shadow"
                    >
                      View in Dashboard →
                    </Link>
                    <Link
                      href={`/verify?tx=${verifiedResult.txHash}`}
                      className="flex-1 py-2.5 px-4 rounded-xl glass-panel hover:bg-white/[0.08] text-slate-200 text-xs font-semibold text-center transition-all"
                    >
                      Verify Raw Receipt
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
        <div className="min-h-screen bg-[#07090b] text-slate-100 flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading DreamFlow Trade...</div>
        </div>
      }
    >
      <TradeContent />
    </Suspense>
  );
}
