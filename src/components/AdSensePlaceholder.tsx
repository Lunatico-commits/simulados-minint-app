import React from "react";
import { Megaphone } from "lucide-react";

interface AdSensePlaceholderProps {
  slot?: "banner" | "card" | "inline";
  className?: string;
}

export default function AdSensePlaceholder({ slot = "banner", className = "" }: AdSensePlaceholderProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-dashed border-slate-800 bg-sleek-card-sec/40 p-4 text-center transition-all hover:border-slate-700/80 ${className}`}
      aria-label="Espaço Publicitário Google AdSense"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-2xl mx-auto px-2">
        <div className="flex items-center gap-2.5 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
          <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-amber-500/80">
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-400">Espaço Publicitário</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-500 text-[10px]">Google AdSense</span>
        </div>

        <div className="text-[10px] text-slate-600 font-mono italic">
          Anúncios relevantes para o seu estudo
        </div>
      </div>

      {/* Simulated Ad Banner Slot */}
      <div className="mt-3 py-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-center min-h-[60px]">
        <p className="text-xs text-slate-500 font-mono tracking-tight">
          [ AdSense Unit Slot #{slot.toUpperCase()} — Ready for ads.txt & Client ID ]
        </p>
      </div>
    </div>
  );
}
