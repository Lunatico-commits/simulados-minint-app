import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, BookMarked, Lightbulb, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TipData {
  titulo: string;
  categoria: string;
  conteudo: string;
  fonte: string;
}

export default function DicaDoDiaCard() {
  const [tip, setTip] = useState<TipData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDica = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch("/api/gemini/dica-do-dia");
      const data = await res.json();

      if (data.success && data.tip) {
        setTip(data.tip);
      }
    } catch (err) {
      console.error("Erro ao carregar Dica do Dia:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDica();
  }, []);

  return (
    <div className="bg-sleek-card border border-amber-500/30 rounded-3xl p-6 md:p-7 shadow-2xl relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-slate-100 tracking-wide flex items-center gap-2">
                Dica de Ouro do Dia
              </h3>
              <span className="text-[10px] font-mono font-bold bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400" /> IA Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Legislação, história de Angola e bizus exclusivos do concurso MININT
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => fetchDica(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-center px-3.5 py-1.5 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50"
          title="Gerar nova dica com IA"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "A gerar..." : "Outra Dica"}
        </button>
      </div>

      {/* Tip Content Body */}
      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono animate-pulse">
            A consultar bases legislativas e históricas do MININT com IA...
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {tip && (
            <motion.div
              key={tip.titulo}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base md:text-lg font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500">
                  {tip.titulo}
                </h4>
                <span className="text-[11px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800/60 px-3 py-1 rounded-lg">
                  {tip.categoria}
                </span>
              </div>

              <p className="text-xs md:text-sm text-slate-200 leading-relaxed bg-sleek-card-sec/60 border border-slate-800/60 p-4 rounded-2xl">
                "{tip.conteudo}"
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <BookMarked className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-slate-300">Fundamentação:</span>
                <span className="font-mono text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                  {tip.fonte}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
