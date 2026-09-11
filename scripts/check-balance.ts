import { createPublicClient, http, formatEther } from "viem";
import { shannon } from "../lib/wallet/chain";

async function main() {
  const address = process.argv[2] as `0x${string}`;
  const client = createPublicClient({ chain: shannon, transport: http() });
  const bal = await client.getBalance({ address });
  console.log("STT balance:", formatEther(bal));
}

main();
