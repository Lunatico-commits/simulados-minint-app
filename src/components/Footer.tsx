import { useState } from "react";
import { Heart, Shield } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import SupportModal from "./SupportModal";
import LegalModal, { LegalModalType } from "./LegalModal";

export default function Footer() {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  const WHATSAPP_LINK = "https://chat.whatsapp.com/L1nLLLK8M4xGlSGUfzK6ID?s=cl&p=a&ilr=4";

  return (
    <footer className="mt-auto border-t border-slate-800 bg-sleek-card/95 backdrop-blur-md text-slate-400 py-6 px-4 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        
        {/* Brand, Rights & Legal Links */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold font-display text-slate-200">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Simulados MININT Angola</span>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            Plataforma Autónoma de Simulados • REPÚBLICA DE ANGOLA • MININT © 2026
          </p>

          {/* Discrete Legal Links */}
          <div className="flex items-center justify-center md:justify-start gap-3 text-[11px] font-mono text-slate-400 pt-1">
            <button
              onClick={() => setLegalModalType("terms")}
              className="hover:text-amber-400 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Termos de Uso
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setLegalModalType("privacy")}
              className="hover:text-amber-400 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Política de Privacidade
            </button>
          </div>
        </div>

        {/* Action Buttons: VIP WhatsApp Community & Support Project */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* WhatsApp VIP Community Button */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>Entrar na Comunidade VIP (WhatsApp)</span>
          </a>

          {/* Apoie este Projeto Button */}
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-slate-100 text-xs font-bold uppercase tracking-wider rounded-xl border border-blue-400/30 transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Heart className="w-4 h-4 text-blue-300 fill-current group-hover:scale-110 transition-transform" />
            <span>Apoie este Projeto 💙</span>
          </button>
        </div>

      </div>

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Legal Information Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </footer>
  );
}
