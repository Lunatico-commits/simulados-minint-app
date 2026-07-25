import React from "react";
import { Shield, GraduationCap, Flame, Search, Globe, Crown, Compass, Star, UserCheck } from "lucide-react";
import { getAvatarById, AvatarItem } from "../data/avatars";

interface AvatarDisplayProps {
  avatarId: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

interface AgencyShieldIconProps {
  agency: string;
  size: "xs" | "sm" | "md" | "lg" | "xl";
}

function AgencyShieldIcon({ agency, size }: AgencyShieldIconProps) {
  // Agency specific colors for shield stroke, fill gradient, text & glow
  const agencyConfig: Record<string, { stroke: string; gradStart: string; gradEnd: string; text: string; glow: string }> = {
    SPN: {
      stroke: "#c084fc", // purple-400
      gradStart: "#7e22ce", // purple-700
      gradEnd: "#3b0764", // purple-950
      text: "#f3e8ff",
      glow: "rgba(192, 132, 252, 0.5)",
    },
    PNA: {
      stroke: "#60a5fa", // blue-400
      gradStart: "#1d4ed8",
      gradEnd: "#1e3a8a",
      text: "#dbeafe",
      glow: "rgba(96, 165, 250, 0.5)",
    },
    SME: {
      stroke: "#34d399", // emerald-400
      gradStart: "#047857",
      gradEnd: "#064e3b",
      text: "#d1fae5",
      glow: "rgba(52, 211, 153, 0.5)",
    },
    SIC: {
      stroke: "#22d3ee", // cyan-400
      gradStart: "#0e7490",
      gradEnd: "#164e63",
      text: "#cffafe",
      glow: "rgba(34, 211, 238, 0.5)",
    },
    SPCB: {
      stroke: "#fbbf24", // amber-400
      gradStart: "#c2410c",
      gradEnd: "#7c2d12",
      text: "#fef3c7",
      glow: "rgba(251, 191, 36, 0.5)",
    },
  };

  const config = agencyConfig[agency] || agencyConfig.SPN;

  // SVG dimensions according to component size
  const svgSizes = {
    xs: { width: 22, height: 26 },
    sm: { width: 28, height: 32 },
    md: { width: 38, height: 44 },
    lg: { width: 52, height: 60 },
    xl: { width: 76, height: 88 },
  };

  const dim = svgSizes[size] || svgSizes.md;

  const renderAgencyContent = () => {
    switch (agency) {
      case "SIC":
        // HEXAGONAL TACTICAL SHIELD + LUPA / MAGNIFYING GLASS + INTEL CROSSHAIR
        return (
          <>
            {/* Hexagonal Outer Badge */}
            <path
              d="M 50 5 L 92 28 L 92 75 L 50 108 L 8 75 L 8 28 Z"
              fill={`url(#grad-${agency})`}
              stroke={config.stroke}
              strokeWidth="4.5"
            />
            <path
              d="M 50 12 L 85 31 L 85 71 L 50 100 L 15 71 L 15 31 Z"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Magnifying Glass (Lupa de Investigação) */}
            <circle
              cx="43"
              cy="38"
              r="14"
              stroke="#22d3ee"
              strokeWidth="4"
              fill="rgba(34,211,238,0.2)"
            />
            <line
              x1="53"
              y1="48"
              x2="68"
              y2="63"
              stroke="#22d3ee"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Crosshair Target Reticle */}
            <path
              d="M 43 28 V 48 M 33 38 H 53"
              stroke="#67e8f9"
              strokeWidth="1.8"
              opacity="0.9"
            />
            {/* Acronym Text */}
            <text
              x="50"
              y="85"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              fontSize="32"
              letterSpacing="0.5px"
              fill={config.text}
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.95))" }}
            >
              SIC
            </text>
          </>
        );

      case "SME":
        // CIRCULAR COMPASS / INTERNATIONAL BORDER SHIELD + TERRESTRIAL GLOBE
        return (
          <>
            {/* Circular Border Badge */}
            <path
              d="M 50 6 A 46 46 0 1 0 50 98 A 46 46 0 1 0 50 6 Z"
              fill={`url(#grad-${agency})`}
              stroke={config.stroke}
              strokeWidth="4.5"
            />
            <circle
              cx="50"
              cy="52"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Globe (Globo Terrestre de Fronteiras) */}
            <circle
              cx="50"
              cy="38"
              r="21"
              stroke="#34d399"
              strokeWidth="3"
              fill="rgba(52,211,153,0.18)"
            />
            <line x1="29" y1="38" x2="71" y2="38" stroke="#34d399" strokeWidth="2.5" />
            <ellipse
              cx="50"
              cy="38"
              rx="12"
              ry="21"
              stroke="#34d399"
              strokeWidth="2"
              fill="none"
            />
            {/* Acronym Text */}
            <text
              x="50"
              y="80"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              fontSize="31"
              letterSpacing="0.5px"
              fill={config.text}
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.95))" }}
            >
              SME
            </text>
          </>
        );

      case "SPCB":
        // FIREFIGHTER CREST SHIELD + DYNAMIC FIRE FLAME
        return (
          <>
            {/* Firefighter Scalloped Crest Badge */}
            <path
              d="M 50 5 C 68 5, 88 12, 93 35 C 93 68, 73 95, 50 108 C 27 95, 7 68, 7 35 C 12 12, 32 5, 50 5 Z"
              fill={`url(#grad-${agency})`}
              stroke={config.stroke}
              strokeWidth="4.5"
            />
            <path
              d="M 50 12 C 64 12, 81 18, 85 36 C 85 62, 68 87, 50 98 C 32 87, 15 62, 15 36 C 19 18, 36 12, 50 12 Z"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Flame (Chama de Fogo do SPCB) */}
            <path
              d="M 50 18 C 50 18 64 30 64 43 C 64 53 58 60 50 60 C 42 60 36 53 36 43 C 36 35 42 28 46 23 C 44 29 48 32 50 32 C 52 32 55 28 55 25 C 55 22 50 18 50 18 Z"
              fill="#fbbf24"
              stroke="#f97316"
              strokeWidth="2"
            />
            <path
              d="M 50 32 C 50 32 56 39 56 46 C 56 50 53 54 50 54 C 47 54 44 50 44 46 C 44 41 48 37 50 32 Z"
              fill="#ef4444"
            />
            {/* Acronym Text */}
            <text
              x="50"
              y="82"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              fontSize="27"
              letterSpacing="0.5px"
              fill={config.text}
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.95))" }}
            >
              SPCB
            </text>
          </>
        );

      case "SPN":
        // FORTIFIED ARCH PRISON SHIELD + PRISON BARS & SAFETY PADLOCK
        return (
          <>
            {/* Fortified Prison Wall Arch Badge */}
            <path
              d="M 12 25 L 20 10 L 35 10 L 35 18 L 50 8 L 65 18 L 65 10 L 80 10 L 88 25 C 88 65, 72 95, 50 110 C 28 95, 12 65, 12 25 Z"
              fill={`url(#grad-${agency})`}
              stroke={config.stroke}
              strokeWidth="4.5"
            />
            <path
              d="M 18 28 C 18 61, 33 87, 50 99 C 67 87, 82 61, 82 28 Z"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Prison Bars (Grade Prisional de Segurança) */}
            <line x1="36" y1="26" x2="36" y2="52" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="26" x2="50" y2="52" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
            <line x1="64" y1="26" x2="64" y2="52" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
            <line x1="28" y1="39" x2="72" y2="39" stroke="#e9d5ff" strokeWidth="3" />
            {/* Padlock (Cadeado de Segurança Prisional) */}
            <rect x="42" y="44" width="16" height="14" rx="3" fill="#a855f7" stroke="#f3e8ff" strokeWidth="2" />
            <path d="M 45 44 V 39 C 45 36 55 36 55 39 V 44" stroke="#f3e8ff" strokeWidth="2" fill="none" />
            {/* Acronym Text */}
            <text
              x="50"
              y="83"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              fontSize="31"
              letterSpacing="0.5px"
              fill={config.text}
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.95))" }}
            >
              SPN
            </text>
          </>
        );

      case "PNA":
      default:
        // CLASSIC POLICE METALLIC SHIELD + GOLD POLICE STAR
        return (
          <>
            {/* Classic Police Shield */}
            <path
              d="M 50 5 C 78 5, 93 16, 93 42 C 93 78, 67 104, 50 112 C 33 104, 7 78, 7 42 C 7 16, 22 5, 50 5 Z"
              fill={`url(#grad-${agency})`}
              stroke={config.stroke}
              strokeWidth="4.5"
            />
            <path
              d="M 50 11 C 73 11, 86 21, 86 42 C 86 73, 63 97, 50 104 C 37 97, 14 73, 14 42 C 14 21, 27 11, 50 11 Z"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Gold Police Emblem Star */}
            <polygon
              points="50,22 54,34 66,34 56,42 60,54 50,46 40,54 44,42 34,34 46,34"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            {/* Acronym Text */}
            <text
              x="50"
              y="78"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              fontSize="31"
              letterSpacing="0.5px"
              fill={config.text}
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.95))" }}
            >
              PNA
            </text>
          </>
        );
    }
  };

  return (
    <svg
      width={dim.width}
      height={dim.height}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md select-none"
    >
      <defs>
        <linearGradient id={`grad-${agency}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.gradStart} stopOpacity="0.95" />
          <stop offset="100%" stopColor={config.gradEnd} stopOpacity="0.98" />
        </linearGradient>
      </defs>

      {renderAgencyContent()}
    </svg>
  );
}

export default function AvatarDisplay({
  avatarId,
  size = "md",
  className = "",
  showBadge = false,
}: AvatarDisplayProps) {
  const avatar: AvatarItem = getAvatarById(avatarId);

  // Size mapping
  const sizeClasses = {
    xs: "w-7 h-7 text-xs border",
    sm: "w-9 h-9 text-xs border",
    md: "w-12 h-12 text-sm border-2",
    lg: "w-16 h-16 text-base border-2",
    xl: "w-24 h-24 text-xl border-2",
  };

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const badgeTextSizes = {
    xs: "text-[8px] px-1 py-0",
    sm: "text-[9px] px-1.5 py-0.5",
    md: "text-[10px] px-2 py-0.5",
    lg: "text-xs px-2.5 py-1",
    xl: "text-xs px-3 py-1",
  };

  // Render vector icon according to iconType & agency
  const renderAvatarIcon = () => {
    const s = iconSizes[size];

    // Priority: Display agency emblem shield for main MININT forces (SPN, PNA, SME, SIC, SPCB)
    if (["SPN", "PNA", "SME", "SIC", "SPCB"].includes(avatar.agency)) {
      return <AgencyShieldIcon agency={avatar.agency} size={size} />;
    }

    switch (avatar.iconType) {
      case "police":
        return <Shield className={`${s} text-blue-200 fill-blue-500/30 drop-shadow-md`} />;
      case "investigator":
        return <Search className={`${s} text-cyan-200 drop-shadow-md`} />;
      case "border":
        return <Globe className={`${s} text-emerald-200 drop-shadow-md`} />;
      case "fire":
        return <Flame className={`${s} text-amber-200 fill-amber-500/40 drop-shadow-md`} />;
      case "prison":
      case "shield":
        return <Shield className={`${s} text-purple-200 fill-purple-500/30 drop-shadow-md`} />;
      case "student":
        return <GraduationCap className={`${s} text-indigo-200 fill-indigo-500/30 drop-shadow-md`} />;
      case "crown":
        return <Crown className={`${s} text-amber-200 fill-amber-400/40 drop-shadow-md animate-pulse`} />;
      case "tactical":
        return <Compass className={`${s} text-teal-200 drop-shadow-md`} />;
      case "star":
        return <Star className={`${s} text-rose-200 fill-rose-500/40 drop-shadow-md`} />;
      default:
        return <UserCheck className={`${s} text-slate-200 drop-shadow-md`} />;
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Circle Container with Rich Gradient & Glossy Border */}
      <div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${avatar.bgGradient} ${avatar.borderColor} flex items-center justify-center shadow-lg relative overflow-hidden select-none`}
      >
        {/* Background Gloss Light Effect */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-md pointer-events-none"></div>

        {/* Vector Emblem Icon */}
        <div className="relative z-10 flex items-center justify-center">
          {renderAvatarIcon()}
        </div>

        {/* Shoulder Epaulettes Graphic Lines (Vector Style) */}
        <div className="absolute bottom-0 inset-x-0 h-2 bg-slate-950/40 flex justify-between px-1">
          <div className="w-1.5 h-1 bg-amber-400/70 rounded-full"></div>
          <div className="w-1.5 h-1 bg-amber-400/70 rounded-full"></div>
        </div>
      </div>

      {/* Agency Badge Tag overlay */}
      {showBadge && (
        <span
          className={`absolute -bottom-1 font-mono font-bold uppercase tracking-wider rounded-full border shadow-md z-20 ${avatar.badgeBg} ${badgeTextSizes[size]}`}
        >
          {avatar.agency}
        </span>
      )}
    </div>
  );
}

