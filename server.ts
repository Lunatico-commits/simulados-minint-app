import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Room, Player, ChatMessage, RankingEntry, Question } from "./src/types";
import { SAMPLE_QUESTIONS, getExamQuestions } from "./src/data/questions";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for leaderboards (Real registered accounts only)
let rankings: RankingEntry[] = [];

// In-memory data store for candidate user accounts (Server-side permanent store)
interface UserAccount {
  username: string;
  usernameLower: string;
  password: string;
  createdAt: number;
}
const userAccounts = new Map<string, UserAccount>();

// Seed default accounts so candidates can log in from any device
const defaultSeedAccounts: UserAccount[] = [
  { username: "CandidatoManuel", usernameLower: "candidatomanuel", password: "123", createdAt: Date.now() },
  { username: "GangSt", usernameLower: "gangst", password: "123", createdAt: Date.now() }
];
defaultSeedAccounts.forEach(acc => {
  userAccounts.set(acc.usernameLower, acc);
  rankings.push({ username: acc.username, points: 50, totalExams: 1, accuracy: 85 });
});

// In-memory data store for multiplayer rooms
const rooms = new Map<string, Room>();

// Registry of SSE client connections: roomCode -> array of clients
const roomClients = new Map<string, Array<{ username: string; res: express.Response }>>();

// ==========================================
// API: AUTHENTICATION & CANDIDATE REGISTRATION
// ==========================================

// Register a new Candidate Account
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
      return res.status(400).json({ error: "O Nome/NIP do candidato deve ter pelo menos 3 caracteres." });
    }

    if (cleanPassword.length < 4) {
      return res.status(400).json({ error: "A senha deve ter no mínimo 4 caracteres." });
    }

    const usernameLower = cleanUsername.toLowerCase();
    if (userAccounts.has(usernameLower)) {
      return res.status(400).json({ error: "Este candidato/NIP já se encontra registado. Por favor faça Login para aceder." });
    }

    const newAccount: UserAccount = {
      username: cleanUsername,
      usernameLower,
      password: cleanPassword,
      createdAt: Date.now()
    };

    userAccounts.set(usernameLower, newAccount);

    // Initialize leaderboard entry if not present
    if (!rankings.some(r => r.username.toLowerCase() === usernameLower)) {
      rankings.push({
        username: cleanUsername,
        points: 0,
        totalExams: 0,
        accuracy: 0
      });
    }

    // Process Referral Reward if provided
    if (cleanRef) {
      const refIdx = rankings.findIndex(r => r.username.toLowerCase() === cleanRef.toLowerCase());
      if (refIdx !== -1) {
        rankings[refIdx].points += 5;
      } else {
        rankings.push({
          username: cleanRef,
          points: 5,
          totalExams: 0,
          accuracy: 0
        });
      }
      rankings.sort((a, b) => b.points - a.points);
    }

    console.log(`[AUTH] Nova conta registada: ${cleanUsername}`);
    res.json({ success: true, username: cleanUsername });
  } catch (err: any) {
    console.error("Register API Error:", err);
    res.status(500).json({ error: "Erro interno no servidor ao criar conta." });
  }
});

// Login Existing Candidate
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username ? String(username).trim() : "";
    const cleanPassword = password ? String(password).trim() : "";

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({ error: "Por favor, preencha o Nome de Candidato/NIP e a Senha." });
    }

    const usernameLower = cleanUsername.toLowerCase();
    const account = userAccounts.get(usernameLower);

    if (!account || account.password !== cleanPassword) {
      return res.status(401).json({ error: "Nome de utilizador ou senha incorretos." });
    }

    console.log(`[AUTH] Login com sucesso: ${account.username}`);
    res.json({ success: true, username: account.username });
  } catch (err: any) {
    console.error("Login API Error:", err);
    res.status(500).json({ error: "Erro interno no servidor ao efetuar login." });
  }
});

// Lazy initialization of the @google/genai client to protect against startup crashes
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// API: RANKING / LEADERBOARD ENDPOINTS
// ==========================================

