import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, LogOut, ArrowLeft, ShieldAlert } from "lucide-react";

interface ExitExamConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
}

export default function ExitExamConfirmModal({
  isOpen,
  onCancel,
  onConfirmExit
}: ExitExamConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-amber-950/40 space-y-6 relative overflow-hidden"
        >
          {/* Glowing alert accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 animate-pulse" />

          {/* Icon and Header */}
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-400 shrink-0">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 inline-block mb-1">
                Aviso de Progresso
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-display">
                Tem certeza que deseja sair?
              </h3>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Tens um <strong className="text-amber-300 font-semibold">simulado em andamento</strong>. Se saíres agora, o teu progresso atual e as tuas respostas dadas não serão guardados.
              </span>
            </p>
            <p className="text-slate-400 pl-6">
              Também perderás a oportunidade de pontuar no ranking geral dos candidatos do MININT nesta tentativa.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg shadow-blue-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continuar no Simulado</span>
            </button>
            <button
              onClick={onConfirmExit}
              className="flex-1 bg-slate-800 hover:bg-red-950/80 hover:text-red-300 border border-slate-700 hover:border-red-500/50 text-slate-300 font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sair e Abandonar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
