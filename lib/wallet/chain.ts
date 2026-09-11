import { defineChain } from "viem";

export const shannon = defineChain({
  id: 50312,
  name: "Somnia Shannon",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_SHANNON_RPC_URL ??
          "https://dream-rpc.somnia.network",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Shannon Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
  testnet: true,
});

export const SHANNON_CHAIN_ID = 50312;

export const TUSDC_ADDRESS = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E" as const;
export const TUSDC_DECIMALS = 6;
