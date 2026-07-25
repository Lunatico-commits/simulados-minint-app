export type Level = "basico" | "medio" | "superior";

export interface Question {
  id: string;
  materia: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta: number; // index (0 to 3)
  explicacao: string;
  nivel: Level;
}

export interface ExamAttempt {
  id: string;
  date: string;
  materia: string; // Category name or "Simulado Geral"
  nivel?: Level;
  score: number;
  total: number;
  percentage: number;
}

export interface CategoryStats {
  correct: number;
  total: number;
}

export interface UserStats {
  totalExams: number;
  correctAnswers: number;
  totalAnswers: number;
  points: number; // accumulated points
  categoryScores: Record<string, CategoryStats>;
  history: ExamAttempt[];
}

export interface UserState {
  username: string;
  avatarId?: string;
  isLoggedIn: boolean;
  stats: UserStats;
}

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface Player {
  username: string;
  isReady: boolean;
  score: number;
  progress: number; // how many questions answered
  isHost: boolean;
  answers: Record<number, boolean>; // questionIndex -> isCorrect
}

export interface Room {
  code: string;
  players: Player[];
  messages: ChatMessage[];
  status: "lobby" | "playing" | "finished";
  questions: Question[];
  currentQuestionIndex: number;
  createdAt: number;
  nivel?: Level;
}

export interface RankingEntry {
  username: string;
  points: number;
  totalExams: number;
  accuracy: number;
}

export interface CategoryRanking {
  category: string;
  rankings: RankingEntry[];
}
