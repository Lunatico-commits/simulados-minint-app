export interface AvatarItem {
  id: string;
  name: string;
  role: string;
  agency: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  textColor: string;
  iconType: "police" | "investigator" | "student" | "fire" | "border" | "shield" | "prison" | "crown" | "tactical" | "star";
  description: string;
}

export const AVATARS: AvatarItem[] = [
  {
    id: "pna_oficial",
    name: "Oficial PNA",
    role: "Polícia Nacional",
    agency: "PNA",
    bgGradient: "from-blue-600 via-blue-800 to-slate-900",
    borderColor: "border-blue-400/80",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    textColor: "text-blue-300",
    iconType: "police",
    description: "Insignia oficial da Polícia Nacional de Angola para ordem e segurança pública."
  },
  {
    id: "spn_penitenciario",
    name: "Agente SPN",
    role: "Serviço Penitenciário",
    agency: "SPN",
    bgGradient: "from-purple-700 via-purple-950 to-slate-950",
    borderColor: "border-purple-400/80",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    textColor: "text-purple-300",
    iconType: "prison",
    description: "Segurança de estabelecimentos prisionais, custódia e reinserção social de reclusos."
  },
  {
    id: "spn_oficial",
    name: "Oficial SPN",
    role: "Serviço Penitenciário",
    agency: "SPN",
    bgGradient: "from-purple-800 via-indigo-950 to-slate-950",
    borderColor: "border-purple-300/90",
    badgeBg: "bg-purple-500/30 text-purple-200 border-purple-400/60 font-bold",
    textColor: "text-purple-200",
    iconType: "prison",
    description: "Comando e gestão de estabelecimentos prisionais, segurança institucional e execução de penas."
  },
  {
    id: "sic_investigador",
    name: "Investigador SIC",
    role: "Investigação Criminal",
    agency: "SIC",
    bgGradient: "from-cyan-600 via-slate-800 to-slate-950",
    borderColor: "border-cyan-400/80",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    textColor: "text-cyan-300",
    iconType: "investigator",
    description: "Especialista em inteligência criminal, perícia forense e investigação de campo."
  },
  {
    id: "analista_inteligencia",
    name: "Analista Tático SIC",
    role: "Cibersegurança & Estratégia",
    agency: "SIC",
    bgGradient: "from-teal-600 via-slate-800 to-slate-950",
    borderColor: "border-teal-400/80",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-400/40",
    textColor: "text-teal-300",
    iconType: "tactical",
    description: "Análise estratégica de dados, cibersegurança e logística de operações de investigação."
  },
  {
    id: "sme_migracao",
    name: "Inspetor SME",
    role: "Migração e Estrangeiros",
    agency: "SME",
    bgGradient: "from-emerald-600 via-emerald-900 to-slate-950",
    borderColor: "border-emerald-400/80",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    textColor: "text-emerald-300",
    iconType: "border",
    description: "Controlo e proteção de fronteiras e fluxos migratórios da República de Angola."
  },
  {
    id: "sme_oficial",
    name: "Oficial de Fronteira SME",
    role: "Fiscalização Migratória",
    agency: "SME",
    bgGradient: "from-emerald-700 via-teal-900 to-slate-950",
    borderColor: "border-emerald-300/80",
    badgeBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/50",
    textColor: "text-emerald-200",
    iconType: "border",
    description: "Inspeção documental e garantia da soberania e segurança nos postos fronteiriços."
  },
  {
    id: "spcb_bombeiro",
    name: "Bombeiro SPCB",
    role: "Proteção Civil & Bombeiros",
    agency: "SPCB",
    bgGradient: "from-amber-600 via-red-900 to-slate-950",
    borderColor: "border-amber-400/80",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    textColor: "text-amber-300",
    iconType: "fire",
    description: "Força de resgate, salvação e proteção civil contra calamidades e acidentes."
  },
  {
    id: "spcb_oficial",
    name: "Oficial de Resgate SPCB",
    role: "Comando de Emergências",
    agency: "SPCB",
    bgGradient: "from-orange-600 via-amber-900 to-slate-950",
    borderColor: "border-orange-400/80",
    badgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/40",
    textColor: "text-orange-300",
    iconType: "fire",
    description: "Gestão de crises, prevenção contra incêndios e apoio operacional em calamidades."
  },
  {
    id: "aspirante_oficial",
    name: "Aspirante a Oficial PNA",
    role: "Escola de Polícia",
    agency: "PNA",
    bgGradient: "from-sky-600 via-blue-900 to-slate-950",
    borderColor: "border-sky-400/80",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-400/40",
    textColor: "text-sky-300",
    iconType: "police",
    description: "Futuro oficial em formação técnica policial e direito administrativo na ISCPC."
  },
  {
    id: "cadete_estudante",
    name: "Cadete Académico",
    role: "Estudante Universitário",
    agency: "Ensino Superior",
    bgGradient: "from-indigo-600 via-blue-900 to-slate-950",
    borderColor: "border-indigo-400/80",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
    textColor: "text-indigo-300",
    iconType: "student",
    description: "Estudante em preparação rigorosa para os exames de admissão no MININT."
  },
  {
    id: "estudante_dedicada",
    name: "Estudante Exemplar",
    role: "Candidata ao Concurso",
    agency: "MININT Prep",
    bgGradient: "from-rose-600 via-rose-900 to-slate-950",
    borderColor: "border-rose-400/80",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    textColor: "text-rose-300",
    iconType: "star",
    description: "Foco total na legislação de Angola, língua portuguesa e cultura geral."
  },
  {
    id: "comandante_minint",
    name: "Comandante Geral",
    role: "Alta Direção MININT",
    agency: "MININT",
    bgGradient: "from-amber-500 via-amber-800 to-slate-950",
    borderColor: "border-amber-400/90",
    badgeBg: "bg-amber-500/30 text-amber-200 border-amber-400/60 font-bold",
    textColor: "text-amber-300",
    iconType: "crown",
    description: "Comando estratégico, liderança e autoridade máxima na segurança interna."
  }
];

export const DEFAULT_AVATAR_ID = "pna_oficial";

export function getAvatarById(id: string): AvatarItem {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}
