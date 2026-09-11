import { existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const ENV_LOCAL_PATH = resolve(process.cwd(), ".env.local");

function readEnvLocal(): Record<string, string> {
  if (!existsSync(ENV_LOCAL_PATH)) return {};
  const text = readFileSync(ENV_LOCAL_PATH, "utf8");
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return out;
}

function main() {
  const existing = readEnvLocal();
  const envKey = process.env.PROBE_PRIVATE_KEY ?? existing.PROBE_PRIVATE_KEY;

  if (envKey) {
    const account = privateKeyToAccount(envKey as `0x${string}`);
    console.log(account.address);
    return;
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  if (!existsSync(ENV_LOCAL_PATH)) {
    writeFileSync(ENV_LOCAL_PATH, "");
  }
  appendFileSync(ENV_LOCAL_PATH, `\nPROBE_PRIVATE_KEY=${privateKey}\n`);

  console.log(account.address);
}

main();
