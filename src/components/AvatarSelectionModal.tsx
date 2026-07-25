import React, { useState } from "react";
import { X, Check, Shield, Sparkles, User, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AVATARS, AvatarItem } from "../data/avatars";
import AvatarDisplay from "./AvatarDisplay";

interface AvatarSelectionModalProps {
  isOpen: boolean;
  currentAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  onClose: () => void;
}

export default function AvatarSelectionModal({
  isOpen,
  currentAvatarId,
  onSelectAvatar,
  onClose,
}: AvatarSelectionModalProps) {
  const [selectedId, setSelectedId] = useState<string>(currentAvatarId);

  if (!isOpen) return null;

  const activeAvatar = AVATARS.find((a) => a.id === selectedId) || AVATARS[0];

  const handleConfirm = () => {
    onSelectAvatar(selectedId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-sleek-card border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-2xl w-[95%] sm:w-full shadow-2xl relative overflow-hidden font-sans text-slate-200 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-500"></div>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4 shrink-0">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Perfil do Candidato
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-100">
                Selecione o seu Avatar do MININT
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar escolha de avatar"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-sleek-card-hover transition-colors border border-transparent hover:border-slate-800 cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Featured Selected Avatar Preview */}
          <div className="my-4 p-4 bg-sleek-card-sec rounded-2xl border border-slate-800/80 flex items-center gap-4 shrink-0">
            <AvatarDisplay avatarId={selectedId} size="xl" showBadge />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${activeAvatar.badgeBg}`}>
                  {activeAvatar.agency}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                  {activeAvatar.role}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold font-display text-slate-100">
                {activeAvatar.name}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeAvatar.description}
              </p>
            </div>
          </div>

          {/* Gallery Grid (Scrollable) */}
          <div className="overflow-y-auto pr-1 my-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              Galeria de Avatares Ilustrados ({AVATARS.length}):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {AVATARS.map((avatar) => {
                const isSelected = selectedId === avatar.id;
                return (
                  <motion.button
                    key={avatar.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedId(avatar.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-blue-950/40 border-amber-400 ring-2 ring-amber-400/30 shadow-lg"
                        : "bg-sleek-card-sec/60 hover:bg-sleek-card-hover border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    <AvatarDisplay avatarId={avatar.id} size="lg" />

                    <div className="space-y-0.5 w-full">
                      <span className="text-xs font-bold text-slate-200 block truncate font-display">
                        {avatar.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {avatar.agency}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Guardar Avatar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
