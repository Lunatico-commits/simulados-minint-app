import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, Send, Sparkles, Check, X, ChevronRight, Loader2, ShieldCheck, HelpCircle as HelpIcon, ArrowRight, BookOpen, GraduationCap, Award, Clock, AlertTriangle, Maximize2, Minimize2, Target, Volume2, VolumeX, LogOut, RefreshCw } from "lucide-react";
import { Question, ExamAttempt, Level } from "../types";
import { LEVEL_INFO } from "../data/questions";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { playCorrectSound, playIncorrectSound, playVictorySound, playClickSound, isSoundEnabled, setSoundEnabled } from "../utils/soundEffects";
import AnimatedCounter from "./AnimatedCounter";

interface ExamEngineProps {
  username: string;
  category: string | null;
  level?: Level;
  onFinishExam: (score: number, total: number, category: string, level?: Level) => void;
  onNavigateBack: () => void;
}

interface ChatInteraction {
  sender: "user" | "ai";
  text: string;
}

export default function ExamEngine({
  username,
  category,
  level = "basico",
  onFinishExam,
  onNavigateBack
}: ExamEngineProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Array<{ questionId: string; selected: number; isCorrect: boolean }>>([]);

  // Gemini Tutor integration states
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorHistory, setTutorHistory] = useState<ChatInteraction[]>([]);
  const [tutorLoading, setTutorLoading] = useState(false);

  // Timer state (5 minutes = 300 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [timeUp, setTimeUp] = useState<boolean>(false);

  // Focus Mode state (Distraction-free Fullscreen)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Função para procurar perguntas inéditas no servidor (Obriga a Estar ONLINE)
  const loadQuestionsFromAI = async () => {
    setIsLoadingQuestions(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materia: category || "Cultura Geral e Legislação MININT",
          nivel: level,
          count: 5
        })
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        const initialSeconds = data.questions.length * 60;
        setTimeLeft(initialSeconds);
        setTimeUp(false);
      } else {
        setFetchError("Não foi possível carregar o exame. Certifica-te de que estás ligado à internet.");
      }
    } catch (err) {
      setFetchError("Legação necessária! Para gerar perguntas atualizadas e validadas, liga os Dados Móveis ou Wi-Fi.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Carregar as perguntas do servidor na montagem do componente
  useEffect(() => {
    loadQuestionsFromAI();
  }, [category, level]);

  // Toggle Focus Mode and Request/Exit Fullscreen
  const toggleFocusMode = () => {
    setIsFocusMode(prev => {
      const nextState = !prev;
      if (nextState) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return nextState;
    });
  };

  // Listen to fullscreen changes and Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocusMode]);

  // Countdown timer interval
  useEffect(() => {
    if (examFinished || questions.length === 0 || isLoadingQuestions) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examFinished, questions.length, isLoadingQuestions]);

  // Automatic submission when time reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !examFinished && questions.length > 0 && !timeUp && !isLoadingQuestions) {
      setTimeUp(true);
      setExamFinished(true);
      const examName = category || "Simulado Geral";
      onFinishExam(score, questions.length, examName, level);
    }
  }, [timeLeft, examFinished, questions.length, timeUp, score, category, level, onFinishExam, isLoadingQuestions]);

  // Warn user when trying to reload or close tab mid-exam
  useEffect(() => {
    if (examFinished || questions.length === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Tens a certeza que queres sair? O teu progresso no simulado será perdido.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examFinished, questions.length]);

  // Scroll tutor chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tutorHistory, tutorOpen]);

  // Celebration confetti effect & sound on exam completion
  useEffect(() => {
    if (examFinished) {
      playVictorySound();

      if (questions.length > 0 && score === questions.length) {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.55 },
          colors: ["#eaaf0c", "#d97706", "#2563eb", "#3b82f6", "#ffffff", "#ffd700"],
          shapes: ["circle", "square", "star"]
        });

        const timer1 = setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.65 },
            colors: ["#eaaf0c", "#2563eb", "#ffd700", "#ffffff"],
            shapes: ["star", "circle"]
          });
        }, 250);

        const timer2 = setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.65 },
            colors: ["#eaaf0c", "#2563eb", "#ffd700", "#ffffff"],
            shapes: ["star", "circle"]
          });
        }, 450);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }
  }, [examFinished, score, questions.length]);

  // Ecrã de Carregamento (Enquanto o Gemini gera as perguntas)
  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-300 font-sans p-6 text-center">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
        <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">A Gerar Simulado Inédito...</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          A Inteligência Artificial do Tutor MININT está a compilar 5 questões inéditas e atualizadas.
        </p>
      </div>
    );
  }

  // Ecrã de Erro de Conexão (Caso o candidato esteja sem internet)
  if (fetchError || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center font-sans">
        <div className="bg-red-950/40 border border-red-500/30 rounded-3xl p-6 max-w-md space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-xs text-red-200 leading-relaxed font-medium">{fetchError}</p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={onNavigateBack}
              className="flex-1 px-4 py-2.5 bg-sleek-card-sec border border-slate-800 text-slate-300 text-xs font-bold rounded-xl uppercase"
            >
              Voltar
            </button>
            <button
              onClick={loadQuestionsFromAI}
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl uppercase flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered) return;
    playClickSound();
    setSelectedOption(optionIndex);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;

    const isCorrect = selectedOption === currentQuestion.resposta_correta;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    setUserAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id || String(currentIndex),
        selected: selectedOption,
        isCorrect
      }
    ]);

    setIsAnswered(true);

    setTutorHistory([
      {
        sender: "ai",
        text: `Olá ${username}! Eu sou o Tutor Inteligente do MININT. Analisei esta questão sobre *"${currentQuestion.materia}"* e posso esclarecer quaisquer dúvidas técnicas. O que gostarias de aprofundar nesta matéria?`
      }
    ]);
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setTutorOpen(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setExamFinished(true);
      const examName = category || "Simulado Geral";
      onFinishExam(score, questions.length, examName, level);
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim() || tutorLoading) return;

    const userText = tutorInput;
    setTutorInput("");
    setTutorHistory(prev => [...prev, { sender: "user", text: userText }]);
    setTutorLoading(true);

    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: currentQuestion.pergunta,
          options: currentQuestion.opcoes,
          correctAnswer: currentQuestion.resposta_correta,
          selectedAnswer: selectedOption,
          explanation: currentQuestion.explicacao,
          userQuestion: userText
        })
      });

      const data = await response.json();
      if (data.success) {
        setTutorHistory(prev => [...prev, { sender: "ai", text: data.explanation }]);
      } else {
        setTutorHistory(prev => [
          ...prev,
          { sender: "ai", text: "Lamento, encontrei um erro ao processar a tua dúvida. Por favor, reformula a tua pergunta." }
        ]);
      }
    } catch (err) {
      setTutorHistory(prev => [
        ...prev,
        { sender: "ai", text: "Não consegui ligar-me ao servidor de Inteligência Artificial. Certifica-te de que estás online." }
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isWarning = timeLeft <= 30;

  return (
    <div className={`transition-all duration-300 font-sans ${
      isFocusMode
        ? "fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center"
        : "max-w-4xl mx-auto px-4 py-6 md:py-8"
    }`}>
      <div className={isFocusMode ? "w-full max-w-4xl my-auto space-y-4" : "w-full"}>
        {isFocusMode && (
          <div className="w-full bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-300 shadow-xl">
            <div className="flex items-center gap-2 font-mono font-bold">
              <Target className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span>MODO FOCO ATIVO • Concentração Total no Simulado</span>
            </div>
            <button
              onClick={toggleFocusMode}
              className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              Sair do Foco (ESC)
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!examFinished ? (
            <motion.div
              key="exam-active"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className={`lg:col-span-${tutorOpen ? "7" : "12"} transition-all duration-300 space-y-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-sleek-card border border-slate-800/80 rounded-2xl p-4 gap-3 shadow-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        {category || "Simulado Geral MININT"}
                      </span>
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase font-semibold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        {LEVEL_INFO[level || "basico"].badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200">
                      Pergunta {currentIndex + 1} de {questions.length}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                    <button
                      onClick={handleToggleSound}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                        soundOn
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-sleek-card-sec border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {soundOn ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden xs:inline">Som</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden xs:inline">Mute</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={toggleFocusMode}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isFocusMode
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 font-extrabold"
                          : "bg-sleek-card-sec hover:bg-sleek-card-hover border-slate-800 text-slate-300 hover:text-amber-400"
                      }`}
                    >
                      {isFocusMode ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Sair do Foco</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                          <span>Modo Foco</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={onNavigateBack}
                      className="px-2.5 py-1.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-900/40 text-red-300 hover:text-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden xs:inline">Sair</span>
                    </button>

                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold transition-all shrink-0 ${
                        isWarning
                          ? "bg-red-950/80 border-red-500/80 text-red-400 animate-pulse shadow-lg shadow-red-950/60 ring-2 ring-red-500/40"
                          : "bg-sleek-card-sec border-slate-800 text-amber-400"
                      }`}
                    >
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{formattedTime}</span>
                    </div>

                    <div className="w-28 sm:w-32 md:w-36 space-y-1 shrink-0">
                      <div className="w-full bg-sleek-card-sec h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-[9px] text-slate-500 text-right font-mono">
                        {Math.round(((currentIndex) / questions.length) * 100)}% concluído
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id || currentIndex}
                    initial={{ opacity: 0, x: 35 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -35 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="bg-sleek-card backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl gold-border-glow relative"
                  >
                    <div className="space-y-4">
                      <div className="flex gap-2.5 items-start">
                        <span className="w-7 h-7 rounded-lg bg-sleek-card-sec border border-blue-900 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          ?
                        </span>
                        <h3 className="text-slate-100 text-sm md:text-md font-semibold leading-relaxed">
                          {currentQuestion.pergunta}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentQuestion.opcoes.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectOption = idx === currentQuestion.resposta_correta;
                        
                        let optionStyle = "bg-sleek-card-sec border-slate-800 hover:border-slate-700 hover:bg-sleek-card-hover text-slate-300";
                        
                        if (isAnswered) {
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
                            disabled={isAnswered}
                            onClick={() => handleOptionClick(idx)}
                            className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all duration-200 flex items-center justify-between gap-3 ${
                              !isAnswered ? "cursor-pointer" : "cursor-default"
                            } ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {isAnswered && isCorrectOption && (
                              <span className="p-1 bg-emerald-500/10 rounded-full">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              </span>
                            )}
                            {isAnswered && isSelected && !isCorrectOption && (
                              <span className="p-1 bg-red-500/10 rounded-full">
                                <X className="w-3.5 h-3.5 text-red-400" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                      <div className="text-xs text-slate-500">
                        {!isAnswered ? "Selecione uma opção e confirme para ver o feedback" : "Podes avançar para a próxima questão"}
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        {isAnswered && (
                          <button
                            onClick={() => setTutorOpen(!tutorOpen)}
                            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              tutorOpen
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                : "bg-sleek-card-sec hover:bg-sleek-card-hover border-slate-800 text-slate-400 hover:text-amber-400"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tutor IA
                          </button>
                        )}

                        {!isAnswered ? (
                          <button
                            disabled={selectedOption === null}
                            onClick={handleConfirmAnswer}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                              selectedOption !== null
                                ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30"
                                : "bg-sleek-card-sec text-slate-500 cursor-not-allowed border border-slate-800/40"
                            }`}
                          >
                            Confirmar Resposta
                          </button>
                        ) : (
                          <button
                            onClick={handleNextQuestion}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-700 to-sleek-accent hover:from-blue-600 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 group"
                          >
                            {currentIndex + 1 === questions.length ? "Finalizar Exame" : "Avançar"}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-sleek-card border border-slate-800/80 rounded-2xl p-5 space-y-2 overflow-hidden"
                    >
                      <h5 className="text-xs font-bold text-sleek-accent flex items-center gap-1.5 uppercase tracking-wider">
                        <HelpIcon className="w-4 h-4" /> Fundamentação Oficial
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentQuestion.explicacao}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {tutorOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="lg:col-span-5 bg-sleek-card border border-slate-800 rounded-3xl p-5 flex flex-col h-[550px] shadow-2xl relative"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Tutor IA do MININT</h4>
                          <span className="text-[9px] text-slate-500">Gemini Active</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setTutorOpen(false)}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Recolher
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                      {tutorHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-blue-600/15 border border-blue-900/40 text-blue-200 ml-6"
                              : "bg-sleek-card-sec border border-slate-800/60 text-slate-300 mr-6"
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))}
                      {tutorLoading && (
                        <div className="bg-sleek-card-sec border border-slate-800/60 p-3 rounded-2xl mr-6 flex items-center gap-2 text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                          <span>O Tutor está a fundamentar a resposta...</span>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleAskTutor} className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <input
                        type="text"
                        disabled={tutorLoading}
                        value={tutorInput}
                        onChange={(e) => setTutorInput(e.target.value)}
                        placeholder="Ex: Qual é o Artigo da CRA referente a isso?"
                        className="flex-1 bg-sleek-card-sec border border-slate-800 focus:border-amber-500/40 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none placeholder-slate-600"
                      />
                      <button
                        type="submit"
                        disabled={tutorLoading || !tutorInput.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-sleek-card text-white rounded-xl transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="exam-finished"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl mx-auto bg-sleek-card backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 text-center gold-border-glow shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700/5 via-transparent to-sleek-accent/5 rounded-3xl pointer-events-none"></div>

              <div className="space-y-4">
                {timeUp && (
                  <div className="bg-red-950/80 border border-red-500/60 text-red-300 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold animate-pulse shadow-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Tempo Esgotado! O simulado foi encerrado automaticamente aos 5 minutos.</span>
                  </div>
                )}

                <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-sleek-accent rounded-full flex items-center justify-center border-2 border-sleek-accent/40 shadow-xl mx-auto shadow-sleek-accent/5">
                  <ShieldCheck className="w-10 h-10 text-sleek-accent" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-slate-100">Simulado Concluído!</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Avaliação Oficial de Concorrência</p>
                </div>
              </div>

              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" className="stroke-sleek-card-sec fill-none" strokeWidth="10" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-sleek-accent fill-none transition-all duration-1000"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / questions.length)}`}
                  />
                </svg>
                <div className="absolute text-center space-y-0.5">
                  <span className="text-4xl font-extrabold font-mono tracking-tighter text-slate-100">
                    <AnimatedCounter value={score} duration={1000} />
                  </span>
                  <span className="text-slate-500 text-sm block">/ {questions.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                  score === questions.length
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : score >= questions.length * 0.5
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                    : "bg-red-950 text-red-400 border border-red-800/40"
                }`}>
                  {score === questions.length ? (
                    <>
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Pontuação Perfeita! (100% Aprovado)
                    </>
                  ) : score >= questions.length * 0.5 ? (
                    "Apto para Admissão"
                  ) : (
                    "Abaixo da Média (Exige Foco)"
                  )}
                </span>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {score === questions.length
                    ? `Excelente desempenho, ${username}! Acertaste todas as perguntas oficiais. Estás totalmente preparado para os exames de admissão do MININT.`
                    : score >= questions.length * 0.5
                    ? `Parabéns ${username}! O teu resultado demonstra boa proficiência jurídica e conceitual do Ministério do Interior.`
                    : "Não desistas! A legislação angolana exige repetição e rigor. Utiliza o Tutor IA nas matérias com dúvidas para dominar os artigos."}
                </p>
              </div>

              <div className="bg-sleek-card-sec border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4 divide-x divide-slate-850">
                <div className="space-y-1 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Aproveitamento</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">
                    <AnimatedCounter value={Math.round((score / questions.length) * 100)} suffix="%" duration={1200} />
                  </span>
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pontos Recebidos</span>
                  <span className="text-lg font-bold text-sleek-accent font-mono">
                    +<AnimatedCounter value={score * 50} suffix=" PTS" duration={1400} />
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onNavigateBack}
                  className="flex-1 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-sleek-accent/30 text-sleek-accent text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl cursor-pointer transition-all"
                >
                  Voltar ao Painel
                </button>
                <button
                  onClick={() => {
                    setExamFinished(false);
                    setCurrentIndex(0);
                    setScore(0);
                    setSelectedOption(null);
                    setIsAnswered(false);
                    setUserAnswers([]);
                    setTutorOpen(false);
                    loadQuestionsFromAI();
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  Refazer Simulado
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