app.get("/api/ranking/list", (req, res) => {
  res.json(rankings.sort((a, b) => b.points - a.points));
});

app.post("/api/ranking/submit", (req, res) => {
  const { username, score, total, pointsGained, currentTotalPoints } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const existingIdx = rankings.findIndex(r => r.username.toLowerCase() === username.toLowerCase());
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const isNewExam = (total || 0) > 0;

  if (existingIdx !== -1) {
    // Update existing user statistics
    if (typeof currentTotalPoints === "number") {
      rankings[existingIdx].points = Math.max(rankings[existingIdx].points, currentTotalPoints);
    } else {
      rankings[existingIdx].points += pointsGained || 0;
    }

    if (isNewExam) {
      rankings[existingIdx].totalExams += 1;
      const oldTotal = rankings[existingIdx].totalExams - 1;
      rankings[existingIdx].accuracy = oldTotal > 0
        ? Math.round((rankings[existingIdx].accuracy * oldTotal + accuracy) / rankings[existingIdx].totalExams)
        : accuracy;
    }
  } else {
    // Add new real candidate
    const initialPoints = typeof currentTotalPoints === "number" ? currentTotalPoints : (pointsGained || 0);
    rankings.push({
      username,
      points: initialPoints,
      totalExams: isNewExam ? 1 : 0,
      accuracy: isNewExam ? accuracy : 0
    });
  }

  // Sort and keep top 100
  rankings.sort((a, b) => b.points - a.points);
  rankings = rankings.slice(0, 100);

  res.json({ success: true, rankings });
});

// Reward referrer with +5 points when a new participant joins via their invite link
app.post("/api/invite/reward", (req, res) => {
  const { referrer } = req.body;
  if (!referrer || typeof referrer !== "string") {
    return res.status(400).json({ error: "Nome do utilizador recomendador é obrigatório" });
  }

  const cleanName = referrer.trim();
  if (!cleanName) {
    return res.status(400).json({ error: "Nome inválido" });
  }

  const existingIdx = rankings.findIndex(r => r.username.toLowerCase() === cleanName.toLowerCase());

  if (existingIdx !== -1) {
    rankings[existingIdx].points += 5;
  } else {
    rankings.push({
      username: cleanName,
      points: 5,
      totalExams: 0,
      accuracy: 0
    });
  }

  rankings.sort((a, b) => b.points - a.points);
  res.json({ success: true, pointsAdded: 5, rankings });
});


// ==========================================
// API: REAL-TIME MULTIPLAYER ENDPOINTS (SSE)
// ==========================================

// Helper to generate a unique room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Guarantee uniqueness
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

// Broadcast updated state to all participants in a room
function broadcastRoomState(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const clients = roomClients.get(roomCode) || [];
  const payload = JSON.stringify({ type: "room_update", room });

  clients.forEach(client => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      console.error(`Failed writing to SSE stream for user ${client.username}:`, err);
    }
  });
}

// Create a new private room
app.post("/api/multiplayer/create", (req, res) => {
  try {
    const { username, nivel } = req.body;
    const cleanUsername = username ? String(username).trim() : "";
    if (!cleanUsername) {
      return res.status(400).json({ error: "O nome do candidato é obrigatório para criar a sala." });
    }

    const selectedLevel = nivel || "basico";
    const code = generateRoomCode();
    const hostPlayer: Player = {
      username: cleanUsername,
      isReady: true,
      score: 0,
      progress: 0,
      isHost: true,
      answers: {}
    };

    // Select 5 questions for the multiplayer contest (1 from each core area)
    const selectedQuestions = getExamQuestions(null, selectedLevel);

    const newRoom: Room = {
      code,
      players: [hostPlayer],
      messages: [
        {
          id: `sys_${Date.now()}`,
          username: "Sistema",
          text: `Sala privada ${code} criada por ${cleanUsername}. Nível do exame: ${selectedLevel === "basico" ? "Nível Básico" : selectedLevel === "medio" ? "Nível Médio" : "Nível Superior"}.`,
          timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
        }
      ],
      status: "lobby",
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      createdAt: Date.now(),
      nivel: selectedLevel
    };

    rooms.set(code, newRoom);
    console.log(`[MULTIPLAYER] Sala privada criada: #${code} por ${cleanUsername}`);
    res.json({ success: true, roomCode: code, room: newRoom });
  } catch (err: any) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Erro interno no servidor ao criar a sala privada." });
  }
});

