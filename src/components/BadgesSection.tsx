import React, { useState } from "react";
import { Award, Shield, Star, Flame, Target, Book, Crown, Zap, Trophy, Lock, CheckCircle2, Medal, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { UserStats } from "../types";
import { BADGES, getBadgeProgress, getUserBadgesSummary, Badge } from "../data/badges";
import AnimatedCounter from "./AnimatedCounter";

interface BadgesSectionProps {
  stats: UserStats;
}

export default function BadgesSection({ stats }: BadgesSectionProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const summary = getUserBadgesSummary(stats);

  const getIcon = (iconName: Badge["iconName"], className: string) => {
    switch (iconName) {
      case "award": return <Award className={className} />;
      case "shield": return <Shield className={className} />;
      case "star": return <Star className={className} />;
      case "flame": return <Flame className={className} />;
      case "target": return <Target className={className} />;
      case "book": return <Book className={className} />;
      case "crown": return <Crown className={className} />;
      case "zap": return <Zap className={className} />;
      case "trophy": return <Trophy className={className} />;
      default: return <Medal className={className} />;
    }
  };

  const getColorStyles = (color: Badge["color"], isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        cardBg: "bg-sleek-card/60 border-slate-800/80 grayscale opacity-75 hover:grayscale-0 hover:opacity-100",
        iconBg: "bg-slate-800/80 text-slate-500 border-slate-700/60",
        badgePill: "bg-slate-800 text-slate-400 border-slate-700/60",
        progressBar: "bg-slate-700",
      };
    }

    switch (color) {
      case "amber":
        return {
          cardBg: "bg-gradient-to-br from-amber-950/30 via-sleek-card to-sleek-card border-amber-500/40 hover:border-amber-400 shadow-amber-950/20",
          iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10",
          badgePill: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          progressBar: "bg-gradient-to-r from-amber-500 to-amber-400",
        };
      case "blue":
        return {
          cardBg: "bg-gradient-to-br from-blue-950/30 via-sleek-card to-sleek-card border-blue-500/40 hover:border-blue-400 shadow-blue-950/20",
          iconBg: "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-blue-500/10",
          badgePill: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          progressBar: "bg-gradient-to-r from-blue-500 to-blue-400",
        };
      case "emerald":
        return {
          cardBg: "bg-gradient-to-br from-emerald-950/30 via-sleek-card to-sleek-card border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20",
          iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10",
          badgePill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          progressBar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
        };
      case "purple":
        return {
          cardBg: "bg-gradient-to-br from-purple-950/30 via-sleek-card to-sleek-card border-purple-500/40 hover:border-purple-400 shadow-purple-950/20",
          iconBg: "bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-purple-500/10",
          badgePill: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          progressBar: "bg-gradient-to-r from-purple-500 to-purple-400",
        };
      case "rose":
        return {
          cardBg: "bg-gradient-to-br from-rose-950/30 via-sleek-card to-sleek-card border-rose-500/40 hover:border-rose-400 shadow-rose-950/20",
          iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/10",
          badgePill: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          progressBar: "bg-gradient-to-r from-rose-500 to-rose-400",
        };
      case "cyan":
      default:
        return {
          cardBg: "bg-gradient-to-br from-cyan-950/30 via-sleek-card to-sleek-card border-cyan-500/40 hover:border-cyan-400 shadow-cyan-950/20",
          iconBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-cyan-500/10",
          badgePill: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          progressBar: "bg-gradient-to-r from-cyan-500 to-cyan-400",
        };
    }
  };

  const filteredBadges = summary.allProgress.filter((item) => {
    if (filter === "unlocked") return item.isUnlocked;
    if (filter === "locked") return !item.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Overall Summary Card */}
      <div className="bg-sleek-card border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
              <Medal className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Sistema de Conquistas
                </span>
              </div>
              <h3 className="text-lg md:text-2xl font-bold font-display text-slate-100">
                Quadro de Medalhas & Troféus
              </h3>
              <p className="text-xs text-slate-400">
                Cumpra os objetivos de simulados e pontuação para desbloquear insígnias oficiais de estudo.
              </p>
            </div>
          </div>

          {/* Progress Summary Pill */}
          <div className="bg-sleek-card-sec border border-slate-800 rounded-2xl p-3.5 min-w-[220px] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Desempenho</span>
              <span className="text-amber-400 font-bold">
                <AnimatedCounter value={summary.unlockedCount} /> / {summary.totalCount} (<AnimatedCounter value={summary.completionPercentage} suffix="%" />)
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filter === "all"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-950/40"
                : "bg-sleek-card-sec text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Todas ({summary.totalCount})
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filter === "unlocked"
                ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-950/40"
                : "bg-sleek-card-sec text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Desbloqueadas (<AnimatedCounter value={summary.unlockedCount} />)
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filter === "locked"
                ? "bg-slate-700 text-slate-100 font-bold shadow-md"
                : "bg-sleek-card-sec text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Bloqueadas ({summary.totalCount - summary.unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((item, idx) => {
          const styles = getColorStyles(item.badge.color, item.isUnlocked);

          return (
            <motion.div
              key={item.badge.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.35, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              className={`rounded-2xl p-4 border shadow-md transition-all duration-200 flex flex-col justify-between ${styles.cardBg}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${styles.iconBg}`}>
                    {getIcon(item.badge.iconName, "w-5 h-5")}
                  </div>

                  {item.isUnlocked ? (
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${styles.badgePill}`}>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Conquistada
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueada
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-100 font-display">
                    {item.badge.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {item.badge.description}
                  </p>
                </div>
              </div>

              {/* Progress Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 uppercase">Progresso</span>
                  <span className={item.isUnlocked ? "text-emerald-400 font-bold" : "text-slate-400 font-semibold"}>
                    {item.progress} / {item.target}
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${styles.progressBar}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
