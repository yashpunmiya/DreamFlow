import { describe, test, expect } from "vitest";
import {
  CAMPAIGNS,
  CAMPAIGN_LIST,
  isValidCampaignId,
  getCampaignById,
  parseCampaignParam,
  DEFAULT_CAMPAIGN,
} from "./campaigns";

describe("campaigns", () => {
  test("campaign IDs fit within uint64", () => {
    const UINT64_MAX = 2n ** 64n - 1n;
    for (const campaign of CAMPAIGN_LIST) {
      expect(campaign.id).toBeGreaterThanOrEqual(0n);
      expect(campaign.id).toBeLessThanOrEqual(UINT64_MAX);
    }
  });

  test("isValidCampaignId rejects out of range", () => {
    expect(isValidCampaignId(0n)).toBe(true);
    expect(isValidCampaignId(1001n)).toBe(true);
    expect(isValidCampaignId(-1n)).toBe(false);
    expect(isValidCampaignId(2n ** 64n)).toBe(false);
  });

  test("getCampaignById returns correct campaign", () => {
    expect(getCampaignById(1001n)).toEqual(CAMPAIGNS.cryptoBrief);
    expect(getCampaignById(2001n)).toEqual(CAMPAIGNS.bossRaid);
    expect(getCampaignById(3001n)).toEqual(CAMPAIGNS.creatorDemo);
    expect(getCampaignById(9999n)).toBeUndefined();
  });

  test("parseCampaignParam handles valid and invalid input", () => {
    expect(parseCampaignParam("1001")).toEqual(CAMPAIGNS.cryptoBrief);
    expect(parseCampaignParam("2001")).toEqual(CAMPAIGNS.bossRaid);
    expect(parseCampaignParam("9999")).toBeUndefined();
    expect(parseCampaignParam("")).toBeUndefined();
    expect(parseCampaignParam(null)).toBeUndefined();
    expect(parseCampaignParam("abc")).toBeUndefined();
    expect(parseCampaignParam("-1")).toBeUndefined();
  });

  test("DEFAULT_CAMPAIGN is CryptoBrief", () => {
    expect(DEFAULT_CAMPAIGN).toEqual(CAMPAIGNS.cryptoBrief);
  });
});