// Join an existing private room
app.post("/api/multiplayer/join", (req, res) => {
  try {
    const { username, roomCode } = req.body;
    const cleanUsername = username ? String(username).trim() : "";
    if (!cleanUsername || !roomCode) {
      return res.status(400).json({ error: "Nome de candidato e código da sala são obrigatórios." });
    }

    const cleanCode = String(roomCode).toUpperCase().trim();
    const room = rooms.get(cleanCode);

    if (!room) {
      return res.status(404).json({ error: "Sala não encontrada. Verifique o código inserido." });
    }

    if (room.status !== "lobby") {
      return res.status(400).json({ error: "A simulação nesta sala já iniciou." });
    }

    // Check if username is already in the room
    const alreadyJoined = room.players.some(p => p.username.toLowerCase() === cleanUsername.toLowerCase());
    if (alreadyJoined) {
      return res.json({ success: true, roomCode: cleanCode, room });
    }

    // Enforce 2-player capacity (Duelo 1 vs 1)
    if (room.players.length >= 2) {
      return res.status(400).json({ error: "Esta sala já está cheia (limite de 2 participantes para Duelo 1 vs 1)." });
    }

    const newPlayer: Player = {
      username: cleanUsername,
      isReady: true,
      score: 0,
      progress: 0,
      isHost: false,
      answers: {}
    };

    room.players.push(newPlayer);
    
    // When second player joins, room becomes full (1 vs 1 duel) and closes to new participants
    if (room.players.length === 2) {
      room.players.forEach(p => p.isReady = true);
      room.messages.push({
        id: `sys_${Date.now()}`,
        username: "Sistema",
        text: `Duelo 1 vs 1 completo! ${cleanUsername} entrou. A sala foi fechada e o simulado está a iniciar...`,
        timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
      });
      room.status = "playing";
    } else {
      room.messages.push({
        id: `sys_${Date.now()}`,
        username: "Sistema",
        text: `O candidato ${cleanUsername} juntou-se à sala de preparação.`,
        timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
      });
    }

    rooms.set(cleanCode, room);
    broadcastRoomState(cleanCode);

    res.json({ success: true, roomCode: cleanCode, room });
  } catch (err: any) {
    console.error("Error joining room:", err);
    res.status(500).json({ error: "Erro interno no servidor ao aceder à sala." });
  }
});

// Set Player Ready State
app.post("/api/multiplayer/ready", (req, res) => {
  const { username, roomCode, isReady } = req.body;
  if (!username || !roomCode) {
    return res.status(400).json({ error: "Username and roomCode are required" });
  }

  const cleanCode = roomCode.toUpperCase().trim();
  const room = rooms.get(cleanCode);
  if (!room) return res.status(404).json({ error: "Room not found" });

  const player = room.players.find(p => p.username === username);
  if (player) {
    player.isReady = isReady;
    broadcastRoomState(cleanCode);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Player not found" });
  }
});

// Start the Multiplayer Game
app.post("/api/multiplayer/start", (req, res) => {
  const { username, roomCode } = req.body;
  if (!username || !roomCode) {
    return res.status(400).json({ error: "Username and roomCode are required" });
  }

  const cleanCode = roomCode.toUpperCase().trim();
  const room = rooms.get(cleanCode);
  if (!room) return res.status(404).json({ error: "Room not found" });

  const player = room.players.find(p => p.username === username);
  if (!player || !player.isHost) {
    return res.status(403).json({ error: "Apenas o criador da sala pode iniciar o exame." });
  }

  room.status = "playing";
  room.messages.push({
    id: `sys_${Date.now()}`,
    username: "Sistema",
    text: `O exame começou! Boa sorte a todos os candidatos do MININT.`,
    timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
  });

  rooms.set(cleanCode, room);
  broadcastRoomState(cleanCode);
  res.json({ success: true });
});

