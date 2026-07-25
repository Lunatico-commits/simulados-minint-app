import React, { useState, useEffect, useRef } from "react";
import { Users, MessageSquare, Plus, Send, Play, Check, CheckCircle2, User, Copy, Lock, Trophy, Loader2, LogOut, ShieldAlert, X, GraduationCap } from "lucide-react";
import { Room, Player, ChatMessage, Question, Level } from "../types";
import { LEVEL_INFO } from "../data/questions";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

interface MultiplayerLobbyProps {
  username: string;
  onNavigateBack: () => void;
}

export default function MultiplayerLobby({ username, onNavigateBack }: MultiplayerLobbyProps) {
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Game states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const eventSourceRef = useRef<EventSource | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.messages, room?.status]);

  // Clean up SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Celebrate victory or 100% score when multiplayer ends
  useEffect(() => {
    if (room?.status === "finished") {
      const myPlayer = room.players.find(p => p.username === username);
      const isWinner = room.players.length > 0 && 
        [...room.players].sort((a, b) => b.score - a.score)[0]?.username === username;
      const isPerfectScore = myPlayer && room.questions.length > 0 && myPlayer.score === room.questions.length;

      if (isWinner || isPerfectScore) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#eaaf0c", "#d97706", "#2563eb", "#3b82f6", "#ffffff"]
        });
      }
    }
  }, [room?.status, username]);

  // Initialize SSE event stream for the joined room
  const connectToRoomStream = (code: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const streamUrl = `/api/multiplayer/stream?roomCode=${code}&username=${encodeURIComponent(username)}`;
    const source = new EventSource(streamUrl);

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "room_update") {
          setRoom(data.room);
          
          // If the game just transitioned to playing on the server, reset client game index
          if (data.room.status === "playing") {
            setError("");
          }
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    source.onerror = (err) => {
      console.error("SSE stream error, reconnecting:", err);
    };

    eventSourceRef.current = source;
  };

  const [selectedRoomLevel, setSelectedRoomLevel] = useState<Level>("basico");

  // Create Private Room
  const handleCreateRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/multiplayer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, nivel: selectedRoomLevel })
      });
      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
        connectToRoomStream(data.roomCode);
      } else {
        setError(data.error || "Ocorreu um erro ao criar a sala privada.");
      }
    } catch (err) {
      setError("Erro de ligação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Join Existing Room
  const handleJoinRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!roomCodeInput.trim()) return;

    setLoading(true);
    setError("");
    const cleanCode = roomCodeInput.toUpperCase().trim();

    try {
      const res = await fetch("/api/multiplayer/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roomCode: cleanCode })
      });
      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
        connectToRoomStream(cleanCode);
      } else {
        setError(data.error || "Código inválido ou sala cheia.");
      }
    } catch (err) {
      setError("Erro ao tentar aceder à sala.");
    } finally {
      setLoading(false);
    }
  };

  // Leave room manually
  const handleLeaveRoom = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setRoom(null);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // Mark Ready state
  const handleToggleReady = async () => {
    if (!room) return;
    const self = room.players.find(p => p.username === username);
    if (!self) return;

    try {
      await fetch("/api/multiplayer/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          roomCode: room.code,
          isReady: !self.isReady
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Start the Game (Host Only)
  const handleStartGame = async () => {
    if (!room) return;
    try {
      const res = await fetch("/api/multiplayer/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roomCode: room.code })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erro ao iniciar o simulado.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Answer inside Multi Exam
  const handleSubmitAnswer = async () => {
    if (!room || selectedOption === null || isAnswered) return;

    const currentQuestion = room.questions[currentQuestionIdx];
    const isCorrect = selectedOption === currentQuestion.resposta_correta;

    setIsAnswered(true);

    try {
      await fetch("/api/multiplayer/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          roomCode: room.code,
          questionIndex: currentQuestionIdx,
          isCorrect
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentQuestionIdx(prev => prev + 1);
  };

  // Send Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !room) return;

    const messageText = chatInput;
    setChatInput("");

    try {
      await fetch("/api/multiplayer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          roomCode: room.code,
          text: messageText
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Copy Room Code Helper
  const [copied, setCopied] = useState(false);
  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ----------------------------------------------------
  // SCREEN: JOIN / CREATE SELECTION
  // ----------------------------------------------------
  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 font-sans text-slate-200">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sleek-accent/10 border border-sleek-accent/20 rounded-full text-sleek-accent text-xs font-semibold uppercase tracking-widest">
            <Users className="w-4 h-4" /> Sala de Competição em Directo
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-display text-slate-100">
            Preparação Cooperativa Multi-Candidato
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            Crie uma sala privada para estudar em conjunto com amigos ou digite um código de sala fornecido para se juntar à sessão.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800/50 text-red-200 text-xs md:text-sm px-4 py-3 rounded-xl flex items-start gap-2.5 max-w-lg mx-auto mb-6">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card: Create Room */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-sleek-card backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg gold-border-glow"
          >
            <div className="space-y-4">
              <div className="p-3 bg-sleek-card-sec border border-slate-800 rounded-2xl w-fit">
                <Plus className="w-6 h-6 text-sleek-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-display">Criar Sala de Preparação</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Escolha o nível das perguntas e crie um espaço exclusivo para si e para os seus colegas de estudo.
                </p>
              </div>

              {/* Level Selector */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Nível do Exame da Sala
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-sleek-card-sec p-1 rounded-xl border border-slate-800">
                  {(["basico", "medio", "superior"] as Level[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedRoomLevel(lvl)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        selectedRoomLevel === lvl
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {lvl === "basico" ? "Básico" : lvl === "medio" ? "Médio" : "Superior"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="mt-8 w-full bg-sleek-accent hover:bg-amber-500 text-sleek-bg font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-sleek-accent/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Sala Privada"}
            </button>
          </motion.div>

          {/* Card: Join Room */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-sleek-card backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-4">
              <div className="p-3 bg-sleek-card-sec border border-slate-800 rounded-2xl w-fit">
                <Lock className="w-6 h-6 text-sleek-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-display">Aceder a uma Sala Existente</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tem um código enviado por outro candidato? Introduza-o abaixo para entrar imediatamente no lobby.
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="mt-6 space-y-3">
              <input
                type="text"
                placeholder="Código de 4 Letras (Ex: FG87)"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={4}
                className="w-full bg-sleek-card-sec border border-slate-850 focus:border-sleek-accent/40 rounded-xl py-3 px-4 text-center font-mono font-bold text-sleek-accent placeholder-slate-700 outline-none transition-all uppercase tracking-widest text-sm"
              />

              <button
                type="submit"
                disabled={loading || !roomCodeInput.trim()}
                className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-sleek-card-sec disabled:text-slate-500 text-slate-950 font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Inserir Código"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  const selfPlayer = room.players.find(p => p.username === username);
  const isHost = selfPlayer?.isHost || false;

  // ----------------------------------------------------
  // VIEW: ROOM LOBBY STATE
  // ----------------------------------------------------
  if (room.status === "lobby") {
    const allPlayersReady = room.players.every(p => p.isReady);

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 font-sans text-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Participant list */}
          <div className="lg:col-span-7 bg-sleek-card backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Header with Room Code */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sala de Concurso Criada</span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100 font-display">Candidatos Registados</h3>
                    <span className="text-xs text-sleek-accent bg-sleek-card-sec border border-slate-800 px-2 py-0.5 rounded-full">
                      {room.players.length} Concorrentes
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-sleek-card-sec border border-slate-800/60 px-3.5 py-2 rounded-2xl w-full sm:w-auto justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Código de Acesso</span>
                    <span className="text-md font-mono font-extrabold text-sleek-accent tracking-wider">{room.code}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-sleek-card-hover rounded-xl text-slate-400 hover:text-sleek-accent border border-transparent hover:border-slate-800 cursor-pointer transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Player list */}
              <div className="space-y-2.5">
                {room.players.map((player) => (
                  <div
                    key={player.username}
                    className="bg-sleek-card-sec border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sleek-card border border-slate-800/60 flex items-center justify-center">
                        <User className="w-4 h-4 text-sleek-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm font-semibold text-slate-200">{player.username}</span>
                          {player.username === username && (
                            <span className="text-[9px] text-slate-500 uppercase border border-slate-800 px-1.5 py-0.2 rounded font-semibold">Tu</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {player.isHost ? "Anfitrião (Autoridade)" : "Inscrito"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {player.isReady ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pronto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium uppercase tracking-wider">
                          Aguardando
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action panel at bottom */}
            <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleLeaveRoom}
                className="w-full sm:w-auto px-5 py-3 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-red-900/30 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sair da Sala
              </button>

              {!isHost ? (
                <button
                  onClick={handleToggleReady}
                  className={`w-full sm:w-1/2 ml-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    selfPlayer?.isReady
                      ? "bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-900"
                      : "bg-sleek-accent hover:bg-amber-500 text-sleek-bg cursor-pointer shadow-lg shadow-sleek-accent/10"
                  }`}
                >
                  {selfPlayer?.isReady ? "Cancelar Pronto" : "Marcar como Pronto"}
                </button>
              ) : (
                <button
                  onClick={handleStartGame}
                  disabled={room.players.length < 2 || !allPlayersReady}
                  className={`w-full sm:w-1/2 ml-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    room.players.length >= 2 && allPlayersReady
                      ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/20"
                      : "bg-sleek-card-sec text-slate-500 cursor-not-allowed border border-slate-800/40"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" /> Iniciar Simulado
                </button>
              )}
            </div>

            {isHost && room.players.length < 2 && (
              <p className="text-[10px] text-amber-500 text-center uppercase tracking-wider font-semibold">
                Aguarde que pelo menos mais 1 candidato entre para iniciar o exame cooperativo.
              </p>
            )}
            {isHost && room.players.length >= 2 && !allPlayersReady && (
              <p className="text-[10px] text-amber-500 text-center uppercase tracking-wider font-semibold">
                Todos os candidatos inscritos devem marcar "Pronto" antes do simulado iniciar.
              </p>
            )}
          </div>

          {/* Right panel: Chat integration */}
          <div className="lg:col-span-5 bg-sleek-card backdrop-blur-md border border-slate-800 rounded-3xl p-5 flex flex-col h-[500px]">
            <div className="pb-3 border-b border-slate-800/80 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Mural de Discussão (Sala)</h4>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {room.messages.map((msg) => (
                <div key={msg.id} className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${
                      msg.username === "Sistema"
                        ? "text-sleek-accent"
                        : msg.username === username
                        ? "text-blue-400"
                        : "text-slate-300"
                    }`}>
                      {msg.username}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className={`p-2.5 rounded-xl leading-relaxed ${
                    msg.username === "Sistema"
                      ? "bg-sleek-card-sec/50 border border-slate-800/40 text-sleek-accent"
                      : msg.username === username
                      ? "bg-blue-950/40 border border-blue-900/20 text-slate-200"
                      : "bg-sleek-card-sec border border-slate-800/60 text-slate-300"
                  }`}>
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escreva uma mensagem..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-sleek-card-sec border border-slate-800 focus:border-sleek-accent/40 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none placeholder-slate-700"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-sleek-card text-white rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: ROOM PLAYING STATE (REAL-TIME GAMEPLAY)
  // ----------------------------------------------------
  if (room.status === "playing") {
    const currentQuestion = room.questions[currentQuestionIdx];
    const selfState = room.players.find(p => p.username === username);
    const hasAlreadyAnsweredQuestion = selfState?.answers[currentQuestionIdx] !== undefined;

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 font-sans text-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Middle: Current Question Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Exam header and tracking */}
            <div className="bg-sleek-card border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Modo Arena Cooperativa</span>
                <h4 className="text-xs font-bold text-slate-100">
                  Questão {currentQuestionIdx + 1} de {room.questions.length}
                </h4>
              </div>

              {/* Progress bar */}
              <div className="w-1/3 space-y-1">
                <div className="w-full bg-sleek-card-sec h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-sleek-accent h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + (hasAlreadyAnsweredQuestion ? 1 : 0)) / room.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question Play Board */}
            <div className="bg-sleek-card backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl gold-border-glow">
              <div className="flex gap-2.5 items-start">
                <span className="w-7 h-7 rounded-lg bg-sleek-card-sec border border-blue-900 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  Q
                </span>
                <h3 className="text-slate-100 text-sm md:text-md font-semibold leading-relaxed">
                  {currentQuestion.pergunta}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.opcoes.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOption = idx === currentQuestion.resposta_correta;

                  let optionStyle = "bg-sleek-card-sec border-slate-800 hover:border-slate-700 hover:bg-sleek-card-hover text-slate-300";

                  if (hasAlreadyAnsweredQuestion) {
                    const answeredIdx = selfState?.answers[currentQuestionIdx] !== undefined ? (isSelected || isCorrectOption ? (isCorrectOption ? currentQuestion.resposta_correta : selectedOption) : null) : null;
                    if (isCorrectOption) {
                      optionStyle = "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-medium";
                    } else if (isSelected) {
                      optionStyle = "bg-red-950/40 border-red-500/60 text-red-300";
                    } else {
                      optionStyle = "bg-sleek-card-sec/20 border-slate-900/80 text-slate-500 opacity-60";
                    }
                  } else if (isSelected) {
                    optionStyle = "bg-blue-950/60 border-blue-500/70 text-blue-200 ring-1 ring-blue-500/30";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAlreadyAnsweredQuestion}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all duration-200 flex items-center justify-between gap-3 ${
                        !hasAlreadyAnsweredQuestion ? "cursor-pointer" : "cursor-default"
                      } ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {hasAlreadyAnsweredQuestion && isCorrectOption && (
                        <span className="p-1 bg-emerald-500/10 rounded-full">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      )}
                      {hasAlreadyAnsweredQuestion && isSelected && !isCorrectOption && (
                        <span className="p-1 bg-red-500/10 rounded-full">
                          <X className="w-3.5 h-3.5 text-red-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500">
                  {!hasAlreadyAnsweredQuestion ? "Confirme para pontuar nesta ronda" : "Aguardando que os outros concorrentes concluam"}
                </span>

                {!hasAlreadyAnsweredQuestion ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                      selectedOption !== null
                        ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30"
                        : "bg-sleek-card text-slate-500 cursor-not-allowed border border-slate-800/40"
                    }`}
                  >
                    Confirmar Opção
                  </button>
                ) : (
                  currentQuestionIdx + 1 < room.questions.length ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all flex items-center gap-1"
                    >
                      Seguinte
                    </button>
                  ) : (
                    <span className="text-xs text-sleek-accent bg-amber-950/40 px-3.5 py-1.5 rounded-xl border border-amber-900/30 font-bold uppercase tracking-wider">
                      Aguardando Fim de Prova...
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Explanatory notes */}
            {hasAlreadyAnsweredQuestion && (
              <div className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Doutrina Relacionada</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQuestion.explicacao}
                </p>
              </div>
            )}
          </div>

          {/* Right: Live Leaderboard + Active Chat */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Placar de Líderes em tempo real */}
            <div className="bg-sleek-card backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <Trophy className="w-4 h-4 text-sleek-accent" /> Desempenho em Directo
              </h4>

              <div className="space-y-2">
                {room.players.map((p) => {
                  const percent = Math.round((p.progress / room.questions.length) * 100);
                  return (
                    <div key={p.username} className="bg-sleek-card-sec border border-slate-850/60 p-2.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">{p.username}</span>
                        <span className="font-mono font-bold text-sleek-accent">{p.score} acertos</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-sleek-card h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          {p.progress}/{room.questions.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat during play */}
            <div className="bg-sleek-card backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col h-[280px]">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Chat de Arena
              </h4>

              <div className="flex-1 overflow-y-auto space-y-2.5 my-2.5 pr-1 text-[11px]">
                {room.messages.slice(-15).map((msg) => (
                  <div key={msg.id} className="space-y-0.2">
                    <span className={`font-bold ${
                      msg.username === "Sistema" ? "text-sleek-accent" : msg.username === username ? "text-blue-400" : "text-slate-400"
                    }`}>
                      {msg.username}:
                    </span>
                    <span className="text-slate-300 ml-1.5">{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChat} className="flex gap-1.5 border-t border-slate-850 pt-2.5">
                <input
                  type="text"
                  placeholder="Provocar..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-sleek-card-sec border border-slate-800 focus:border-sleek-accent/40 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 outline-none placeholder-slate-700"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-sleek-card text-white rounded-lg transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: ROOM FINISHED STATE (PODIUM)
  // ----------------------------------------------------
  if (room.status === "finished") {
    // Sort players by score to determine rankings
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 font-sans text-slate-200">
        <div className="bg-sleek-card backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 text-center gold-border-glow shadow-2xl relative">
          
          <div className="space-y-3">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-700 via-sleek-card to-sleek-accent rounded-full flex items-center justify-center border-2 border-sleek-accent/40 shadow-xl mx-auto shadow-sleek-accent/5">
              <Trophy className="w-10 h-10 text-sleek-accent" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-2xl font-bold tracking-tight text-slate-100">Fim do Exame Cooperativo</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Resultados Finais da Arena</p>
            </div>
          </div>

          {/* Podium Drawing */}
          <div className="flex items-end justify-center gap-4 max-w-sm mx-auto h-48 pt-6">
            
            {/* 2nd Place (Silver) */}
            {sortedPlayers[1] && (
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-300 max-w-[80px] truncate">{sortedPlayers[1].username}</span>
                <span className="text-[10px] text-slate-500 font-mono mb-1">{sortedPlayers[1].score} pts</span>
                <div className="w-full bg-sleek-card border-t-2 border-slate-400 rounded-t-xl h-20 flex items-center justify-center text-slate-400 font-bold font-display shadow-lg shadow-slate-950/20">
                  2º
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {sortedPlayers[0] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-sleek-accent animate-bounce mb-1">
                  👑
                </div>
                <span className="text-sm font-extrabold text-sleek-accent max-w-[90px] truncate">{sortedPlayers[0].username}</span>
                <span className="text-xs text-slate-400 font-mono mb-1.5">{sortedPlayers[0].score} pts</span>
                <div className="w-full bg-sleek-card-sec border-t-4 border-sleek-accent rounded-t-2xl h-28 flex items-center justify-center text-sleek-accent font-extrabold font-display text-lg shadow-xl shadow-sleek-accent/5">
                  1º
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {sortedPlayers[2] && (
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-bold text-amber-600 max-w-[80px] truncate">{sortedPlayers[2].username}</span>
                <span className="text-[10px] text-slate-500 font-mono mb-1">{sortedPlayers[2].score} pts</span>
                <div className="w-full bg-sleek-card border-t border-amber-700 rounded-t-xl h-14 flex items-center justify-center text-amber-700 font-bold font-display shadow-lg shadow-slate-950/20">
                  3º
                </div>
              </div>
            )}
          </div>

          {/* Placar Completo */}
          <div className="bg-sleek-card-sec border border-slate-800/80 rounded-2xl p-4 text-left space-y-2.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block border-b border-slate-850 pb-1.5">Placar Geral</span>
            {sortedPlayers.map((p, idx) => (
              <div key={p.username} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="font-semibold text-slate-300">{p.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sleek-accent">{p.score} / {room.questions.length}</span>
                  <span className="text-[10px] text-slate-500 bg-sleek-card border border-slate-800/80 px-2 py-0.5 rounded">
                    +{p.score * 50} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick chat summary block */}
          <div className="bg-sleek-card border border-slate-800/80 p-4 rounded-2xl flex flex-col h-40">
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-850">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-slate-400 uppercase font-bold">Conversas do Pódio</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] text-left">
              {room.messages.slice(-6).map((msg) => (
                <div key={msg.id}>
                  <span className="font-bold text-sleek-accent">{msg.username}:</span>
                  <span className="text-slate-300 ml-1.5">{msg.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-1.5 pt-2 border-t border-slate-850">
              <input
                type="text"
                placeholder="Parabenizar..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-sleek-card-sec border border-slate-800 focus:border-sleek-accent/40 rounded-lg py-1 px-2 text-xs text-slate-100 outline-none placeholder-slate-700"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

          {/* Back actions */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={handleLeaveRoom}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition-all"
            >
              Voltar ao Painel Principal
            </button>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
