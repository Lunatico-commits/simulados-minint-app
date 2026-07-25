import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "faq-1",
    pergunta: "O Simulados MININT é totalmente gratuito?",
    resposta: "Sim, 100% gratuito! A plataforma foi desenvolvida para apoiar todos os cidadãos angolanos que se preparam para os exames de admissão do Ministério do Interior (PNA, SPN, SME e SIC), oferecendo questões atualizadas sem qualquer custo ou mensalidade."
  },
  {
    id: "faq-2",
    pergunta: "Quais são as matérias cobertas nos simulados?",
    resposta: "Os simulados abrangem todo o programa oficial: Língua Portuguesa (Gramática, Pontuação e Redação Oficial), Constituição da República de Angola (CRA), Estatuto Orgânico do MININT e Legislação das Forças de Segurança, História de Angola (Independência, Descolonização e Acordos de Paz), Raciocínio Lógico/Matemática Básica e Educação Patriótica/Cultura Geral (incluindo os Símbolos Nacionais e a nova Divisão Político-Administrativa de 21 Províncias)."
  },
  {
    id: "faq-3",
    pergunta: "Com que frequência as questões e legislações são atualizadas?",
    resposta: "O banco de dados é rigorosamente verificado e atualizado periodicamente. Todas as perguntas sobre a Organização Política do Estado incorporam de imediato as novas alterações legislativas, como a Lei da Divisão Político-Administrativa de Angola (Lei n.º 14/24) e as normas de segurança interna."
  },
  {
    id: "faq-4",
    pergunta: "Como funciona a pontuação do Ranking e o Bónus de Convite?",
    resposta: "Cada resposta correta no simulado confere 10 pontos (+10 bónus em caso de nota máxima). Além disso, ao utilizar o botão 'Convidar Amigos', recebe um link exclusivo: por cada colega que aceder ao simulado pelo seu convite, a sua conta ganha +5 pontos bónus automáticos no Ranking Nacional."
  }
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 md:p-8 space-y-6 shadow-xl transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider rounded-full">
            <HelpCircle className="w-3.5 h-3.5" /> Dúvidas Frequentes
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-display text-slate-100">
            Perguntas Frequentes (FAQ)
          </h3>
          <p className="text-xs text-slate-400">
            Tudo o que precisa de saber sobre o funcionamento da plataforma e a preparação para o concurso.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-sleek-card-sec border border-slate-800 px-3 py-1.5 rounded-xl">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>4 Tópicos Principais</span>
        </div>
      </div>

      <div className="space-y-3">
        {FAQ_DATA.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-sleek-card-sec/90 border-amber-500/40 shadow-md"
                  : "bg-sleek-card-sec/40 border-slate-800 hover:border-slate-700 hover:bg-sleek-card-sec/70"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(item.id)}
                className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isOpen ? "bg-amber-400" : "bg-slate-600"}`} />
                  <span className={`text-sm md:text-base font-bold font-sans transition-colors ${isOpen ? "text-amber-400" : "text-slate-200"}`}>
                    {item.pergunta}
                  </span>
                </div>
                <div className={`p-1.5 rounded-lg border transition-all shrink-0 ${isOpen ? "bg-amber-500/10 border-amber-500/30 text-amber-400 rotate-180" : "bg-slate-800/80 border-slate-700 text-slate-400"}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 font-normal">
                      {item.resposta}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