// Submit answer inside Multiplayer Exam
app.post("/api/multiplayer/answer", (req, res) => {
  const { username, roomCode, questionIndex, isCorrect } = req.body;
  if (!username || !roomCode || questionIndex === undefined) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const cleanCode = roomCode.toUpperCase().trim();
  const room = rooms.get(cleanCode);
  if (!room) return res.status(404).json({ error: "Room not found" });

  const player = room.players.find(p => p.username === username);
  if (!player) return res.status(404).json({ error: "Player not found" });

  // Record answer (only once per index)
  if (player.answers[questionIndex] === undefined) {
    player.answers[questionIndex] = isCorrect;
    player.progress += 1;
    if (isCorrect) {
      player.score += 1;
    }

    // Check if all players finished
    const allFinished = room.players.every(p => p.progress >= room.questions.length);
    if (allFinished) {
      room.status = "finished";
      room.messages.push({
        id: `sys_${Date.now()}`,
        username: "Sistema",
        text: `Simulação concluída! Veja o pódio final e compare as notas.`,
        timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
      });

      // Submit points automatically to leaderboard for all active players
      room.players.forEach(p => {
        const pointsGained = p.score * 50; // 50 points per correct answer
        const existingIdx = rankings.findIndex(r => r.username.toLowerCase() === p.username.toLowerCase());
        const accuracy = Math.round((p.score / room.questions.length) * 100);

        if (existingIdx !== -1) {
          rankings[existingIdx].points += pointsGained;
          rankings[existingIdx].totalExams += 1;
          const oldTotal = rankings[existingIdx].totalExams - 1;
          rankings[existingIdx].accuracy = Math.round(
            (rankings[existingIdx].accuracy * oldTotal + accuracy) / rankings[existingIdx].totalExams
          );
        } else {
          rankings.push({
            username: p.username,
            points: pointsGained,
            totalExams: 1,
            accuracy
          });
        }
      });
      // Sort rankings
      rankings.sort((a, b) => b.points - a.points);
    }

    rooms.set(cleanCode, room);
    broadcastRoomState(cleanCode);
  }

  res.json({ success: true, room });
});

// Post a Chat Message
app.post("/api/multiplayer/chat", (req, res) => {
  const { username, roomCode, text } = req.body;
  if (!username || !roomCode || !text) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const cleanCode = roomCode.toUpperCase().trim();
  const room = rooms.get(cleanCode);
  if (!room) return res.status(404).json({ error: "Room not found" });

  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    username,
    text,
    timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
  };

  room.messages.push(newMessage);
  if (room.messages.length > 50) {
    room.messages.shift(); // Keep chat history concise
  }

  rooms.set(cleanCode, room);
  broadcastRoomState(cleanCode);
  res.json({ success: true });
});

