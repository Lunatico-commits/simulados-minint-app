import { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ExamEngine from "./components/ExamEngine";
import MultiplayerLobby from "./components/MultiplayerLobby";
import Leaderboard from "./components/Leaderboard";
import Footer from "./components/Footer";
import AvatarSelectionModal from "./components/AvatarSelectionModal";
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

  // Load user session and check referral code on mount
  useEffect(() => {
    // 1. Process referral code if present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refUser = urlParams.get("ref");
    if (refUser && refUser.trim() !== "") {
      const cleanRef = refUser.trim();
      const claimKey = `minint_ref_claimed_${cleanRef.toLowerCase()}`;
      const alreadyClaimed = localStorage.getItem(claimKey);

      if (!alreadyClaimed) {
        fetch("/api/invite/reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referrer: cleanRef })
        })
          .then((res) => res.json())
          .then(() => {
            localStorage.setItem(claimKey, "true");
            // If the referrer exists locally on this device, add 5 points to their local stats
            const refStatsRaw = localStorage.getItem(`minint_stats_${cleanRef}`);
            if (refStatsRaw) {
              const parsed = JSON.parse(refStatsRaw);
              parsed.points = (parsed.points || 0) + 5;
              localStorage.setItem(`minint_stats_${cleanRef}`, JSON.stringify(parsed));
              saveAccountToDevice(cleanRef);
            }
          })
          .catch((err) => console.error("Erro ao processar código de convite:", err));
      }
    }

    // 2. Restore active session
    const activeSession = localStorage.getItem("minint_active_session");
    if (activeSession) {
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
      setCurrentView("dashboard");

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
      }).catch(err => console.error("Error syncing rank on session load:", err));
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
    setCurrentView("dashboard");

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
    }).catch(err => console.error("Could not sync candidate rank on login:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("minint_active_session");
    setUser({
      username: "",
      avatarId: DEFAULT_AVATAR_ID,
      isLoggedIn: false,
      stats: DEFAULT_STATS
    });
    setCurrentView("login");
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
    setCurrentView("exam");
  };

  const handleFinishExam = async (score: number, total: number, category: string, level?: Level) => {
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
    } catch (err) {
      console.error("Failed submitting scoring statistics to ranking server:", err);
    }
  };

  const handleNavigateBack = () => {
    setCurrentView("dashboard");
    setSelectedCategory(null);
  };

  const handleNavigateToView = (view: string) => {
    setCurrentView(view as any);
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

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        currentAvatarId={user.avatarId || DEFAULT_AVATAR_ID}
        onSelectAvatar={handleAvatarSelect}
        onClose={() => setIsAvatarModalOpen(false)}
      />

      {/* Application Footer */}
      <Footer />
    </div>
  );
}
