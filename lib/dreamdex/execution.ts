import {
  type Address,
  type PublicClient,
  type WalletClient,
  type TransactionReceipt,
} from "viem";
import { binaryPoolReadAbi, binaryPoolWriteAbi, tusdcAbi } from "./abi";
import { TUSDC_ADDRESS, TUSDC_DECIMALS } from "../wallet/chain";
import { verifyAttributionFromReceipt, type AttributionVerificationResult } from "../attribution/decoder";
import { saveVerifiedRecord, type VerifiedAttributionRecord } from "../attribution/storage";
import { getCampaignById } from "../attribution/campaigns";
import type { BinaryMarket } from "./markets";

export interface PlaceOrderInput {
  walletClient: WalletClient;
  publicClient: PublicClient;
  userAddress: Address;
  market: BinaryMarket;
  side: "UP" | "DOWN";
  campaignId: bigint;
  priceNum?: number; // human price, default 0.99 for crossing book
  quantityNum?: number; // count of contracts, default 1000
}

export interface PlaceOrderOutput {
  txHash: `0x${string}`;
  receipt: TransactionReceipt;
  verification: AttributionVerificationResult;
  record: VerifiedAttributionRecord;
}

/**
 * Mint tUSDC collateral from faucet for testing.
 */
export async function mintFaucet(
  walletClient: WalletClient,
  publicClient: PublicClient,
  amountTUsdc: number = 100
): Promise<`0x${string}`> {
  const account = walletClient.account;
  if (!account) throw new Error("Wallet client has no account connected");

  const amount = BigInt(amountTUsdc) * 10n ** BigInt(TUSDC_DECIMALS);
  const hash = await walletClient.writeContract({
    address: TUSDC_ADDRESS,
    abi: tusdcAbi,
    functionName: "faucet",
    args: [amount],
    account,
    chain: walletClient.chain,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Place a real attributed DreamDEX binary order with userData campaign tracking.
 */
export async function placeAttributedOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderOutput> {
  const { walletClient, publicClient, userAddress, market, side, campaignId } = input;
  const poolAddress = market.poolAddress as Address;

  // 1. Read pool parameters and expiry
  const [poolParams, builderCap, marketExpiryNs] = await Promise.all([
    publicClient.readContract({
      address: poolAddress,
      abi: binaryPoolReadAbi,
      functionName: "getOrderBookParameters",
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: binaryPoolReadAbi,
      functionName: "getMaxBuilderFeeBpsTimes1k",
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: binaryPoolReadAbi,
      functionName: "marketExpiryNs",
    }),
  ]);

  const oneCollateral = 10n ** BigInt(TUSDC_DECIMALS);
  const tick = BigInt(poolParams.tickSize);
  const lot = BigInt(poolParams.lotSize);
  const rawMinQuantity = BigInt(poolParams.minQuantity);

  // Kind: 0 = BUY_YES (UP), 2 = BUY_NO (DOWN)
  const kind = side === "UP" ? 0 : 2;

  // Align price to tick
  const priceRatio = input.priceNum ?? 0.99;
  const rawPrice = (oneCollateral * BigInt(Math.round(priceRatio * 100))) / 100n;
  const price = (rawPrice / tick) * tick;

  // Align quantity to lot size, ensuring >= minQuantity
  const reqQty = BigInt(input.quantityNum ?? 1000);
  const targetQty = reqQty > rawMinQuantity ? reqQty : rawMinQuantity;
  const quantity = targetQty < lot ? lot : ((targetQty + lot - 1n) / lot) * lot;

  // Ensure expiry <= marketExpiryNs
  const expireTimestampNs = marketExpiryNs;
  const orderType = 2; // IOC
  const selfMatchingOption = 0;
  const builder = "0x0000000000000000000000000000000000000000" as Address;
  const builderFeeBpsTimes1k = 0n;

  // 2. Check and approve collateral
  const allowance = await publicClient.readContract({
    address: TUSDC_ADDRESS,
    abi: tusdcAbi,
    functionName: "allowance",
    args: [userAddress, poolAddress],
  });

  const neededCollateral = (price * quantity + oneCollateral - 1n) / oneCollateral;
  if (allowance < neededCollateral) {
    const approveHash = await walletClient.writeContract({
      address: TUSDC_ADDRESS,
      abi: tusdcAbi,
      functionName: "approve",
      args: [poolAddress, neededCollateral * 100n],
      account: userAddress,
      chain: walletClient.chain,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  // 3. Submit placeBinaryOrder
  const txHash = await walletClient.writeContract({
    address: poolAddress,
    abi: binaryPoolWriteAbi,
    functionName: "placeBinaryOrder",
    args: [
      kind,
      price,
      quantity,
      expireTimestampNs,
      orderType,
      selfMatchingOption,
      builder,
      builderFeeBpsTimes1k,
      campaignId,
    ],
    account: userAddress,
    chain: walletClient.chain,
  });

  // 4. Wait for receipt and verify attribution
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const verification = verifyAttributionFromReceipt(receipt);

  if (!verification.verified) {
    throw new Error(
      verification.error || "Order was submitted but attribution verification failed"
    );
  }

  const campaign = getCampaignById(campaignId);

  // 5. Save verified record
  const record: VerifiedAttributionRecord = {
    version: 1,
    chainId: walletClient.chain?.id ?? 50312,
    txHash,
    blockNumber: receipt.blockNumber.toString(),
    timestamp: Math.floor(Date.now() / 1000),
    marketId: market.marketId as `0x${string}`,
    pool: poolAddress,
    marketAsset: market.asset,
    marketQuestion: market.question,
    owner: userAddress,
    orderId: verification.orderPlaced?.orderId,
    campaignId: campaignId.toString(),
    campaignSlug: campaign?.slug || "custom",
    campaignLabel: campaign?.label || `Campaign #${campaignId}`,
    side,
    price: price.toString(),
    quantity: quantity.toString(),
    filledQuantity: verification.orderFilled?.quantity.toString(),
    fillPrice: verification.orderFilled?.price.toString(),
    builderAddress: builder,
    builderCapRaw: builderCap.toString(),
    verifiedAt: Date.now(),
  };

  saveVerifiedRecord(record);

  return {
    txHash,
    receipt,
    verification,
    record,
  };
}
