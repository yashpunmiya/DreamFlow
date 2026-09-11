import { SHANNON_CHAIN_ID, TUSDC_ADDRESS, shannon } from "../wallet/chain";

/**
 * Shannon testnet protocol addresses.
 * Matches build.md section 6.
 */
export const SHANNON_ADDRESSES = {
  binaryMarketsModule: "0x3ecC694Cef705358864a646142ac17A90E29e388",
  marketsCore: "0x2802504314685D89bF6C992CA5a8e7cC78bc0294",
  binarySettlement: "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23",
  outcomeToken6909: "0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9",
  oracleHub: "0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b",
  collateralRouter: "0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C",
  tUSDC: TUSDC_ADDRESS,
} as const;

export const INDEXER_URL = "https://dev.smk.somnia.host/v1/graphql";

export const EXPLORER_URL = "https://shannon-explorer.somnia.network";

export function getExplorerUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}

export { shannon, SHANNON_CHAIN_ID, TUSDC_ADDRESS };
