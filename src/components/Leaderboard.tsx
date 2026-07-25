import { useEffect, useState } from "react";
import { Trophy, Search, Loader2, Sparkles, UserPlus } from "lucide-react";
import { RankingEntry } from "../types";
import { CATEGORIES } from "../data/questions";
import { motion } from "motion/react";
import InviteButton from "./InviteButton";

interface LeaderboardProps {
  username: string;
}

export default function Leaderboard({ username }: LeaderboardProps) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Geral");

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ranking/list");
      const data = await res.json();
      setRankings(data);
    } catch (err) {
      console.error("Error fetching rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  // Filter rankings based on search query
  const filteredRankings = rankings.filter(entry =>
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active real rankings without artificial mock manipulation
  const activeRankings = filteredRankings;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 font-sans text-slate-200">
      
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sleek-accent/10 border border-sleek-accent/20 text-sleek-accent text-xs font-semibold uppercase tracking-wider rounded-full">
          <Trophy className="w-4 h-4" /> Quadro de Honra Nacional (Real)
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-display text-slate-100">
          Rankings Reais de Candidatura MININT
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
          Ranking 100% real com base no desempenho e pontuação de contas registadas. Realize simulados ou convide colegas para acumular pontos.
        </p>

        {/* Invite Friends Button in Ranking Header */}
        <div className="pt-2 flex justify-center">
          <InviteButton username={username} variant="gold" onInvite={fetchRankings} />
        </div>
      </div>

      {/* Top 3 Podium Highlights (Real Rankings Only) */}
      {!loading && activeRankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
          
          {/* 2nd place */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 text-center flex flex-col justify-between relative order-2 md:order-1"
          >
            <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-sleek-card-sec flex items-center justify-center border border-slate-800 text-xs font-bold text-slate-300">
              🥈
            </div>
            <div className="space-y-2 mt-4">
              <span className="text-xs text-slate-500 font-mono">2º Classificado</span>
              <h4 className="text-md font-bold text-slate-200 truncate">{activeRankings[1].username}</h4>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Aproveitamento</span>
              <span className="font-bold text-slate-300">{activeRankings[1].accuracy}%</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Pontuação</span>
              <span className="font-bold text-sleek-accent font-mono">{activeRankings[1].points} PTS</span>
            </div>
          </motion.div>

          {/* 1st place (Gold) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-sleek-card to-sleek-card-sec border-2 border-sleek-accent/30 rounded-2xl p-6 text-center flex flex-col justify-between relative order-1 md:order-2 shadow-xl shadow-sleek-accent/5 gold-border-glow"
          >
            <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-sleek-accent/10 flex items-center justify-center border border-sleek-accent/30 text-sm">
              👑
            </div>
            <div className="space-y-2 mt-3">
              <span className="text-xs text-sleek-accent font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sleek-accent" /> Líder Nacional
              </span>
              <h4 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-sleek-accent truncate">
                {activeRankings[0].username}
              </h4>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Aproveitamento</span>
              <span className="font-extrabold text-sleek-accent">{activeRankings[0].accuracy}%</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Pontuação</span>
              <span className="font-extrabold text-sleek-accent text-sm font-mono">{activeRankings[0].points} PTS</span>
            </div>
          </motion.div>

          {/* 3rd place */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 text-center flex flex-col justify-between relative order-3"
          >
            <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-sleek-card-sec flex items-center justify-center border border-slate-800 text-xs font-bold text-amber-700">
              🥉
            </div>
            <div className="space-y-2 mt-4">
              <span className="text-xs text-slate-500 font-mono">3º Classificado</span>
              <h4 className="text-md font-bold text-slate-200 truncate">{activeRankings[2].username}</h4>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Aproveitamento</span>
              <span className="font-bold text-slate-300">{activeRankings[2].accuracy}%</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Pontuação</span>
              <span className="font-bold text-sleek-accent font-mono">{activeRankings[2].points} PTS</span>
            </div>
          </motion.div>

        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-sleek-card border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("Geral")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === "Geral"
                ? "bg-sleek-accent/10 border border-sleek-accent/40 text-sleek-accent"
                : "text-slate-400 hover:text-slate-200 hover:bg-sleek-card-hover"
            }`}
          >
            Quadro Geral
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-blue-500/10 border border-blue-500/40 text-blue-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-sleek-card-hover"
              }`}
            >
              {cat.split(" (")[0]} {/* truncate the parenthesis for aesthetic look */}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Procurar candidato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sleek-card-sec border border-slate-800 focus:border-sleek-accent/30 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 outline-none placeholder-slate-600 transition-all"
          />
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-sleek-accent animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Sincronizando base de dados...</p>
          </div>
        ) : activeRankings.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">Candidato não encontrado</p>
            <p className="text-[11px]">Nenhum candidato corresponde aos critérios de pesquisa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                  <th className="pb-3 pl-3 w-16">Posição</th>
                  <th className="pb-3">Candidato</th>
                  <th className="pb-3 text-center">Simulados Feitos</th>
                  <th className="pb-3 text-center">Taxa de Acerto</th>
                  <th className="pb-3 text-right pr-3">Pontuação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {activeRankings.map((entry, idx) => {
                  const isCurrentUser = entry.username.toLowerCase() === username.toLowerCase();
                  
                  return (
                    <tr
                      key={entry.username}
                      className={`transition-colors ${
                        isCurrentUser
                          ? "bg-sleek-accent/10 text-sleek-accent hover:bg-sleek-accent/15"
                          : "hover:bg-sleek-card-hover text-slate-300"
                      }`}
                    >
                      {/* Position */}
                      <td className="py-3.5 pl-3 font-mono font-bold text-slate-400">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </td>
                      
                      {/* Name */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrentUser ? "text-sleek-accent font-extrabold" : "text-slate-200"}`}>
                            {entry.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[9px] bg-sleek-accent/10 border border-sleek-accent/30 text-sleek-accent px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                              Tu
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Exams */}
                      <td className="py-3.5 text-center font-mono font-semibold text-slate-400">
                        {entry.totalExams}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 text-center">
                        <span className={`font-mono font-bold ${
                          entry.accuracy >= 80
                            ? "text-emerald-400"
                            : entry.accuracy >= 65
                            ? "text-blue-400"
                            : "text-slate-500"
                        }`}>
                          {entry.accuracy}%
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 text-right pr-3 font-mono font-bold text-sleek-accent text-sm">
                        {entry.points} PTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
