import { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ExamEngine from "./components/ExamEngine";
import MultiplayerLobby from "./components/MultiplayerLobby";
import Leaderboard from "./components/Leaderboard";
import Footer from "./components/Footer";
import AvatarSelectionModal from "./components/AvatarSelectionModal";
import ExitExamConfirmModal from "./components/ExitExamConfirmModal";
import ScrollToTop from "./components/ScrollToTop";
import { RankChangeNotice } from "./components/RankNotificationToast";
import { UserState, UserStats, Level } from "./types";
import { useTheme } from "./hooks/useTheme";
import { DEFAULT_AVATAR_ID } from "./data/avatars";
import { saveAccountToDevice } from "./data/accountManager";
import { motion, AnimatePresence } from "motion/react";

const DEFAULT_STATS: UserStats = {
  totalExams: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  points: 0,
  categoryScores: {},
  history: []
};

export default function App() {
  const { themeMode, resolvedTheme, changeThemeMode } = useTheme();

  const [user, setUser] = useState<UserState>({
    username: "",
    avatarId: DEFAULT_AVATAR_ID,
    isLoggedIn: false,
    stats: DEFAULT_STATS
  });

  const [currentView, setCurrentView] = useState<"login" | "dashboard" | "exam" | "multiplayer" | "leaderboard">("login");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level>("basico");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [initialSalaCode, setInitialSalaCode] = useState<string | null>(null);
  const [initialRefCode, setInitialRefCode] = useState<string | null>(null);

  // Active exam exit confirmation states
  const [isExamActive, setIsExamActive] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingView, setPendingView] = useState<string | null>(null);

  // User position in server ranking
  const [userRank, setUserRank] = useState<number | null>(null);
  const [rankNotice, setRankNotice] = useState<RankChangeNotice | null>(null);

  const checkUserRank = async (username: string) => {
    if (!username) return;
    try {
      const res = await fetch("/api/ranking/list");
      if (!res.ok) return;
      const rankings = await res.json();
      if (!Array.isArray(rankings)) return;

      const userIdx = rankings.findIndex(
        (r: { username: string }) => r.username.toLowerCase() === username.toLowerCase()
      );

      if (userIdx !== -1) {
        const newRank = userIdx + 1;
        const storageKey = `minint_last_rank_${username.toLowerCase()}`;
        const storedRankRaw = localStorage.getItem(storageKey);

        if (storedRankRaw !== null) {
          const oldRank = parseInt(storedRankRaw, 10);
          if (!isNaN(oldRank) && oldRank !== newRank) {
            const delta = oldRank - newRank; // positive if newRank < oldRank (subiu)
            const direction: "up" | "down" = delta > 0 ? "up" : "down";
            setRankNotice({
              direction,
              delta: Math.abs(delta),
              oldRank,
              newRank
            });
          }
        }

        localStorage.setItem(storageKey, newRank.toString());
        setUserRank(newRank);
      }
    } catch {
      // Quiet catch
    }
  };

  // Periodic ranking check for active session
  useEffect(() => {
    if (!user.isLoggedIn || !user.username) return;

    checkUserRank(user.username);

    const interval = setInterval(() => {
      checkUserRank(user.username);
    }, 25000);

    return () => clearInterval(interval);
  }, [user.isLoggedIn, user.username]);

  // Load user session and check referral code on mount
  useEffect(() => {
    // 0. Process room parameter if present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const salaParam = urlParams.get("sala") || urlParams.get("room");
    let detectedSala: string | null = null;
    if (salaParam && salaParam.trim() !== "") {
      detectedSala = salaParam.trim().toUpperCase();
      setInitialSalaCode(detectedSala);
    }

    // 1. Process referral code if present in URL
    const refUser = urlParams.get("ref");
    let hasRefParam = false;
    if (refUser && refUser.trim() !== "") {
      const cleanRef = refUser.trim();
      setInitialRefCode(cleanRef);
      hasRefParam = true;
    }

    // 2. Restore active session (only if NOT accessed via referral link)
    const activeSession = localStorage.getItem("minint_active_session");
    if (activeSession && !hasRefParam) {
      const username = activeSession;
      const loadedStatsStr = localStorage.getItem(`minint_stats_${username}`);
      let stats: UserStats = loadedStatsStr ? JSON.parse(loadedStatsStr) : { ...DEFAULT_STATS };
      
      if (stats.totalExams === 0) {
        stats.points = 0;
        stats.correctAnswers = 0;
        stats.totalAnswers = 0;
      }

      const savedLevel = (localStorage.getItem(`minint_level_${username}`) as Level) || "basico";
      setSelectedLevel(savedLevel);

      const savedAvatar = localStorage.getItem(`minint_avatar_${username}`) || DEFAULT_AVATAR_ID;

      setUser({
        username,
        avatarId: savedAvatar,
        isLoggedIn: true,
        stats
      });
      
      if (detectedSala) {
        setCurrentView("multiplayer");
      } else {
        setCurrentView("dashboard");
      }

      // Sync active session user to real server rankings
      fetch("/api/ranking/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          score: stats.correctAnswers,
          total: stats.totalAnswers,
          pointsGained: 0,
          currentTotalPoints: stats.points
        })
      })
        .then(() => checkUserRank(username))
        .catch(() => {
          // Quiet catch for network/disconnect resilience
        });
    }
  }, []);

  const handleLogin = (username: string) => {
    localStorage.setItem("minint_active_session", username);
    
    const loadedStatsStr = localStorage.getItem(`minint_stats_${username}`);
    let stats: UserStats = loadedStatsStr ? JSON.parse(loadedStatsStr) : { ...DEFAULT_STATS };
    
    if (stats.totalExams === 0) {
      stats.points = 0;
      stats.correctAnswers = 0;
      stats.totalAnswers = 0;
    }

    const savedLevel = (localStorage.getItem(`minint_level_${username}`) as Level) || "basico";
    setSelectedLevel(savedLevel);
    
    const savedAvatar = localStorage.getItem(`minint_avatar_${username}`) || DEFAULT_AVATAR_ID;

    // Create/update stats in local
    localStorage.setItem(`minint_stats_${username}`, JSON.stringify(stats));

    setUser({
      username,
      avatarId: savedAvatar,
      isLoggedIn: true,
      stats
    });
    
    if (initialSalaCode) {
      setCurrentView("multiplayer");
    } else {
      setCurrentView("dashboard");
    }

    // Save/update this account in the remembered list
    saveAccountToDevice(username);

    // Proactively submit score to sync this player on server rankings
    fetch("/api/ranking/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        score: stats.correctAnswers,
        total: stats.totalAnswers,
        pointsGained: 0,
        currentTotalPoints: stats.points
      })
    })
      .then(() => checkUserRank(username))
      .catch(() => {
        // Quiet catch for network/disconnect resilience
      });
  };

  const performLogout = () => {
    localStorage.removeItem("minint_active_session");
    setUser({
      username: "",
      avatarId: DEFAULT_AVATAR_ID,
      isLoggedIn: false,
      stats: DEFAULT_STATS
    });
    setIsExamActive(false);
    setCurrentView("login");
  };

  const handleLogout = () => {
    if (currentView === "exam" && isExamActive) {
      setPendingView("logout");
      setShowExitConfirm(true);
    } else {
      performLogout();
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setUser(prev => ({ ...prev, avatarId }));
    if (user.username) {
      localStorage.setItem(`minint_avatar_${user.username}`, avatarId);
      saveAccountToDevice(user.username);
    }
  };

  const handleLevelChange = (level: Level) => {
    setSelectedLevel(level);
    if (user.username) {
      localStorage.setItem(`minint_level_${user.username}`, level);
    }
  };

  const handleStartExam = (category: string | null, level?: Level) => {
    setSelectedCategory(category);
    if (level) {
      handleLevelChange(level);
    }
    setIsExamActive(true);
    setCurrentView("exam");
  };

  const handleFinishExam = async (score: number, total: number, category: string, level?: Level) => {
    setIsExamActive(false);

    // Points calculation: 10 pts per correct answer (+10 bonus if full score)
    const basePoints = score * 10;
    const bonus = score === total && total > 0 ? 10 : 0;
    const pointsGained = basePoints + bonus;

    const newPoints = user.stats.points + pointsGained;
    const newTotalExams = user.stats.totalExams + 1;
    const newCorrectAnswers = user.stats.correctAnswers + score;
    const newTotalAnswers = user.stats.totalAnswers + total;

    // Category breakdown updates
    const currentCatStats = user.stats.categoryScores[category] || { correct: 0, total: 0 };
    const newCatStats = {
      correct: currentCatStats.correct + score,
      total: currentCatStats.total + total
    };

    // History log
    const newAttempt = {
      id: `attempt_${Date.now()}`,
      date: new Date().toLocaleDateString("pt-AO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      materia: category,
      nivel: level || selectedLevel
    };

    const updatedStats: UserStats = {
      totalExams: newTotalExams,
      correctAnswers: newCorrectAnswers,
      totalAnswers: newTotalAnswers,
      points: newPoints,
      categoryScores: {
        ...user.stats.categoryScores,
        [category]: newCatStats
      },
      history: [...user.stats.history, newAttempt]
    };

    // Save state
    setUser(prev => ({
      ...prev,
      stats: updatedStats
    }));

    if (user.username) {
      localStorage.setItem(`minint_stats_${user.username}`, JSON.stringify(updatedStats));
    }

    // Submit to server ranking API
    try {
      await fetch("/api/ranking/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          score,
          total,
          pointsGained
        })
      });
      if (user.username) {
        await checkUserRank(user.username);
      }
    } catch (err) {
      console.error("Failed submitting scoring statistics to ranking server:", err);
    }
  };

  const handleNavigateBack = () => {
    if (currentView === "exam" && isExamActive) {
      setPendingView("dashboard");
      setShowExitConfirm(true);
    } else {
      setCurrentView("dashboard");
      setSelectedCategory(null);
    }
  };

  const handleNavigateToView = (view: string) => {
    if (currentView === "exam" && isExamActive && view !== "exam") {
      setPendingView(view);
      setShowExitConfirm(true);
    } else {
      setCurrentView(view as any);
    }
  };

  const handleConfirmExitExam = () => {
    setIsExamActive(false);
    setShowExitConfirm(false);

    if (pendingView === "logout") {
      performLogout();
    } else {
      const target = pendingView || "dashboard";
      setCurrentView(target as any);
      setSelectedCategory(null);
    }
    setPendingView(null);
  };

  const handleCancelExitExam = () => {
    setShowExitConfirm(false);
    setPendingView(null);
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            username={user.username}
            avatarId={user.avatarId}
            stats={user.stats}
            selectedLevel={selectedLevel}
            onLevelChange={handleLevelChange}
            onStartExam={handleStartExam}
            onNavigateToView={handleNavigateToView}
            onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          />
        );
      case "exam":
        return (
          <ExamEngine
            username={user.username}
            category={selectedCategory}
            level={selectedLevel}
            onFinishExam={handleFinishExam}
            onNavigateBack={handleNavigateBack}
          />
        );
      case "multiplayer":
        return (
          <MultiplayerLobby
            username={user.username}
            initialRoomCode={initialSalaCode || undefined}
            onNavigateBack={handleNavigateBack}
          />
        );
      case "leaderboard":
        return (
          <Leaderboard
            username={user.username}
          />
        );
      default:
        return (
          <Dashboard
            username={user.username}
            avatarId={user.avatarId}
            stats={user.stats}
            selectedLevel={selectedLevel}
            onLevelChange={handleLevelChange}
            onStartExam={handleStartExam}
            onNavigateToView={handleNavigateToView}
            onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          />
        );
    }
  };

  if (!user.isLoggedIn || currentView === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        initialSalaCode={initialSalaCode}
        initialRefCode={initialRefCode}
        themeMode={themeMode}
        resolvedTheme={resolvedTheme}
        onThemeChange={changeThemeMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sleek-bg text-slate-200 flex flex-col font-sans transition-colors duration-200">
      {/* Universal navigation head */}
      <Navbar
        username={user.username}
        avatarId={user.avatarId}
        currentView={currentView}
        userRank={userRank}
        rankNotice={rankNotice}
        onDismissRankNotice={() => setRankNotice(null)}
        themeMode={themeMode}
        resolvedTheme={resolvedTheme}
        onThemeChange={changeThemeMode}
        onNavigateBack={handleNavigateBack}
        onLogout={handleLogout}
        onNavigateToView={handleNavigateToView}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
      />

      {/* Primary view-port wrapper with fade entry animation */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Exit Exam Confirmation Modal */}
      <ExitExamConfirmModal
        isOpen={showExitConfirm}
        onCancel={handleCancelExitExam}
        onConfirmExit={handleConfirmExitExam}
      />

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        currentAvatarId={user.avatarId || DEFAULT_AVATAR_ID}
        onSelectAvatar={handleAvatarSelect}
        onClose={() => setIsAvatarModalOpen(false)}
      />

      {/* Application Footer */}
      <Footer />

      {/* Floating Scroll To Top Button */}
      <ScrollToTop />
    </div>
  );
}
