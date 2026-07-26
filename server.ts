import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { Room, Player, ChatMessage, RankingEntry } from "./src/types";
import { getExamQuestions } from "./src/data/questions";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data store for leaderboards
let rankings: RankingEntry[] = [];

// In-memory data store for candidate user accounts
interface UserAccount {
  username: string;
  usernameLower: string;
  password: string;
  createdAt: number;
}

const userAccounts = new Map<string, UserAccount>();

// Seed default accounts
const defaultSeedAccounts: UserAccount[] = [
  { username: "Candidato Manuel", usernameLower: "candidatomanuel", password: "123", createdAt: Date.now() },
  { username: "GangSt", usernameLower: "gangst", password: "123", createdAt: Date.now() }
];

defaultSeedAccounts.forEach(acc => {
  userAccounts.set(acc.usernameLower, acc);
  rankings.push({ username: acc.username, points: 50, totalExams: 1, accuracy: 85 });
});

// In-memory data store for multiplayer rooms
const rooms = new Map<string, Room>();
const roomClients = new Map<string, Array<{ username: string; res: express.Response }>>();

// Helper Gemini Client
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// API: AUTHENTICATION
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, password, referralCode } = req.body;
    const cleanUsername = username ? String(username).trim() : "";
    const cleanPassword = password ? String(password).trim() : "";
    const cleanRef = referralCode ? String(referralCode).trim() : "";

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({ error: "Por favor, preencha o Nome de Candidato/NIP e a Senha." });
    }

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: "O Nome/NIP deve ter pelo menos 3 caracteres." });
    }

    if (cleanPassword.length < 4) {
      return res.status(400).json({ error: "A senha deve ter no mínimo 4 caracteres." });
    }

    const usernameLower = cleanUsername.toLowerCase();
    if (userAccounts.has(usernameLower)) {
      return res.status(400).json({ error: "Este candidato/NIP já se encontra registado." });
    }

    userAccounts.set(usernameLower, {
      username: cleanUsername,
      usernameLower,
      password: cleanPassword,
      createdAt: Date.now()
    });

    if (!rankings.some(r => r.username.toLowerCase() === usernameLower)) {
      rankings.push({ username: cleanUsername, points: 0, totalExams: 0, accuracy: 0 });
    }

    if (cleanRef) {
      const refIdx = rankings.findIndex(r => r.username.toLowerCase() === cleanRef.toLowerCase());
      if (refIdx !== -1) {
        rankings[refIdx].points += 5;
      } else {
        rankings.push({ username: cleanRef, points: 5, totalExams: 0, accuracy: 0 });
      }
    }

    rankings.sort((a, b) => b.points - a.points);
    res.json({ success: true, username: cleanUsername });
  } catch (err: any) {
    res.status(500).json({ error: "Erro interno no servidor ao criar conta." });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username ? String(username).trim() : "";
    const cleanPassword = password ? String(password).trim() : "";

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({ error: "Preencha o Nome de Candidato/NIP e a Senha." });
    }

    const account = userAccounts.get(cleanUsername.toLowerCase());
    if (!account || account.password !== cleanPassword) {
      return res.status(401).json({ error: "Nome de utilizador ou senha incorretos." });
    }

    res.json({ success: true, username: account.username });
  } catch (err: any) {
    res.status(500).json({ error: "Erro interno no servidor ao efetuar login." });
  }
});

// API: RANKING
app.get("/api/ranking/list", (req, res) => {
  res.json(rankings.sort((a, b) => b.points - a.points));
});

app.post("/api/ranking/submit", (req, res) => {
  const { username, score, total, pointsGained, currentTotalPoints } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const existingIdx = rankings.findIndex(r => r.username.toLowerCase() === username.toLowerCase());
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const isNewExam = (total || 0) > 0;

  if (existingIdx !== -1) {
    if (typeof currentTotalPoints === "number") {
      rankings[existingIdx].points = Math.max(rankings[existingIdx].points, currentTotalPoints);
    } else {
      rankings[existingIdx].points += pointsGained || 0;
    }

    if (isNewExam) {
      rankings[existingIdx].totalExams += 1;
      const oldTotal = rankings[existingIdx].totalExams - 1;
      rankings[existingIdx].accuracy = oldTotal > 0
        ? Math.round(((rankings[existingIdx].accuracy * oldTotal) + accuracy) / rankings[existingIdx].totalExams)
        : accuracy;
    }
  } else {
    rankings.push({
      username,
      points: typeof currentTotalPoints === "number" ? currentTotalPoints : (pointsGained || 0),
      totalExams: isNewExam ? 1 : 0,
      accuracy: isNewExam ? accuracy : 0
    });
  }

  rankings.sort((a, b) => b.points - a.points);
  rankings = rankings.slice(0, 100);
  res.json({ success: true, rankings });
});

// API: GEMINI EXPLANATION
app.post("/api/gemini/explain", async (req, res) => {
  const { questionText, options, correctAnswer, selectedAnswer, explanation, userQuestion } = req.body;

  try {
    const ai = getGemini();
    if (!ai) {
      return res.json({
        success: true,
        explanation: `**Tutor MININT:**\n\n${explanation}\n\n*(Nota: Adicione a GEMINI_API_KEY nas variáveis de ambiente da Vercel para ativar as respostas personalizadas da IA)*`
      });
    }

    const prompt = `
Você é o "Tutor Inteligente MININT", assistente para o Concurso do Ministério do Interior de Angola.
Aperfeiçoe a explicação para o candidato.

Questão: "${questionText}"
Opções: ${JSON.stringify(options)}
Opção correta: "${options ? options[correctAnswer] : ''}"
Resposta do candidato: "${selectedAnswer !== null && options ? options[selectedAnswer] : 'Nenhuma'}"
Explicação padrão: "${explanation}"
Dúvida do candidato: "${userQuestion || 'Explique detalhadamente.'}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é o Tutor Inteligente do Concurso MININT.",
        temperature: 0.7,
      },
    });

    res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.json({
      success: true,
      explanation: `**Tutor MININT:**\n\n${explanation}`
    });
  }
});

// API: GEMINI DICA DO DIA
app.get("/api/gemini/dica-do-dia", async (req, res) => {
  const fallbackTip = {
    titulo: "Divisão Político-Administrativa de Angola",
    categoria: "Cultura Geral / Geografia",
    conteudo: "Com a nova Lei da Divisão Político-Administrativa, Angola conta com 21 Províncias.",
    fonte: "Lei n.º 14/24 de Divisão Político-Administrativa"
  };

  try {
    const ai = getGemini();
    if (!ai) return res.json({ success: true, tip: fallbackTip, fallback: true });

    const prompt = `Gere uma "Dica de Ouro do Dia" para o concurso MININT Angola em formato JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING },
            categoria: { type: Type.STRING },
            conteudo: { type: Type.STRING },
            fonte: { type: Type.STRING },
          },
          required: ["titulo", "categoria", "conteudo", "fonte"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, tip: parsed });
  } catch (error) {
    res.json({ success: true, tip: fallbackTip, fallback: true });
  }
});

// Serve Static Frontend files in Production
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Dynamic Vite Loader only for local development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    });
  });
}

export default app;
 