// SSE Stream Endpoint for Real-time Connection
app.get("/api/multiplayer/stream", (req, res) => {
  const { roomCode, username } = req.query;
  if (!roomCode || !username) {
    return res.status(400).send("roomCode and username are required");
  }

  const cleanCode = (roomCode as string).toUpperCase().trim();
  const name = username as string;

  const room = rooms.get(cleanCode);
  if (!room) {
    return res.status(404).send("Room not found");
  }

  // Setup Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Keep connection alive with periodic comments
  const keepAliveInterval = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 20000);

  // Register client
  if (!roomClients.has(cleanCode)) {
    roomClients.set(cleanCode, []);
  }
  roomClients.get(cleanCode)!.push({ username: name, res });

  // Send initial room state immediately
  res.write(`data: ${JSON.stringify({ type: "room_update", room })}\n\n`);

  // Handle client disconnection
  req.on("close", () => {
    clearInterval(keepAliveInterval);

    // Remove client from connection pool
    const activeClients = roomClients.get(cleanCode) || [];
    const filteredClients = activeClients.filter(c => c.res !== res);
    roomClients.set(cleanCode, filteredClients);

    // Remove player from the room state if in lobby (or mark offline/remove)
    const currentRoom = rooms.get(cleanCode);
    if (currentRoom) {
      if (currentRoom.status === "lobby") {
        currentRoom.players = currentRoom.players.filter(p => p.username !== name);
        currentRoom.messages.push({
          id: `sys_exit_${Date.now()}`,
          username: "Sistema",
          text: `O candidato ${name} saiu da sala.`,
          timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
        });

        // Reassign host if host left and room is not empty
        const wasHost = currentRoom.players.length > 0 && !currentRoom.players.some(p => p.isHost);
        if (wasHost && currentRoom.players.length > 0) {
          currentRoom.players[0].isHost = true;
          currentRoom.players[0].isReady = true;
          currentRoom.messages.push({
            id: `sys_host_${Date.now()}`,
            username: "Sistema",
            text: `O candidato ${currentRoom.players[0].username} é agora o anfitrião da sala.`,
            timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
          });
        }

        if (currentRoom.players.length === 0) {
          rooms.delete(cleanCode);
          roomClients.delete(cleanCode);
          return;
        }

        rooms.set(cleanCode, currentRoom);
        broadcastRoomState(cleanCode);
      }
    }
  });
});


// ==========================================
// API: GEMINI ASSISTANT FOR EXAM EXPLANATIONS
// ==========================================

