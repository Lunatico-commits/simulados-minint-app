import { Shield, LogOut, ArrowLeft, Menu, X, User, Sun, Moon, Monitor, Sparkles, Volume2, VolumeX, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeMode } from "../hooks/useTheme";
import WhatsAppIcon from "./WhatsAppIcon";
import AvatarDisplay from "./AvatarDisplay";
import RankNotificationToast, { RankChangeNotice } from "./RankNotificationToast";
import { DEFAULT_AVATAR_ID } from "../data/avatars";
import { isSoundEnabled, setSoundEnabled } from "../utils/soundEffects";

const WHATSAPP_VIP_LINK = "https://chat.whatsapp.com/L1nLLLK8M4xGlSGUfzK6ID?s=cl&p=a&ilr=4";

interface NavbarProps {
  username: string;
  avatarId?: string;
  currentView: string;
  userRank?: number | null;
  rankNotice?: RankChangeNotice | null;
  onDismissRankNotice?: () => void;
  themeMode: ThemeMode;
  resolvedTheme: "dark" | "light";
  onThemeChange: (mode: ThemeMode) => void;
  onNavigateBack: () => void;
  onLogout: () => void;
  onNavigateToView: (view: string) => void;
  onOpenAvatarModal?: () => void;
}

export default function Navbar({
  username,
  avatarId = DEFAULT_AVATAR_ID,
  currentView,
  userRank,
  rankNotice,
  onDismissRankNotice,
  themeMode,
  resolvedTheme,
  onThemeChange,
  onNavigateBack,
  onLogout,
  onNavigateToView,
  onOpenAvatarModal
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
  };

  // Determine if we should show the back button (all screens except dashboard itself)
  const showBackButton = currentView !== "dashboard";

  // Translate view names for friendly UI
  const getViewTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Painel do Candidato";
      case "exam":
        return "Simulado Interativo";
      case "multiplayer":
        return "Arena Co-op / Multiplayer";
      case "leaderboard":
        return "Ranking Geral e Especializado";
      default:
        return "MININT Angola";
    }
  };

  const navItems = [
    { name: "Painel Principal", view: "dashboard" },
    { name: "Exame Individual", view: "exam" },
    { name: "Multiplayer em Tempo Real", view: "multiplayer" },
    { name: "Ranking Oficial", view: "leaderboard" }
  ];

  return (
    <nav className="bg-sleek-card/95 backdrop-blur-md border-b border-slate-800 text-slate-200 sticky top-0 z-50 px-4 py-3 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left segment: Shield Logo & Brand Name + Back Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onNavigateToView("dashboard")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-amber-500 to-amber-600 flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0">
              <Shield className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <span className="font-display font-extrabold text-sm md:text-base tracking-wider uppercase flex items-center gap-1.5">
              <span className="text-slate-950 dark:text-slate-100 font-extrabold transition-colors">SIMULADOS</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-amber-600 to-amber-700 dark:from-blue-400 dark:via-amber-300 dark:to-amber-500 gold-glow font-black">MININT</span>
            </span>
          </div>

          {showBackButton && (
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-1.5 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-sleek-accent/30 text-sleek-accent hover:text-amber-500 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200 ml-1"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          )}

          {/* Current view subtitle */}
          <span className="text-xs bg-sleek-card-sec px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 border border-slate-800 font-mono hidden md:inline ml-1">
            {getViewTitle()}
          </span>
        </div>

        {/* Desktop middle links */}
        <div className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isLeaderboard = item.view === "leaderboard";
            return (
              <button
                key={item.view}
                onClick={() => onNavigateToView(item.view)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                  currentView === item.view
                    ? "bg-blue-950/20 dark:bg-blue-950/40 text-amber-500 dark:text-sleek-accent border border-amber-500/30 dark:border-blue-900/40"
                    : "text-slate-400 hover:text-slate-100 hover:bg-sleek-card-hover"
                }`}
              >
                <span>{item.name}</span>
                {isLeaderboard && typeof userRank === "number" && userRank > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-bold shrink-0">
                    #{userRank}
                  </span>
                )}
                {isLeaderboard && rankNotice && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold flex items-center gap-0.5 shrink-0 ${
                      rankNotice.direction === "up"
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-amber-500 text-slate-950 font-bold"
                    }`}
                  >
                    {rankNotice.direction === "up" ? `▲ +${rankNotice.delta}` : `▼ -${rankNotice.delta}`}
                  </motion.span>
                )}
              </button>
            );
          })}

          {/* WhatsApp VIP Community Link (Desktop) */}
          <a
            href={WHATSAPP_VIP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-3.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center gap-1.5 border border-emerald-400/30 shrink-0"
            title="Entrar na Comunidade VIP (WhatsApp)"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xl:inline">Comunidade VIP</span>
            <span className="xl:hidden">VIP</span>
          </a>
        </div>

        {/* Right segment: Theme toggle & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Selector Controls */}
          <div className="flex items-center bg-sleek-card-sec border border-slate-800 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => onThemeChange("auto")}
              title={`Modo Automático (Sistema ${resolvedTheme === "dark" ? "Escuro" : "Claro"})`}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                themeMode === "auto"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] uppercase font-mono">Auto</span>
            </button>

            <button
              onClick={() => onThemeChange("dark")}
              title="Modo Escuro"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                themeMode === "dark"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] uppercase font-mono">Escuro</span>
            </button>

            <button
              onClick={() => onThemeChange("light")}
              title="Modo Claro"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                themeMode === "light"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] uppercase font-mono">Claro</span>
            </button>
          </div>

          {/* Sound Effects Toggle Switch */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? "Efeitos Sonoros Ativados (Clique para silenciar)" : "Efeitos Sonoros Mute (Clique para ativar)"}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              soundOn
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                : "bg-sleek-card-sec text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden xl:inline text-[10px] uppercase font-mono tracking-wider font-bold">
              {soundOn ? "Som ON" : "Som OFF"}
            </span>
          </button>

          <button
            onClick={onOpenAvatarModal}
            title="Alterar Avatar do Perfil"
            className="hidden sm:flex items-center gap-2 bg-sleek-card-sec/90 hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/40 pl-1.5 pr-3 py-1 rounded-full cursor-pointer transition-all duration-200 shadow-sm group"
          >
            <AvatarDisplay avatarId={avatarId} size="xs" />
            <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 max-w-[110px] truncate">
              {username}
            </span>
          </button>

          <button
            onClick={onLogout}
            title="Terminar Sessão"
            className="p-2 hover:bg-red-950/30 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-900/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-sleek-card-hover rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-800"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mt-3 border-t border-slate-800 pt-3 space-y-1.5 overflow-hidden"
          >
            {navItems.map((item) => {
              const isLeaderboard = item.view === "leaderboard";
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigateToView(item.view);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    currentView === item.view
                      ? "bg-blue-950/40 text-sleek-accent border border-blue-900/40"
                      : "text-slate-400 hover:text-slate-100 hover:bg-sleek-card-hover"
                  }`}
                >
                  <span>{item.name}</span>
                  {isLeaderboard && (
                    <div className="flex items-center gap-1.5">
                      {typeof userRank === "number" && userRank > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-bold">
                          #{userRank}
                        </span>
                      )}
                      {rankNotice && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ${
                            rankNotice.direction === "up"
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-amber-500 text-slate-950 font-bold"
                          }`}
                        >
                          {rankNotice.direction === "up" ? `▲ +${rankNotice.delta}` : `▼ -${rankNotice.delta}`}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Mobile WhatsApp VIP Button */}
            <a
              href={WHATSAPP_VIP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 mt-2 shadow-md cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
              <span>Entrar na Comunidade VIP (WhatsApp)</span>
            </a>

            <div
              onClick={() => {
                if (onOpenAvatarModal) onOpenAvatarModal();
                setIsOpen(false);
              }}
              className="sm:hidden flex items-center justify-between bg-sleek-card-sec border border-slate-800/80 px-3 py-2 rounded-xl mt-4 cursor-pointer hover:border-amber-500/40"
            >
              <div className="flex items-center gap-2.5">
                <AvatarDisplay avatarId={avatarId} size="sm" />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Candidato: {username}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono block">
                    Clique para mudar avatar
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Rank Notification Toast */}
      <RankNotificationToast
        notice={rankNotice || null}
        onDismiss={() => {
          if (onDismissRankNotice) onDismissRankNotice();
        }}
        onViewRanking={() => onNavigateToView("leaderboard")}
      />
    </nav>
  );
}
