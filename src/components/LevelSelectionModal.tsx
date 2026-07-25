import React from "react";
import { GraduationCap, X, Check, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Level } from "../types";
import { LEVEL_INFO } from "../data/questions";
import { motion, AnimatePresence } from "motion/react";

interface LevelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: Level) => void;
  currentLevel: Level;
  categoryName?: string | null;
}

export default function LevelSelectionModal({
  isOpen,
  onClose,
  onSelectLevel,
  currentLevel,
  categoryName
}: LevelSelectionModalProps) {
  if (!isOpen) return null;

  const levelsList: Level[] = ["basico", "medio", "superior"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-sleek-card border border-amber-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-lg sm:max-w-xl w-[94%] sm:w-full shadow-2xl relative overflow-hidden font-sans text-slate-200 my-auto"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-amber-600"></div>

          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 sm:pb-4 mb-3 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3 pr-2">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Edital MININT 2026
                </span>
                <h3 className="text-sm sm:text-lg md:text-xl font-bold font-display text-slate-100 tracking-tight leading-tight">
                  Selecione o seu Nível Académico
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-sleek-card-hover transition-colors border border-transparent hover:border-slate-800 cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Banner */}
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3.5 bg-sleek-card-sec/80 border border-slate-800/80 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
                Simulado: <strong className="text-amber-400 font-semibold">{categoryName || "Geral Completo"}</strong>
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
              Início Imediato
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400 leading-snug sm:leading-relaxed mb-3 sm:mb-4">
            Escolha o grau académico exigido para a sua candidatura para adaptar as questões ao edital oficial:
          </p>

          {/* Level Selection Cards */}
          <div className="space-y-2 sm:space-y-3">
            {levelsList.map((lvl) => {
              const info = LEVEL_INFO[lvl];
              const isDefault = currentLevel === lvl;

              let accentBg = "hover:border-slate-700 bg-sleek-card-sec/50";
              let badgeBg = "bg-slate-800 text-slate-300 border-slate-700";
              let hoverText = "group-hover:text-amber-400";

              if (lvl === "basico") {
                badgeBg = "bg-emerald-950/80 text-emerald-400 border-emerald-800/60";
              } else if (lvl === "medio") {
                badgeBg = "bg-amber-950/80 text-amber-400 border-amber-800/60";
              } else if (lvl === "superior") {
                badgeBg = "bg-blue-950/80 text-blue-400 border-blue-800/60";
              }

              if (isDefault) {
                accentBg = "border-amber-500/80 bg-amber-950/20 shadow-md ring-1 ring-amber-500/20";
              }

              return (
                <motion.button
                  key={lvl}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectLevel(lvl)}
                  className={`w-full p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border text-left cursor-pointer transition-all duration-150 flex items-center justify-between gap-2.5 sm:gap-4 relative group ${accentBg}`}
                >
                  <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
                        {info.badge}
                      </span>
                      {isDefault && (
                        <span className="text-[9px] sm:text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full uppercase">
                          Atual
                        </span>
                      )}
                    </div>
                    <h4 className={`text-xs sm:text-sm md:text-base font-bold text-slate-100 transition-colors ${hoverText}`}>
                      {info.label}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-tight sm:leading-relaxed line-clamp-2">
                      {info.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-700 to-amber-500 text-slate-950 font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <p className="text-center text-[9px] sm:text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-3 sm:mt-5">
            Garantida a gravação automática no seu perfil
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
