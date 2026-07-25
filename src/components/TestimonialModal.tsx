import React, { useState } from "react";
import { X, Star, MessageSquare, Send, CheckCircle2, User, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface TestimonialItem {
  id: string;
  nome: string;
  provincia: string;
  avaliacao: number;
  comentario: string;
  data: string;
  avatarId?: string;
  isRealUser?: boolean;
}

export const PROVINCIAS_ANGOLA = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando",
  "Cuando Cubango",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Icolo e Bengo",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Moxico Leste",
  "Namibe",
  "Uíge",
  "Zaire"
];

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername?: string;
  onSubmitTestimonial: (item: TestimonialItem) => void;
}

export default function TestimonialModal({
  isOpen,
  onClose,
  defaultUsername = "",
  onSubmitTestimonial,
}: TestimonialModalProps) {
  const [nome, setNome] = useState(defaultUsername || "");
  const [provincia, setProvincia] = useState("Luanda");
  const [avaliacao, setAvaliacao] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg("Por favor, introduza o seu nome.");
      return;
    }
    if (!comentario.trim() || comentario.trim().length < 10) {
      setErrorMsg("Escreva um comentário com pelo menos 10 caracteres.");
      return;
    }

    const newItem: TestimonialItem = {
      id: `testim_${Date.now()}`,
      nome: nome.trim(),
      provincia,
      avaliacao,
      comentario: comentario.trim(),
      data: new Date().toLocaleDateString("pt-AO", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      isRealUser: true,
      avatarId: "pna_oficial"
    };

    onSubmitTestimonial(newItem);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setComentario("");
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-sleek-card border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden font-sans text-slate-200"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="text-xl font-bold font-display text-slate-100">
                Depoimento Enviado com Sucesso!
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Obrigado por partilhar a sua experiência no Simulados MININT. A sua avaliação já está visível no carrossel.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100">
                    Escrever Depoimento
                  </h3>
                  <p className="text-xs text-slate-400">
                    Avalie a sua preparação para o Concurso do MININT
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-300 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Seu Nome ou Nome de Candidato:
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Sargento Manuel Silva"
                  className="w-full bg-sleek-card-sec border border-slate-800 focus:border-amber-500/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              {/* Province selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Província:
                </label>
                <select
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  className="w-full bg-sleek-card-sec border border-slate-800 focus:border-amber-500/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition-colors"
                >
                  {PROVINCIAS_ANGOLA.map((p) => (
                    <option key={p} value={p} className="bg-slate-900 text-slate-200">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Sua Avaliação (1 a 5 estrelas):
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || avaliacao);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAvaliacao(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-600 fill-slate-800"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-amber-400 ml-2 font-mono">
                    {avaliacao} / 5
                  </span>
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Seu Comentário ou Dica de Estudo:
                </label>
                <textarea
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Conte como os simulados ajudaram a sua preparação em Língua Portuguesa, CRA ou Legislação do MININT..."
                  className="w-full bg-sleek-card-sec border border-slate-800 focus:border-amber-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publicar Depoimento
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
