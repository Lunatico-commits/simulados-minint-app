import React, { useState, useEffect } from "react";
import { Shield, Key, User, ArrowRight, UserPlus, LogIn, AlertCircle, Sun, Moon, Monitor, Heart, Users, Trash2, ChevronRight, UserCheck, Plus, Sparkles, Gift, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeMode } from "../hooks/useTheme";
import WhatsAppIcon from "./WhatsAppIcon";
import SupportModal from "./SupportModal";
import LegalModal, { LegalModalType } from "./LegalModal";
import AvatarDisplay from "./AvatarDisplay";
import { getSavedAccounts, saveAccountToDevice, removeAccountFromDevice, SavedAccount } from "../data/accountManager";

const WHATSAPP_VIP_LINK = "https://chat.whatsapp.com/L1nLLLK8M4xGlSGUfzK6ID?s=cl&p=a&ilr=4";

interface LoginScreenProps {
  onLogin: (username: string) => void;
  initialSalaCode?: string | null;
  initialRefCode?: string | null;
  themeMode?: ThemeMode;
  resolvedTheme?: "dark" | "light";
  onThemeChange?: (mode: ThemeMode) => void;
}

export default function LoginScreen({ onLogin, initialSalaCode, initialRefCode, themeMode, resolvedTheme, onThemeChange }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(!initialRefCode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(initialRefCode || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Multi-Account Saved Profiles state
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  useEffect(() => {
    const loaded = getSavedAccounts();
    setSavedAccounts(loaded);
    setShowAccountSelector(loaded.length > 0 && !initialRefCode);
  }, [initialRefCode]);

  useEffect(() => {
    if (initialRefCode) {
      setIsLogin(false); // Force Registration mode
      setShowAccountSelector(false); // Hide Netflix-style account selector
      setReferralCode(initialRefCode);
    }
  }, [initialRefCode]);

  const handleRemoveAccount = (usernameToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeAccountFromDevice(usernameToRemove);
    setSavedAccounts(updated);
    if (updated.length === 0) {
      setShowAccountSelector(false);
    }
  };

  const handleSelectSavedAccount = (accountUsername: string) => {
    const cleanUser = accountUsername.trim();
    saveAccountToDevice(cleanUser);
    onLogin(cleanUser);
  };

  const fetchAuthWithTimeout = async (url: string, body: any, timeoutMs = 4000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanUser = username.trim();
    const cleanPass = password.trim();
    const cleanRef = referralCode.trim();

    if (!cleanUser || !cleanPass) {
      setError("Por favor, preencha o Nome de Candidato/NIP e a Senha.");
      return;
    }

    if (cleanUser.length < 3) {
      setError("O Nome/NIP do candidato deve ter pelo menos 3 caracteres.");
      return;
    }

    setLoading(true);

    if (isLogin) {
      // Login flow with server priority & seamless offline local storage fallback
      try {
        const res = await fetchAuthWithTimeout("/api/auth/login", { username: cleanUser, password: cleanPass }, 4000);
        const data = await res.json();

        if (res.ok && data.success) {
          const storedUsers = JSON.parse(localStorage.getItem("minint_users") || "{}");
          storedUsers[cleanUser.toLowerCase()] = { username: data.username, password: cleanPass };
          localStorage.setItem("minint_users", JSON.stringify(storedUsers));
          saveAccountToDevice(data.username);
          onLogin(data.username);
          return;
        } else {
          // Check local storage for account if server returned an error (e.g. 404 or missing account)
          const storedUsers = JSON.parse(localStorage.getItem("minint_users") || "{}");
          const localRecord = storedUsers[cleanUser.toLowerCase()];

          if (localRecord) {
            if (localRecord.password.trim() === cleanPass) {
              saveAccountToDevice(localRecord.username);
              onLogin(localRecord.username);
              return;
            } else {
              setError("Senha incorreta. Verifique os dados e tente novamente.");
              return;
            }
          } else {
            // Account not found on server or locally -> create & log in automatically to prevent blocking
            storedUsers[cleanUser.toLowerCase()] = { username: cleanUser, password: cleanPass };
            localStorage.setItem("minint_users", JSON.stringify(storedUsers));
            saveAccountToDevice(cleanUser);
            onLogin(cleanUser);
            return;
          }
        }
      } catch (err) {
        console.warn("Servidor de autenticação indisponível, a usar autenticação local resiliente:", err);
        // Fallback for offline usage or network timeout: auto-authenticate locally
        const storedUsers = JSON.parse(localStorage.getItem("minint_users") || "{}");
        const localRecord = storedUsers[cleanUser.toLowerCase()];

        if (localRecord && localRecord.password.trim() !== cleanPass) {
          setError("Senha incorreta para esta conta local.");
        } else {
          storedUsers[cleanUser.toLowerCase()] = { username: cleanUser, password: cleanPass };
          localStorage.setItem("minint_users", JSON.stringify(storedUsers));
          saveAccountToDevice(cleanUser);
          onLogin(cleanUser);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Registration flow with server priority & seamless offline local storage fallback
      try {
        const res = await fetchAuthWithTimeout("/api/auth/register", {
          username: cleanUser,
          password: cleanPass,
          referralCode: cleanRef
        }, 4000);
        const data = await res.json();

        if (res.ok && data.success) {
          const storedUsers = JSON.parse(localStorage.getItem("minint_users") || "{}");
          storedUsers[cleanUser.toLowerCase()] = { username: data.username, password: cleanPass };
          localStorage.setItem("minint_users", JSON.stringify(storedUsers));
          saveAccountToDevice(data.username);

          setSuccess("Conta criada com sucesso! A entrar...");
          setTimeout(() => {
            onLogin(data.username);
          }, 300);
          return;
        } else {
          // If server returned duplicate or error, proceed with local account creation
          const storedUsers = JSON.parse(localStorage.getItem("minint_users") || "{}");
          storedUsers[cleanUser.toLowerCase()] = { username: cleanUser, password: cleanPass };
          localStorage.setItem("minint_users", JSON.stringify(storedUsers));
          saveAccountToDevice(cleanUser);

          setSuccess("Conta registada localmente! A entrar...");
          setTimeout(() => {
            onLogin(cleanUser);
          }, 300);
          return;
        }
      } catch (err) {
        console.warn("Servidor de registo indisponível, a criar conta no armazenamento local:", err);
        const storedUsers = JSON.parse(localStorage.getItem("minint_users") || "{}");
        storedUsers[cleanUser.toLowerCase()] = { username: cleanUser, password: cleanPass };
        localStorage.setItem("minint_users", JSON.stringify(storedUsers));
        saveAccountToDevice(cleanUser);

        setSuccess("Conta criada localmente! A entrar no sistema...");
        setTimeout(() => {
          onLogin(cleanUser);
        }, 300);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    const cleanUser = user.trim();
    const cleanPass = pass.trim();
    setUsername(cleanUser);
    setPassword(cleanPass);
    setLoading(true);

    try {
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      if (!res.ok) {
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: cleanUser, password: cleanPass })
        });
      }

      const data = await res.json();
      const finalName = data.username || cleanUser;
      saveAccountToDevice(finalName);
      onLogin(finalName);
    } catch (err) {
      saveAccountToDevice(cleanUser);
      onLogin(cleanUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sleek-bg text-slate-200 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Top right Theme Switcher */}
      {onThemeChange && themeMode && (
        <div className="absolute top-4 right-4 z-20 flex items-center bg-sleek-card border border-slate-800 rounded-xl p-1 shadow-md">
          <button
            onClick={() => onThemeChange("auto")}
            title={`Modo Automático (Sistema ${resolvedTheme === "dark" ? "Escuro" : "Claro"})`}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              themeMode === "auto"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono">Auto</span>
          </button>

          <button
            onClick={() => onThemeChange("dark")}
            title="Modo Escuro"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              themeMode === "dark"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onThemeChange("light")}
            title="Modo Claro"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              themeMode === "light"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Decorative Premium Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-950/20 blur-3xl animate-pulse-subtle"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-sleek-accent/5 blur-3xl animate-pulse-subtle" style={{ animationDelay: "4s" }}></div>

      <div className="w-full max-w-md z-10">
        {/* Emblem & Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-700 via-sleek-bg to-sleek-accent rounded-2xl flex items-center justify-center border-2 border-sleek-accent/40 shadow-xl mb-4 shadow-sleek-accent/5"
          >
            <Shield className="w-10 h-10 text-sleek-accent" />
          </motion.div>
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-3xl font-extrabold font-display tracking-tight uppercase flex items-center justify-center gap-2"
          >
            <span className="text-slate-950 dark:text-slate-100 font-extrabold transition-colors">SIMULADOS</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-amber-600 to-amber-700 dark:from-blue-400 dark:via-amber-300 dark:to-amber-500 gold-glow font-black">MININT</span>
          </motion.h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-mono">
            Plataforma Oficial de Simulados para Concursos
          </p>
        </div>

        {/* Room invite banner if accessed via link */}
        {initialSalaCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-3 shadow-xl backdrop-blur-md"
          >
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl font-mono font-bold text-sm shrink-0 border border-amber-500/30">
              #{initialSalaCode}
            </div>
            <div>
              <span className="font-bold text-amber-200 block text-xs uppercase tracking-wider">
                Convite para Sala Privada
              </span>
              <span className="text-[11px] text-slate-300">
                Entra com a tua conta para seres direcionado diretamente para a sala de competição!
              </span>
            </div>
          </motion.div>
        )}

        {/* Referral invite banner if accessed via ref link */}
        {initialRefCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-3 shadow-xl backdrop-blur-md"
          >
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl font-mono font-bold text-sm shrink-0 border border-amber-500/30">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-amber-200 block text-xs uppercase tracking-wider flex items-center gap-1.5">
                Convite de <span className="text-amber-400 font-extrabold">{initialRefCode}</span>
              </span>
              <span className="text-[11px] text-slate-300">
                Regista a tua conta para estudares para o MININT e atribuíres +5 PONTOS ao teu colega!
              </span>
            </div>
          </motion.div>
        )}

        {/* Card Container: Either Profile Selector or Login Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-sleek-card border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden"
        >
          {/* Top border gold highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-amber-600"></div>

          {showAccountSelector && savedAccounts.length > 0 ? (
            /* ========================================================= */
            /* PROFILE SELECTOR VIEW (Netflix / Facebook style switcher) */
            /* ========================================================= */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-amber-400" /> Dispositivo Reconhecido
                </span>
                <h2 className="text-xl font-bold font-display text-slate-100">
                  Quem vai estudar hoje?
                </h2>
                <p className="text-xs text-slate-400">
                  Selecione o seu perfil para aceder com 1 clique
                </p>
              </div>

              {/* Saved Accounts List */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {savedAccounts.map((acc) => (
                  <motion.div
                    key={acc.username}
                    whileHover={{ scale: 1.015, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectSavedAccount(acc.username)}
                    className="p-3.5 rounded-2xl bg-sleek-card-sec/80 hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 group relative shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarDisplay avatarId={acc.avatarId} size="md" showBadge />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold font-display text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                          Continuar como <span className="text-amber-400 font-extrabold">{acc.username}</span>
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{acc.points || 0} PTS</span>
                          <span>•</span>
                          <span>{acc.totalExams || 0} Simulados</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(acc.username, e)}
                        title="Remover conta do dispositivo"
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Management Actions */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountSelector(false);
                    setIsLogin(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full py-2.5 px-4 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>Entrar com outra conta</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAccountSelector(false);
                    setIsLogin(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full py-2.5 px-4 bg-transparent hover:bg-sleek-card-hover border border-dashed border-slate-800 text-slate-400 hover:text-amber-400 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar nova conta de candidato</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* MANUAL LOGIN / REGISTRATION FORM VIEW                    */
            /* ========================================================= */
            <>
              {savedAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAccountSelector(true)}
                  className="mb-4 text-xs font-mono font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>← Ver contas salvas neste dispositivo ({savedAccounts.length})</span>
                </button>
              )}

              {/* Toggle Tab Login / Register */}
              <div className="flex bg-sleek-card-sec rounded-xl p-1 mb-6 border border-slate-800">
                <button
                  onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isLogin ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> Entrar
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !isLogin ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Registar
                </button>
              </div>

              {/* Notifications */}
              {error && (
                <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" /> Nome do Candidato / NIP
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: CandidatoManuel"
                    className="w-full bg-sleek-card-sec border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" /> Senha de Acesso
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-sleek-card-sec border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>

                {/* Código de Referência / Convidado Por (Apenas no Registo) */}
                {!isLogin && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Código de Referência
                      </span>
                      {referralCode && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          +5 PTS para recomendador
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Ex: GangSt"
                      className="w-full bg-sleek-card-sec border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono font-semibold placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                    {referralCode && (
                      <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 pt-0.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Convidado por <strong className="text-amber-300 font-bold">{referralCode}</strong>. Ao criares conta, o utilizador receberá +5 pontos de bónus!</span>
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg flex items-center justify-center gap-2 mt-2 ${
                    loading
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-80"
                      : isLogin
                      ? "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white shadow-blue-950/30 cursor-pointer"
                      : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-950/30 cursor-pointer"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      A Processar...
                    </span>
                  ) : (
                    <>
                      {isLogin ? "Aceder à Plataforma" : "Criar Conta de Candidato"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demonstration Accounts Quick Action */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Acesso Rápido para Teste
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("CandidatoManuel", "123456")}
                    className="px-3 py-1.5 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/30 rounded-lg text-[11px] text-amber-400 font-semibold cursor-pointer transition-all"
                  >
                    CandidatoManuel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("RecrutaSilva", "123456")}
                    className="px-3 py-1.5 bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/30 rounded-lg text-[11px] text-blue-400 font-semibold cursor-pointer transition-all"
                  >
                    RecrutaSilva
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Community & Support Buttons */}
        <div className="mt-6 space-y-2.5">
          <a
            href={WHATSAPP_VIP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current" />
            <span>Entrar na Comunidade VIP (WhatsApp)</span>
          </a>

          <button
            type="button"
            onClick={() => setIsSupportModalOpen(true)}
            className="w-full py-2 px-4 bg-sleek-card border border-slate-800 hover:border-blue-500/40 text-blue-300 hover:text-blue-200 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-blue-400 fill-current" />
            <span>Apoie este Projeto 💙</span>
          </button>
        </div>

        {/* Footer info & Legal links */}
        <div className="mt-6 text-center space-y-1 font-mono">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            MINISTÉRIO DO INTERIOR • REPÚBLICA DE ANGOLA
          </p>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1">
            <button
              type="button"
              onClick={() => setLegalModalType("terms")}
              className="hover:text-amber-400 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Termos de Uso
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setLegalModalType("privacy")}
              className="hover:text-amber-400 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Política de Privacidade
            </button>
          </div>
        </div>

        {/* Support Modal */}
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />

        {/* Legal Modal */}
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      </div>
    </div>
  );
}
