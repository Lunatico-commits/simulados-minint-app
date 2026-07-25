import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, MessageSquarePlus, Quote, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TestimonialModal, { TestimonialItem } from "./TestimonialModal";
import AvatarDisplay from "./AvatarDisplay";

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "testim-1",
    nome: "Manuel Agostinho",
    provincia: "Luanda",
    avaliacao: 5,
    comentario: "Excelente simulado! As perguntas sobre a nova Divisão Político-Administrativa de 21 províncias e a Constituição da República ajudaram-me imenso a fixar os detalhes do edital do MININT.",
    data: "há 2 dias",
    avatarId: "pna_oficial"
  },
  {
    id: "testim-2",
    nome: "Teresa Kiala",
    provincia: "Huambo",
    avaliacao: 5,
    comentario: "Conseguir fazer simulados cronometrados e desafiar colegas na Sala Multiplayer mudou completamente a minha rotina de estudo para a PNA. Muito prático!",
    data: "há 4 dias",
    avatarId: "sic_agente"
  },
  {
    id: "testim-3",
    nome: "Inspector Mateus Luvualu",
    provincia: "Benguela",
    avaliacao: 5,
    comentario: "Plataforma fantástica e 100% gratuita. As matérias de Redação Oficial e Estatuto do Serviço Penitenciário estão muito bem fundamentadas nas explicações das respostas.",
    data: "há 1 semana",
    avatarId: "pna_subinspector"
  },
  {
    id: "testim-4",
    nome: "Avelino Benguela",
    provincia: "Moxico",
    avaliacao: 5,
    comentario: "A explicação detalhada em cada questão erada é o melhor recurso. Aprendi imenso sobre a história do 4 de Fevereiro e os Acordos de Paz em Angola.",
    data: "há 1 semana",
    avatarId: "spn_guarda"
  },
  {
    id: "testim-5",
    nome: "Esperança Domingos",
    provincia: "Cabinda",
    avaliacao: 5,
    comentario: "O bónus de convite motivou todo o meu grupo de estudo do WhatsApp a participar! Já estamos todos no topo do Ranking de Candidatos.",
    data: "há 2 semanas",
    avatarId: "sme_oficial"
  }
];

interface TestimonialsSectionProps {
  currentUsername?: string;
}

export default function TestimonialsSection({ currentUsername = "" }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load custom user testimonials from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("minint_user_testimonials");
      if (stored) {
        const parsed: TestimonialItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestimonials([...parsed, ...INITIAL_TESTIMONIALS]);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar depoimentos salvos:", e);
    }
  }, []);

  // Auto-rotate carousel every 5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleAddTestimonial = (newItem: TestimonialItem) => {
    const updated = [newItem, ...testimonials];
    setTestimonials(updated);
    setCurrentIndex(0); // Show newly added testimonial immediately

    // Persist user-submitted testimonials
    try {
      const customOnly = updated.filter(t => t.isRealUser);
      localStorage.setItem("minint_user_testimonials", JSON.stringify(customOnly));
    } catch (e) {
      console.error("Erro ao guardar depoimento:", e);
    }
  };

  const currentItem = testimonials[currentIndex] || INITIAL_TESTIMONIALS[0];

  return (
    <div className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 md:p-8 space-y-6 shadow-xl relative overflow-hidden transition-all">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> O Que Dizem os Candidatos
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-display text-slate-100">
            Depoimentos de Estudantes do MININT
          </h3>
          <p className="text-xs text-slate-400">
            Experiências reais de candidatos em preparação para os exames da PNA, SPN, SME e SIC por toda Angola.
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 bg-sleek-card-sec border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 bg-sleek-card-sec border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Card Container */}
      <div
        className="relative min-h-[190px] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-sleek-card-sec/70 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-md relative"
          >
            <Quote className="absolute top-4 right-5 w-10 h-10 text-amber-500/10 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Avatar + Author Info */}
              <div className="flex items-center gap-3.5">
                <div className="shrink-0">
                  <AvatarDisplay
                    avatarId={currentItem.avatarId || "pna_oficial"}
                    size="md"
                    showBadge={false}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm md:text-base font-bold text-slate-100 font-display">
                      {currentItem.nome}
                    </h4>
                    {currentItem.isRealUser && (
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                        Verificado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
                    <span className="inline-flex items-center gap-1 font-medium text-amber-400/90">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {currentItem.provincia}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {currentItem.data}
                    </span>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < currentItem.avaliacao
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600 fill-slate-800"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-amber-400 ml-1 font-mono">
                  5.0
                </span>
              </div>
            </div>

            {/* Comment Text */}
            <p className="mt-4 text-xs md:text-sm text-slate-200 leading-relaxed italic border-t border-slate-800/60 pt-3">
              "{currentItem.comentario}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls: Dot indicators & "Escrever Depoimento" Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Carousel Dots */}
        <div className="flex items-center gap-1.5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? "w-6 bg-amber-400"
                  : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
              aria-label={`Ir para depoimento ${idx + 1}`}
            />
          ))}
        </div>

        {/* Button to open Modal */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-amber-400 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-sm active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-amber-400" />
          <span>Escrever Depoimento</span>
        </button>
      </div>

      {/* Testimonial Form Modal */}
      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultUsername={currentUsername}
        onSubmitTestimonial={handleAddTestimonial}
      />
    </div>
  );
}
