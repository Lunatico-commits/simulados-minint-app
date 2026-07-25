import React, { useState, useEffect } from "react";
import { X, ShieldAlert, Lock, FileText, CheckCircle2, Cookie, Database, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type LegalModalType = "terms" | "privacy" | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  if (!type) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-sleek-card border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-2xl w-[95%] sm:w-full shadow-2xl relative overflow-hidden font-sans text-slate-200 my-auto max-h-[85vh] flex flex-col"
        >
          {/* Top Decorative Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-500"></div>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4 shrink-0">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1.5">
                <ShieldAlert className="w-3 h-3 text-amber-400" /> Informação Legal & Transparência
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-100">
                {activeTab === "terms" ? "Termos de Uso" : "Política de Privacidade"}
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar modal legal"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-sleek-card-hover transition-colors border border-transparent hover:border-slate-800 cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs Selector */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-sleek-card-sec rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "terms"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Termos de Uso</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Política de Privacidade</span>
            </button>
          </div>

          {/* Content Area (Scrollable) */}
          <div className="mt-4 overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {activeTab === "terms" ? (
              /* TERMOS DE USO CONTENT */
              <div className="space-y-4">
                <div className="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-xl flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                      Isenção de Vínculo Oficial com o MININT
                    </h4>
                    <p className="text-xs text-slate-300">
                      A plataforma <strong>Simulados MININT Angola</strong> é uma ferramenta de estudo estritamente educativa, autónoma e independente. <strong>Não possui qualquer vínculo oficial, institucional, patrocínio ou representação direta com o Ministério do Interior da República de Angola (MININT)</strong> nem com qualquer órgão público governamental.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    1. Finalidade Educativa
                  </h5>
                  <p className="text-slate-300 text-xs sm:text-sm pl-6">
                    Todas as questões, simulados, estatísticas e explicações geradas por inteligência artificial (Tutor IA) têm como único objetivo auxiliar os candidatos na preparação individual e autoavaliação para o concurso público. As informações contidas não substituem decretos-leis, boletins oficiais ou avisos no Diário da República.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2. Uso Aceitável e Gratuidade
                  </h5>
                  <p className="text-slate-300 text-xs sm:text-sm pl-6">
                    A utilização do site é inteiramente gratuita para estudo pessoal. É proibido utilizar a plataforma para fins ilícitos, engenharia reversa ou comercialização não autorizada do seu conteúdo.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    3. Atualizações de Conteúdo
                  </h5>
                  <p className="text-slate-300 text-xs sm:text-sm pl-6">
                    Procuramos manter as matérias (Língua Portuguesa, Raciocínio Lógico, Cultura Geral de Angola com a nova divisão político-administrativa e Legislação do MININT) devidamente atualizadas. Contudo, o utilizador deve consultar sempre os canais oficiais do Governo de Angola para editais definitivos.
                  </p>
                </div>
              </div>
            ) : (
              /* POLÍTICA DE PRIVACIDADE CONTENT */
              <div className="space-y-4">
                <div className="bg-blue-950/30 border border-blue-800/40 p-3.5 rounded-xl flex items-start gap-3">
                  <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-blue-300">
                      Armazenamento Local (localStorage)
                    </h4>
                    <p className="text-xs text-slate-300">
                      Utilizamos o armazenamento local do seu próprio navegador (<code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">localStorage</code>) para guardar o seu progresso, histórico de pontuações, estatísticas por matéria e preferência de tema (claro/escuro). Nenhuma palavra-passe ou dado bancário é recolhido.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                    <Cookie className="w-4 h-4 text-amber-400" />
                    1. Anúncios de Terceiros e Cookies (Google AdSense)
                  </h5>
                  <p className="text-slate-300 text-xs sm:text-sm pl-6">
                    Para ajudar a manter a plataforma gratuita e custear servidores, o site poderá exibir anúncios servidos pela rede Google AdSense ou parceiros terceiros.
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm pl-6">
                    Empresas de publicidade de terceiros utilizam <em>cookies</em> (como o cookie DART da Google) para veicular anúncios personalizados com base nas visitas anteriores do utilizador a este ou a outros sites na Internet.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2. Controlo de Cookies pelo Utilizador
                  </h5>
                  <p className="text-slate-300 text-xs sm:text-sm pl-6">
                    O utilizador pode desativar a publicidade personalizada acedendo às definições de anúncios do Google. Além disso, pode recusar ou eliminar cookies através das configurações de privacidade do seu navegador de Internet.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    3. Proteção e Segurança
                  </h5>
                  <p className="text-slate-300 text-xs sm:text-sm pl-6">
                    Não vendemos nem partilhamos dados pessoais com terceiros. A sua experiência de estudo é segura e privada.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Close */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Compreendido e Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
