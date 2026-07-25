import { useState, ReactNode } from "react";
import { BookOpen, Award, TrendingUp, Users, ArrowRight, Play, CheckCircle2, History, ShieldAlert, GraduationCap, Sparkles, Medal, Camera, Gift } from "lucide-react";
import { UserStats, Level } from "../types";
import { CATEGORIES, LEVEL_INFO } from "../data/questions";
import { getUserBadgesSummary } from "../data/badges";
import { motion } from "motion/react";
import DicaDoDiaCard from "./DicaDoDiaCard";
import LevelSelectionModal from "./LevelSelectionModal";
import CategoryDonutChart from "./CategoryDonutChart";
import WhatsAppIcon from "./WhatsAppIcon";
import BadgesSection from "./BadgesSection";
import AvatarDisplay from "./AvatarDisplay";
import InviteButton from "./InviteButton";
import FaqSection from "./FaqSection";
import TestimonialsSection from "./TestimonialsSection";
import { DEFAULT_AVATAR_ID } from "../data/avatars";
import AnimatedCounter from "./AnimatedCounter";

interface DashboardProps {
  username: string;
  avatarId?: string;
  stats: UserStats;
  selectedLevel: Level;
  onLevelChange: (level: Level) => void;
  onStartExam: (category: string | null, level?: Level) => void;
  onNavigateToView: (view: string) => void;
  onOpenAvatarModal?: () => void;
}

