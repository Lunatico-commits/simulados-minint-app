import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, Trophy, X, ChevronRight, Award } from "lucide-react";
import { playVictorySound } from "../utils/soundEffects";

export interface RankChangeNotice {
  direction: "up" | "down";
  delta: number;
  oldRank: number;
  newRank: number;
}

interface RankNotificationToastProps {
  notice: RankChangeNotice | null;
  onDismiss: () => void;
  onViewRanking: () => void;
}

export default function RankNotificationToast({
  notice,
  onDismiss,
  onViewRanking
}: RankNotificationToastProps) {
  useEffect(() => {
    if (notice) {
      if (notice.direction === "up") {
        playVictorySound();
      }

      const timer = setTimeout(() => {
        onDismiss();
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [notice, onDismiss]);

  if (!notice) return null;

  const isUp = notice.direction === "up";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] font-sans pointer-events-auto"
      >
        <div
          className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-3 ${
            isUp
              ? "bg-slate-900/95 border-emerald-500/50 shadow-emerald-500/20 text-slate-100"
              : "bg-slate-900/95 border-amber-500/50 shadow-amber-500/20 text-slate-100"
          }`}
        >
          {/* Top glow accent */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              isUp ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" : "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500"
            }`}
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${
                  isUp
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-5 h-5 animate-bounce" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                      isUp
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {isUp ? `▲ Subiu +${notice.delta}` : `▼ Caíu -${notice.delta}`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Ranking Geral</span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1 font-display">
                  {isUp ? "Avançaste no Ranking!" : "Aviso de Posição"}
                </h4>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pl-0.5">
            {isUp ? (
              <>
                Parabéns! Subiste <strong className="text-emerald-400 font-bold">{notice.delta} {notice.delta === 1 ? "posição" : "posições"}</strong> no ranking dos candidatos MININT. Estás agora em <strong className="text-amber-400 font-extrabold">#{notice.newRank}</strong> (era #{notice.oldRank}).
              </>
            ) : (
              <>
                Outro candidato pontuou e ultrapassou-te. Caíste <strong className="text-amber-400 font-bold">{notice.delta} {notice.delta === 1 ? "posição" : "posições"}</strong> no ranking (Agora em <strong className="text-slate-200 font-extrabold">#{notice.newRank}</strong>).
              </>
            )}
          </p>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Posição Atual: <strong className="text-amber-400">#{notice.newRank}</strong></span>
            </div>

            <button
              onClick={() => {
                onViewRanking();
                onDismiss();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                isUp
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30"
                  : "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/30"
              }`}
            >
              <span>Ver Ranking</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
