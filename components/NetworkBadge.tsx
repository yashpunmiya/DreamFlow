import { shannon } from "@/lib/wallet/chain";

export function NetworkBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D1512]/80 border border-[#2EB88A]/30 text-xs shadow-[0_0_12px_rgba(46,184,138,0.15)]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2EB88A]" />
      </span>
      <span className="text-slate-300 font-medium tracking-wide">
        Shannon <span className="text-[#34D399] font-mono">{shannon.id}</span>
      </span>
    </div>
  );
}