// Explains an answer or answers candidate questions with rich context
app.post("/api/gemini/explain", async (req, res) => {
  const { questionText, options, correctAnswer, selectedAnswer, explanation, userQuestion } = req.body;

  try {
    const ai = getGemini();

    const prompt = `
      Você é o "Tutor Inteligente MININT", um assistente de inteligência artificial altamente qualificado, especializado na legislação angolana, história de Angola e regulamentos do Ministério do Interior (MININT).
      
      Por favor, ajude o candidato respondendo com clareza técnica e encorajamento profissional em português de Angola.
      
      --- CONTEXTO DA QUESTÃO ---
      Materia: Legislação e conhecimentos gerais do MININT / Angola.
      Pergunta: "${questionText}"
      Opções disponíveis: ${JSON.stringify(options)}
      Índice da resposta correta: ${correctAnswer} (Opção correta: "${options[correctAnswer]}")
      Índice respondido pelo usuário: ${selectedAnswer} (Opção selecionada: "${selectedAnswer !== null ? options[selectedAnswer] : 'Nenhuma'}")
      Explicação padrão rápida: "${explanation}"
      
      Dúvida específica do candidato: "${userQuestion || 'Por favor, dê uma explicação aprofundada da matéria relacionada a este artigo/tema.'}"
      
      Responda de forma pedagógica, destacando referências de artigos se aplicável (como os artigos da CRA de 2010 ou regulamentos do MININT), explicando os erros das alternativas erradas e oferecendo uma super dica de memorização para o concurso público. Retorne a resposta com formatação Markdown limpa e agradável para leitura rápida.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é o Tutor Inteligente do Concurso MININT. Responde com clareza legislativa e histórica, ajudando candidatos angolanos a serem aprovados nos exames oficiais.",
        temperature: 0.7,
      },
    });

    res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    console.error("Gemini Explanation Error:", error?.message || error);
    res.json({
      success: true,
      explanation: `**Tutor Inteligente MININT (Modo Local):**\n\n${explanation}\n\n*Nota: Para aprovação no Concurso do MININT, lembre-se de consultar os artigos da Constituição da República de Angola (CRA) referentes à Defesa e Segurança Nacional (Art. 206º a 212º).*`
    });
  }
});

// ==========================================
// API: GEMINI DICA DO DIA (TIP OF THE DAY)
// ==========================================

const FALLBACK_TIPS = [
  {
    titulo: "Divisão Político-Administrativa de Angola",
    categoria: "Cultura Geral / Geografia",
    conteudo: "Com a Lei da Divisão Político-Administrativa (2024/2025), Angola conta com 21 Províncias, integrando as novas províncias de Icolo e Bengo, Moxico Leste e Cuando. Tema garantido no exame!",
    fonte: "Lei n.º 14/24 de Divisão Político-Administrativa"
  },
  {
    titulo: "Insubordinação e Hierarquia Policial",
    categoria: "Legislação e Segurança Interna",
    conteudo: "Nos termos dos regulamentos da PNA, a hierarquia e a disciplina militar/policial são os pilares de actuação. Contudo, ordens manifestamente ilegais que atentem contra os Direitos Humanos não devem ser cumpridas.",
    fonte: "Regulamento Disciplinar da PNA"
  },
  {
    titulo: "Papel Constitucional da PNA",
    categoria: "Organização do Estado",
    conteudo: "O Artigo 211.º da Constituição da República de Angola (CRA) estabelece a Polícia Nacional como uma instituição nacional, permanente, regular e apartidária, incumbida de garantir a ordem e segurança pública.",
    fonte: "Artigo 211.º da CRA"
  },
  {
    titulo: "Atribuições do SME",
    categoria: "Segurança Interna / SME",
    conteudo: "O Serviço de Migração e Estrangeiros (SME) é o órgão executivo central do MININT incumbido de promover e coordenar a aplicação das medidas de controlo de entrada, permanência, residência e saída do território nacional.",
    fonte: "Estatuto Orgânico do MININT"
  },
  {
    titulo: "Atribuições do SIC",
    categoria: "Segurança Interna / SIC",
    conteudo: "O Serviço de Investigação Criminal (SIC) é o órgão encarregado da prevenção, investigação de crimes e instrução preparatória dos processos-crime de sua competência.",
    fonte: "Estatuto Orgânico do SIC"
  },
  {
    titulo: "Serviço de Protecção Civil e Bombeiros (SPCB)",
    categoria: "Segurança Interna / SPCB",
    conteudo: "Ao SPCB incumbe a prevenção e socorro em situações de calamidade pública, incêndios, acidentes e resgate de pessoas e bens em todo o território nacional.",
    fonte: "Decreto Presidencial sobre o SPCB"
  },
  {
    titulo: "Uso Obrigatório do 'Há' vs 'A'",
    categoria: "Língua Portuguesa",
    conteudo: "No contexto do tempo decorrido, usa-se 'Há' (com H e acento): 'O concurso foi anunciado há dois meses'. Para tempo futuro ou distância, usa-se apenas 'a': 'A prova será a 10km da central'.",
    fonte: "Gramática da Língua Portuguesa"
  }
];

app.get("/api/gemini/dica-do-dia", async (req, res) => {
  try {
    const ai = getGemini();

    const prompt = `
      Gere uma "Dica de Ouro do Dia" altamente relevante e sucinta para um candidato a estudar para o Concurso Público do Ministério do Interior (MININT) de Angola.
      A dica pode ser sobre:
      1. Legislação ou artigo da Constituição de Angola (CRA) sobre segurança nacional/segurança pública.
      2. História ou Divisão Político-Administrativa de Angola (ex: a nova lei das 21 províncias de 2024/2025).
      3. Curiosidade sobre os órgãos executivos directos do MININT (PNA, SIC, SME, SPCB ou SPN).
      4. Regra essencial de Língua Portuguesa / Raciocínio Lógico recorrente nos exames do MININT.

      Retorne estritamente um objeto JSON no formato requerido.
    `;

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
        temperature: 0.9,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, tip: parsed });
  } catch (error: any) {
    // Log concisely without throwing unhandled exceptions
    console.log("Gemini Dica do Dia: Usando dica oficial do acervo MININT (Quota/Network Fallback).");

    const randomFallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    res.json({ success: true, tip: randomFallback, fallback: true });
  }
});


// ==========================================
// VITE DEV SERVER AND ASSETS PIPELINE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MININT Simulados] Server running on http://localhost:${PORT}`);
  });
}

startServer();
