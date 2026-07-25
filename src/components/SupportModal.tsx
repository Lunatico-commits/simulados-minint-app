import { useState } from "react";
import { X, Copy, Check, Heart, ShieldCheck, Sparkles, Server } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const paymentData = [
    {
      key: "titular",
      label: "Titular da Conta",
      value: "António Edson Lima Pimentel",
      badge: "Conta Oficial"
    },
    {
      key: "express",
      label: "Multicaixa Express (Telefone)",
      value: "939606343",
      badge: "Transferência Rápida"
    },
    {
      key: "iban",
      label: "Número IBAN",
      value: "AO06 0058 0000 06173873101 38",
      badge: "BANCÁRIO"
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-sleek-card border border-blue-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-lg w-[95%] sm:w-full shadow-2xl relative overflow-hidden font-sans text-slate-200 my-auto"
        >
          {/* Top highlight gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-500"></div>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600/20 to-amber-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-blue-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                  <Server className="w-3 h-3 text-emerald-400" /> Manutenção & Servidores
                </span>
                <h3 className="text-base sm:text-xl font-bold font-display text-slate-100 tracking-tight flex items-center gap-1.5">
                  Apoie este Projeto <span className="text-blue-400">💙</span>
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

          {/* Core Message */}
          <div className="mb-5 p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              O <strong className="text-amber-400">Simulados MININT</strong> é <strong className="text-emerald-400">100% gratuito</strong>. Ajude a manter os servidores ativos com qualquer valor!
            </p>
          </div>

          {/* Payment Data Cards */}
          <div className="space-y-3 mb-6">
            {paymentData.map((item) => {
              const isCopied = copiedKey === item.key;

              return (
                <div
                  key={item.key}
                  className="bg-sleek-card-sec/90 border border-slate-800/90 rounded-xl p-3 sm:p-3.5 space-y-1.5 hover:border-slate-700/80 transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="text-slate-400 uppercase font-mono font-semibold tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-100 select-all tracking-wide break-all">
                      {item.value}
                    </span>

                    <button
                      onClick={() => handleCopy(item.key, item.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-200 shrink-0 ${
                        isCopied
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                          : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-400/50"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Footer Notice */}
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Contribuição voluntária direta
            </span>
            <span>Muito obrigado pelo apoio!</span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
