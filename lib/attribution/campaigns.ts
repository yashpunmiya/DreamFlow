export type Campaign = {
  id: bigint;
  slug: string;
  label: string;
  type: string;
};

export const CAMPAIGNS = {
  cryptoBrief: {
    id: 1001n,
    slug: "crypto-brief",
    label: "CryptoBrief",
    type: "News Partner",
  },
  bossRaid: {
    id: 2001n,
    slug: "boss-raid",
    label: "BossRaid",
    type: "Game Partner",
  },
  creatorDemo: {
    id: 3001n,
    slug: "creator-demo",
    label: "Creator Demo",
    type: "Creator",
  },
} as const satisfies Record<string, Campaign>;

export const CAMPAIGN_LIST: Campaign[] = Object.values(CAMPAIGNS);

const UINT64_MAX = 2n ** 64n - 1n;

export function isValidCampaignId(id: bigint): boolean {
  return id >= 0n && id <= UINT64_MAX;
}

export function getCampaignById(id: bigint): Campaign | undefined {
  return CAMPAIGN_LIST.find((c) => c.id === id);
}

export function parseCampaignParam(value: string | null): Campaign | undefined {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return undefined;
  try {
    const id = BigInt(value);
    if (!isValidCampaignId(id)) return undefined;
    return getCampaignById(id);
  } catch {
    return undefined;
  }
}

export const DEFAULT_CAMPAIGN = CAMPAIGNS.cryptoBrief;
