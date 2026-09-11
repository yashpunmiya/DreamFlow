import type { Campaign } from "@/lib/attribution/campaigns";

export function CampaignBadge({ campaign }: { campaign: Campaign }) {
  return (
    <div className="inline-flex flex-col gap-0.5 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
      <div className="text-xs text-slate-400">{campaign.type}</div>
      <div className="text-sm font-medium text-slate-200">{campaign.label}</div>
      <div className="text-xs text-slate-500 font-mono">ID: {campaign.id.toString()}</div>
    </div>
  );
}