export default function Dashboard({
  username,
  avatarId = DEFAULT_AVATAR_ID,
  stats,
  selectedLevel,
  onLevelChange,
  onStartExam,
  onNavigateToView,
  onOpenAvatarModal
}: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  const handleOpenLevelModal = (category: string | null) => {
    setPendingCategory(category);
    setIsModalOpen(true);
  };

  const handleConfirmLevelAndStart = (chosenLevel: Level) => {
    onLevelChange(chosenLevel);
    onStartExam(pendingCategory, chosenLevel);
    setIsModalOpen(false);
  };

  // Calculate rolling accuracy
  const accuracy = stats.totalAnswers > 0 
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) 
    : 0;

  // Calculate Badges summary
  const badgeSummary = getUserBadgesSummary(stats);

  const renderStatCard = (
    title: string, 
    value: ReactNode, 
    sub: string, 
    icon: ReactNode, 
    borderTheme: string,
    onClick?: () => void,
    index: number = 0
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`bg-sleek-card backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg ${borderTheme} flex items-center justify-between transition-all duration-200 ${onClick ? "cursor-pointer hover:border-amber-500/40" : ""}`}
    >
      <div className="space-y-1">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{title}</span>
        <h3 className="text-xl md:text-2xl font-bold font-display tracking-tight text-slate-100">{value}</h3>
        <p className="text-[11px] text-slate-500">{sub}</p>
      </div>
      <div className="p-3 bg-sleek-card-sec rounded-xl border border-slate-800">
        {icon}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8 font-sans text-slate-200">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-sleek-card-sec via-sleek-card to-blue-950/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sleek-accent/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: "3s" }}></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-5 z-10 max-w-2xl text-center sm:text-left">
          {/* Avatar Profile Box with Edit Trigger */}
          <div className="relative group shrink-0">
            <button
              onClick={onOpenAvatarModal}
              title="Clique para alterar avatar"
              className="relative cursor-pointer block focus:outline-none"
            >
              <AvatarDisplay avatarId={avatarId} size="xl" showBadge />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-slate-950 p-1.5 rounded-full border-2 border-slate-900 shadow-md group-hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
              Concurso Público MININT 2026
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-slate-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-slate-100 dark:via-amber-200 dark:to-amber-400">
              Saudações, Candidato {username}!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
              Prepare-se para os testes oficiais dos órgãos do MININT (PNA, SIC, SME, SPCB e SPN). Clique no simulado para escolher o seu nível académico e testar os seus conhecimentos.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto shrink-0 z-10">
          <button
            onClick={() => handleOpenLevelModal(null)}
            className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Simulado Completo
          </button>
          <button
            onClick={() => onNavigateToView("multiplayer")}
            className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-amber-900/10 border border-amber-500/30 flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" /> Sala Multiplayer
          </button>
          <InviteButton username={username} variant="gold" />
        </div>
      </div>

      {/* DICA DO DIA (GEMINI AI TIP OF THE DAY) */}
      <DicaDoDiaCard />

      {/* BANNER SISTEMA DE CONVITES COM RECOMPENSA */}
      <div className="invite-banner-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="p-3 invite-banner-icon-box rounded-2xl shrink-0 shadow-md">
            <Gift className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider invite-banner-badge px-2.5 py-0.5 rounded-full">
                Bónus de Recomendação
              </span>
              <span className="text-[10px] font-mono font-bold invite-banner-points-label">
                +5 Pontos / Convite
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold font-display invite-banner-title">
              Convide Colegas de Estudo e Suba no Ranking
            </h3>
            <p className="text-xs invite-banner-desc">
              Partilhe o seu link exclusivo via Web Share ou WhatsApp. Receba +5 pontos por cada candidato que aceder ao simulado pelo seu convite.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0">
          <InviteButton username={username} variant="gold" className="w-full md:w-auto py-3 px-6 text-xs" />
        </div>
      </div>

      {/* BANNER COMUNIDADE VIP WHATSAPP */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 shrink-0 shadow-md">
            <WhatsAppIcon className="w-6 h-6 fill-current" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Comunidade Exclusiva
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">MININT Angola</span>
            </div>
            <h3 className="text-base md:text-lg font-bold font-display text-slate-100">
              Junte-se à Comunidade VIP no WhatsApp
            </h3>
            <p className="text-xs text-slate-300">
              Receba avisos do edital, troque material de estudo com outros candidatos e tire dúvidas em tempo real.
            </p>
          </div>
        </div>

        <a
          href="https://chat.whatsapp.com/L1nLLLK8M4xGlSGUfzK6ID?s=cl&p=a&ilr=4"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 shrink-0 w-full md:w-auto border border-emerald-400/30 group"
        >
          <WhatsAppIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
          <span>Entrar na Comunidade VIP (WhatsApp)</span>
        </a>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
        {renderStatCard(
          "Pontos de Preparação",
          <AnimatedCounter value={stats.points} suffix=" PTS" />,
          "Acumulado em simulados",
          <Award className="w-5 h-5 text-amber-400" />,
          "hover:border-amber-500/20",
          undefined,
          0
        )}
        {renderStatCard(
          "Taxa de Acertos",
          <AnimatedCounter value={accuracy} suffix="%" />,
          `${stats.correctAnswers} certas de ${stats.totalAnswers} respondidas`,
          <TrendingUp className="w-5 h-5 text-blue-400" />,
          "hover:border-blue-500/20",
          undefined,
          1
        )}
        {renderStatCard(
          "Simulados Concluídos",
          <AnimatedCounter value={stats.totalExams} />,
          "Tentativas registradas",
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          "hover:border-emerald-500/20",
          undefined,
          2
        )}
        {renderStatCard(
          "Medalhas & Conquistas",
          <span className="inline-flex items-center gap-1.5">
            <AnimatedCounter value={badgeSummary.unlockedCount} />
            <span className="text-slate-400 text-sm font-normal">/ {badgeSummary.totalCount}</span>
          </span>,
          `${badgeSummary.completionPercentage}% do quadro completo`,
          <Medal className="w-5 h-5 text-amber-400" />,
          "hover:border-amber-500/40",
          undefined,
          3
        )}
        {renderStatCard(
          "Nível Académico Padrão",
          LEVEL_INFO[selectedLevel].label,
          "Clique para alterar perfil",
          <GraduationCap className="w-5 h-5 text-purple-400" />,
          "hover:border-amber-500/40",
          () => handleOpenLevelModal(null),
          4
        )}
      </div>

      {/* RECHARTS DONUT CHART: Proporção de Acertos por Matéria */}
      <CategoryDonutChart stats={stats} />

      {/* Categories Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display tracking-tight text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Matérias de Estudo do MININT
            </h3>
            <p className="text-xs text-slate-400">
              Escolha uma matéria específica para praticar ou iniciar o simulado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((category, idx) => {
            const catStats = stats.categoryScores[category] || { correct: 0, total: 0 };
            const progress = catStats.total > 0 ? Math.round((catStats.correct / catStats.total) * 100) : 0;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -4 }}
                className="bg-sleek-card backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between group shadow-lg hover:shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-sleek-card-sec/80 border border-blue-900/40 px-2.5 py-1 rounded">
                      Módulo {idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Respondidas: {catStats.total}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {category}
                  </h4>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      <span>Aproveitamento</span>
                      <span className="text-amber-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-sleek-card-sec h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-amber-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Acertos: {catStats.correct}/{catStats.total}
                  </span>
                  <button
                    onClick={() => handleOpenLevelModal(category)}
                    className="text-[11px] bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/30 px-3.5 py-1.5 rounded-lg text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                  >
                    Iniciar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* QUADRO DE MEDALHAS & CONQUISTAS */}
      <BadgesSection stats={stats} />

      {/* History and Quick Ranking split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Exam Attempt History List */}
        <div className="lg:col-span-8 bg-sleek-card border border-slate-800/80 rounded-2xl p-5 md:p-6 space-y-4">
          <h3 className="text-lg font-bold font-display tracking-tight text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" /> Histórico de Simulados
          </h3>

          {stats.history.length === 0 ? (
            <div className="text-center py-10 bg-sleek-card-sec/50 rounded-xl border border-slate-800/60 flex flex-col items-center justify-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-600" />
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Nenhum simulado registrado</p>
              <p className="text-[11px] text-slate-500">Complete o seu primeiro simulado individual para registrar notas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 uppercase tracking-widest text-[10px] font-semibold">
                    <th className="pb-3 pl-2">Data</th>
                    <th className="pb-3">Categoria/Tipo</th>
                    <th className="pb-3 text-center">Nível</th>
                    <th className="pb-3 text-center">Nota</th>
                    <th className="pb-3 text-center">Aproveitamento</th>
                    <th className="pb-3 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {stats.history.slice().reverse().map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-sleek-card-hover/40 transition-colors">
                      <td className="py-3 pl-2 font-mono text-[11px] text-slate-500">
                        {attempt.date}
                      </td>
                      <td className="py-3 font-semibold text-slate-200">
                        {attempt.materia}
                      </td>
                      <td className="py-3 text-center font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-semibold uppercase text-[10px]">
                          {attempt.nivel ? LEVEL_INFO[attempt.nivel].label : "Geral"}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-amber-400">
                        {attempt.score} / {attempt.total}
                      </td>
                      <td className="py-3 text-center font-semibold text-slate-400">
                        {attempt.percentage}%
                      </td>
                      <td className="py-3 text-right pr-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          attempt.percentage >= 50
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/30"
                            : "bg-red-950 text-red-400 border border-red-800/30"
                        }`}>
                          {attempt.percentage >= 50 ? "Apto" : "Não Apto"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dynamic Leaderboard Summary Promo */}
        <div className="lg:col-span-4 bg-gradient-to-b from-sleek-card via-sleek-card to-sleek-bg border border-slate-800/80 rounded-2xl p-5 md:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-md font-bold text-slate-100 font-display uppercase tracking-wider">Lobby de Competição</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Deseja medir conhecimentos com outros concorrentes do MININT em Angola? O modo multiplayer permite simulações conjuntas em tempo real com salas privadas e chat integrado.
            </p>

            <div className="bg-sleek-card-sec rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Sua classificação atual</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{stats.points} Pontos</span>
              </div>
              <button
                onClick={() => onNavigateToView("leaderboard")}
                className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-sleek-card border border-slate-800 px-3 py-1.5 rounded-lg hover:border-amber-500/30 transition-all cursor-pointer"
              >
                Ver Líderes
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onNavigateToView("multiplayer")}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-widest rounded-xl py-3 cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 group"
            >
              Entrar na Arena Multiplayer
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* SECÇÃO DE DEPOIMENTOS DE ESTUDANTES (CARROSSEL + FORMULÁRIO REAL) */}
      <TestimonialsSection currentUsername={username} />

      {/* SECÇÃO FAQ (PERGUNTAS FREQUENTES ACCORDION) */}
      <FaqSection />

      {/* Level Selection Modal */}
      <LevelSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLevel={handleConfirmLevelAndStart}
        currentLevel={selectedLevel}
        categoryName={pendingCategory}
      />
    </div>
  );
}
