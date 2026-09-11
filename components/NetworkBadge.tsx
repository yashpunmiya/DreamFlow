import { shannon } from "@/lib/wallet/chain";

export function NetworkBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm">
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
      <span className="text-slate-200 font-medium">Shannon {shannon.id}</span>
    </div>
  );
}
