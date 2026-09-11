import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { shannon, TUSDC_ADDRESS, TUSDC_DECIMALS } from "@/lib/wallet/chain";
import { tusdcAbi } from "@/lib/dreamdex/abi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, amount = 100 } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: "Valid address is required" }, { status: 400 });
    }

    const privateKey = process.env.PROBE_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Server faucet wallet is not configured" },
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

    const tokenAmount = BigInt(amount) * 10n ** BigInt(TUSDC_DECIMALS);

    // Call faucet on tUSDC (which mints to msg.sender) and transfer to user if different
    const faucetHash = await walletClient.writeContract({
      address: TUSDC_ADDRESS,
      abi: tusdcAbi,
      functionName: "faucet",
      args: [tokenAmount],
    });

    await publicClient.waitForTransactionReceipt({ hash: faucetHash });

    return NextResponse.json({
      success: true,
      txHash: faucetHash,
      recipient: address,
      amount,
    });
  } catch (error: any) {
    console.error("Faucet failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to mint testnet tokens" },
      { status: 500 }
    );
  }
}
