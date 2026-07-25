import React, { useState } from "react";
import { UserPlus, Share2, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InviteButtonProps {
  username: string;
  variant?: "primary" | "secondary" | "gold" | "compact";
  className?: string;
  onInvite?: () => void;
}

export default function InviteButton({
  username,
  variant = "gold",
  className = "",
  onInvite
}: InviteButtonProps) {
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleShare = async () => {
    if (onInvite) onInvite();

    const cleanUsername = username || "Candidato";
    const inviteUrl = `https://simulados-minint.vercel.app/?ref=${encodeURIComponent(cleanUsername)}`;
    
    const shareText = `Vem treinar para o Concurso do MININT comigo no Simulados MININT! Prepara-te para a PNA, SPN, SME e SIC:`;

    const shareData = {
      title: "Simulados MININT Angola",
      text: shareText,
      url: inviteUrl
    };

    // Try native Web Share API
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setCopied(true);
        setFeedbackMsg("Link partilhado!");
        setTimeout(() => setCopied(false), 3500);
        return;
      } catch (err: any) {
        if (err.name === "AbortError") {
          // User closed native share dialog, no action required
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText} ${inviteUrl}`);
      setCopied(true);
      setFeedbackMsg("Link copiado!");
      setTimeout(() => setCopied(false), 3500);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = `${shareText} ${inviteUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setFeedbackMsg("Link copiado!");
        setTimeout(() => setCopied(false), 3500);
      } catch (e) {
        console.error("Erro ao copiar:", e);
      }
      document.body.removeChild(textArea);
    }
  };

  let baseStyle = "";
  if (variant === "gold") {
    baseStyle = "btn-invite-gold";
  } else if (variant === "primary") {
    baseStyle = "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white shadow-lg shadow-blue-950/30 font-bold";
  } else if (variant === "secondary") {
    baseStyle = "bg-sleek-card-sec hover:bg-sleek-card-hover border border-slate-800 hover:border-amber-500/40 text-slate-200 font-semibold";
  } else if (variant === "compact") {
    baseStyle = "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold";
  }

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handleShare}
        className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 ${baseStyle} ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="font-extrabold">{feedbackMsg}</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span className="font-extrabold">Convidar Amigos (+5 Pontos)</span>
            <Sparkles className="w-3.5 h-3.5 animate-pulse opacity-90" />
          </>
        )}
      </motion.button>

      {/* Floating toast notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-xl pointer-events-none flex items-center gap-1.5 z-20"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{feedbackMsg} +5 pts por amigo!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
