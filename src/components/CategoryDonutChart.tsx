import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieIcon, Target, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react";
import { UserStats } from "../types";
import { CATEGORIES } from "../data/questions";

interface CategoryDonutChartProps {
  stats: UserStats;
}

const CATEGORY_COLORS = [
  "#2563eb", // Royal Blue
  "#f59e0b", // Amber/Gold
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#f97316", // Orange
  "#ec4899", // Pink
  "#6366f1"  // Indigo
];

export default function CategoryDonutChart({ stats }: CategoryDonutChartProps) {
  // Build chart dataset
  const rawData = CATEGORIES.map((cat, index) => {
    const catStats = stats.categoryScores[cat] || { correct: 0, total: 0 };
    const accuracy = catStats.total > 0 ? Math.round((catStats.correct / catStats.total) * 100) : 0;
    return {
      name: cat,
      shortName: cat.split(" ")[0] + (cat.includes("&") ? " & " + cat.split("&")[1].trim().split(" ")[0] : ""),
      correct: catStats.correct,
      total: catStats.total,
      accuracy,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    };
  });

  // Filter categories with answers for the chart
  const chartData = rawData.filter(item => item.correct > 0);
  const totalCorrect = stats.correctAnswers;

  // Identify best category and area needing improvement
  const categoriesWithAttempts = rawData.filter(item => item.total > 0);
  
  let bestCategory = categoriesWithAttempts.length > 0 
    ? [...categoriesWithAttempts].sort((a, b) => b.accuracy - a.accuracy)[0]
    : null;

  let weakestCategory = categoriesWithAttempts.length > 0
    ? [...categoriesWithAttempts].sort((a, b) => a.accuracy - b.accuracy)[0]
    : null;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-amber-500/40 p-3 rounded-xl shadow-2xl font-sans text-xs space-y-1">
          <p className="font-bold text-amber-300">{data.name}</p>
          <div className="flex items-center justify-between gap-4 text-slate-200">
            <span>Acertos:</span>
            <strong className="text-emerald-400 font-mono">{data.correct} / {data.total}</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300 text-[11px]">
            <span>Aproveitamento:</span>
            <strong className="text-amber-400 font-mono">{data.accuracy}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 md:p-6 space-y-5 shadow-xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold font-display text-slate-100 flex items-center gap-2">
              Proporção de Acertos por Matéria
            </h3>
            <p className="text-xs text-slate-400">
              Análise visual do seu desempenho por disciplina para identificar pontos fracos e reforçar o estudo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-sleek-card-sec px-3 py-1.5 rounded-xl border border-slate-800 shrink-0 text-slate-300">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          Total de Acertos: <strong className="text-amber-400">{totalCorrect}</strong>
        </div>
      </div>

      {totalCorrect === 0 ? (
        /* Empty State */
        <div className="py-10 text-center flex flex-col items-center justify-center space-y-3 bg-sleek-card-sec/40 rounded-xl border border-dashed border-slate-800">
          <div className="p-3 rounded-full bg-slate-800/80 text-slate-500 border border-slate-700">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h4 className="text-sm font-bold text-slate-300">Sem dados suficientes para o gráfico</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Realize simulados para acumular acertos. O gráfico de rosca mapeará automaticamente a proporção do seu conhecimento em cada matéria do concurso.
            </p>
          </div>
        </div>
      ) : (
        /* Main Grid: Chart + Breakdown & Highlights */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Donut Chart Container */}
          <div className="lg:col-span-5 relative h-64 md:h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="correct"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#0f172a" 
                      strokeWidth={2}
                      className="transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black font-display text-amber-400">{totalCorrect}</span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Acertos Totais</span>
            </div>
          </div>

          {/* Side Legend & Diagnostic Panel */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Best & Weakest Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bestCategory && (
                <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">Ponto Forte</span>
                    <h5 className="text-xs font-bold text-slate-200 truncate">{bestCategory.name}</h5>
                    <p className="text-[11px] font-mono text-emerald-300/90">{bestCategory.accuracy}% de aproveitamento</p>
                  </div>
                </div>
              )}

              {weakestCategory && (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Requer Atenção</span>
                    <h5 className="text-xs font-bold text-slate-200 truncate">{weakestCategory.name}</h5>
                    <p className="text-[11px] font-mono text-amber-300/90">{weakestCategory.accuracy}% de aproveitamento</p>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Category Legend list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {rawData.map((item) => {
                const percentageOfTotal = totalCorrect > 0 ? Math.round((item.correct / totalCorrect) * 100) : 0;

                return (
                  <div 
                    key={item.name}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-sleek-card-sec/50 border border-slate-800/60 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 border border-white/10" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-300 truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                      <span className="text-slate-400">{item.correct} acertos</span>
                      <span className="text-amber-400 font-bold w-10 text-right">{percentageOfTotal}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
