import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { shannon } from "@/lib/wallet/chain";
import { placeAttributedOrder } from "@/lib/dreamdex/execution";
import type { BinaryMarket } from "@/lib/dreamdex/markets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { market, side, campaignId, quantityNum, priceNum } = body as {
      market: BinaryMarket;
      side: "UP" | "DOWN";
      campaignId: string | number;
      quantityNum?: number;
      priceNum?: number;
    };

    if (!market || !market.poolAddress) {
      return NextResponse.json({ error: "Market is required" }, { status: 400 });
    }

    const privateKey = process.env.PROBE_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Server demo wallet private key is not configured" },
        { status: 500 }
      );
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const publicClient = createPublicClient({
      chain: shannon,
      transport: http(),
    });

    const walletClient = createWalletClient({
      chain: shannon,
      transport: http(),
      account,
    });

    const result = await placeAttributedOrder({
      walletClient,
      publicClient,
      userAddress: account.address,
      market,
      side: side || "UP",
      campaignId: BigInt(campaignId || "1001"),
      priceNum: priceNum ?? 0.99,
      quantityNum: quantityNum ?? 1000,
    });

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      record: result.record,
      verification: result.verification,
    });
  } catch (error: any) {
    console.error("Demo trade failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute demo order on-chain" },
      { status: 500 }
    );
  }
}
