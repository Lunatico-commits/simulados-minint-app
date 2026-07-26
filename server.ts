import express from "express";
import path from "path";
import Pusher from "pusher";
import { GoogleGenAI, Type } from "@google/genai";
import { Room, Player, ChatMessage, RankingEntry } from "./src/types";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------------------------------------------------------
// CONFIGURAÇÃO DO PUSHER (MULTIPLAYER REALTIME)
// ---------------------------------------------------------
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "2180210",
  key: process.env.PUSHER_KEY || "9f8d70a0303400477b30",
  secret: process.env.PUSHER_SECRET || "2c99321eeba901356c4c7990da9be9e0",
  cluster: process.env.PUSHER_CLUSTER || "eu",
  useTLS: true
});

// Guardar rankings e contas em memória
let rankings: RankingEntry[] = [];

interface UserAccount {
  username: string;
  usernameLower: string;
  password: string;
  createdAt: number;
}

const userAccounts = new Map<string, UserAccount>();

// Contas padrão
const defaultSeedAccounts: UserAccount[] = [
  { username: "Candidato Manuel", usernameLower: "candidatomanuel", password: "123", createdAt: Date.now() },
  { username: "GangSt", usernameLower: "gangst", password: "123", createdAt: Date.now() }
];

defaultSeedAccounts.forEach(acc => {
  userAccounts.set(acc.usernameLower, acc);
  rankings.push({ username: acc.username, points: 50, totalExams: 1, accuracy: 85 });
});

// Guardar salas de multiplayer
const rooms = new Map<string, Room>();

// Função auxiliar Gemini Client
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

// API: MULTIPLAYER (CORRIGIDO PARA O SEU SRC/TYPES.TS)
app.post("/api/multiplayer/create", async (req, res) => {
  try {
    const { code, hostName, level } = req.body;

    const hostPlayer: Player = {
      username: hostName,
      isHost: true,
      isReady: true,
      score: 0,
      progress: 0,
      answers: {}
    };

    const room: Room = {
      code,
      hostName,
      level: level || "Básico",
      status: "lobby",
      players: [hostPlayer],
      messages: [],
      createdAt: Date.now()
    };

    rooms.set(code, room);

    // Notifica em tempo real via Pusher
    await pusher.trigger(`room-${code}`, "room-updated", room);

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao criar sala." });
  }
});

app.post("/api/multiplayer/join", async (req, res) => {
  try {
    const { code, playerName } = req.body;
    let room = rooms.get(code);

    if (!room) {
      const defaultHost: Player = {
        username: "Anfitrião",
        isHost: true,
        isReady: true,
        score: 0,
        progress: 0,
        answers: {}
      };

      room = {
        code,
        hostName: "Anfitrião",
        level: "Básico",
        status: "lobby",
        players: [defaultHost],
        messages: [],
        createdAt: Date.now()
      };
    }

    const exists = room.players.some((p: Player) => p.username.toLowerCase() === String(playerName).toLowerCase());
    if (!exists) {
      const newPlayer: Player = {
        username: playerName,
        isHost: false,
        isReady: true,
        score: 0,
        progress: 0,
        answers: {}
      };
      room.players.push(newPlayer);
    }

    rooms.set(code, room);

    // Sincroniza os telemóveis em tempo real
    await pusher.trigger(`room-${code}`, "room-updated", room);

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao entrar na sala." });
  }
});

app.post("/api/multiplayer/message", async (req, res) => {
  try {
    const { code, sender, text } = req.body;
    const room = rooms.get(code);
    const newMessage: ChatMessage = { id: Date.now().toString(), sender, text, timestamp: Date.now() };

    if (room) {
      room.messages.push(newMessage);
      rooms.set(code, room);
    }

    await pusher.trigger(`room-${code}`, "new-message", newMessage);

    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao enviar mensagem." });
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

// Ficheiros estáticos em Produção
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Loader dinâmico do Vite (Apenas desenvolvimento local)
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
