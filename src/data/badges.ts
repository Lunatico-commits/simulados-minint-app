import { UserStats } from "../types";

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: "award" | "shield" | "star" | "flame" | "target" | "book" | "crown" | "zap" | "trophy";
  color: "amber" | "blue" | "emerald" | "purple" | "rose" | "cyan";
  requiredPoints?: number;
  requiredExams?: number;
  requiredAnswers?: number;
  requiredAccuracy?: number;
}

export const BADGES: Badge[] = [
  {
    id: "pioneiro",
    title: "Pioneiro do MININT",
    description: "Concluiu o seu primeiro simulado de preparação oficial.",
    iconName: "award",
    color: "amber",
    requiredExams: 1,
  },
  {
    id: "assiduo",
    title: "Estudante Assíduo",
    description: "Manteve o foco e concluiu 5 simulados completos.",
    iconName: "book",
    color: "blue",
    requiredExams: 5,
  },
  {
    id: "veterano",
    title: "Veterano dos Exames",
    description: "Concluiu 10 ou mais simulados na plataforma.",
    iconName: "shield",
    color: "purple",
    requiredExams: 10,
  },
  {
    id: "recruta_100",
    title: "Recruta Preparado",
    description: "Acumulou 100 pontos nos simulados.",
    iconName: "zap",
    color: "emerald",
    requiredPoints: 100,
  },
  {
    id: "cadete_500",
    title: "Cadete Exemplar",
    description: "Conquistou a marca de 500 pontos de desempenho.",
    iconName: "star",
    color: "amber",
    requiredPoints: 500,
  },
  {
    id: "mestre_leis",
    title: "Mestre das Leis",
    description: "Alcançou a marca expressiva de 1.000 pontos.",
    iconName: "crown",
    color: "rose",
    requiredPoints: 1000,
  },
  {
    id: "guardiao_2500",
    title: "Guardião da Pátria",
    description: "Conquistou o topo acumulando 2.500 pontos no portal.",
    iconName: "trophy",
    color: "cyan",
    requiredPoints: 2500,
  },
  {
    id: "questoes_50",
    title: "Mantra das Questões",
    description: "Respondeu a mais de 50 questões de provas.",
    iconName: "target",
    color: "emerald",
    requiredAnswers: 50,
  },
  {
    id: "mira_certeira",
    title: "Mira Certeira (80%+)",
    description: "Manteve uma taxa de acertos de 80% ou superior (mín. 10 respostas).",
    iconName: "flame",
    color: "rose",
    requiredAccuracy: 80,
  },
];

export interface BadgeProgress {
  badge: Badge;
  isUnlocked: boolean;
  progress: number;
  target: number;
  percentage: number;
}

export function getBadgeProgress(badge: Badge, stats: UserStats): BadgeProgress {
  let target = 0;
  let progress = 0;

  if (badge.requiredExams !== undefined) {
    target = badge.requiredExams;
    progress = stats.totalExams || 0;
  } else if (badge.requiredPoints !== undefined) {
    target = badge.requiredPoints;
    progress = stats.points || 0;
  } else if (badge.requiredAnswers !== undefined) {
    target = badge.requiredAnswers;
    progress = stats.totalAnswers || 0;
  } else if (badge.requiredAccuracy !== undefined) {
    target = badge.requiredAccuracy;
    const accuracy = stats.totalAnswers >= 10 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
    progress = accuracy;
  }

  const isUnlocked = progress >= target && target > 0;
  const percentage = target > 0 ? Math.min(Math.round((progress / target) * 100), 100) : 0;

  return {
    badge,
    isUnlocked,
    progress: Math.min(progress, target),
    target,
    percentage,
  };
}

export function getUserBadgesSummary(stats: UserStats) {
  const allProgress = BADGES.map((badge) => getBadgeProgress(badge, stats));
  const unlockedCount = allProgress.filter((p) => p.isUnlocked).length;
  const totalCount = BADGES.length;

  return {
    allProgress,
    unlockedCount,
    totalCount,
    completionPercentage: Math.round((unlockedCount / totalCount) * 100),
  };
}
