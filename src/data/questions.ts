import { Question, Level } from "../types";

export const CATEGORIES = [
  "Constituição da República de Angola (CRA)",
  "Estatuto Orgânico & Legislação do MININT",
  "Serviço Penitenciário (SPN)",
  "Matemática Básica & Raciocínio Lógico",
  "História de Angola",
  "Organização Política e Administrativa (OPA)",
  "Atualidades & Conhecimentos Gerais",
  "Língua Portuguesa"
];

export const LEVEL_INFO: Record<Level, { label: string; badge: string; desc: string }> = {
  basico: {
    label: "Nível Básico",
    badge: "🟢 9.ª Classe / Carreiras Operacionais",
    desc: "Perguntas mais diretas, práticas e focadas em conceitos, matemática básica e deveres fundamentais."
  },
  medio: {
    label: "Nível Médio",
    badge: "🟡 Subinspetores / Técnicos",
    desc: "Perguntas de nível intermediário com interpretação de edital, sequências e legislação do MININT."
  },
  superior: {
    label: "Nível Superior",
    badge: "🔴 Inspectores / Oficiais",
    desc: "Perguntas avançadas com fundamentação jurídica detalhada da CRA, Leis Orgânicas e raciocínio dedutivo."
  }
};

export const SAMPLE_QUESTIONS: Question[] = [
  // =======================================================
  // 1. CONSTITUIÇÃO DA REPÚBLICA DE ANGOLA (CRA)
  // =======================================================
  {
    id: "cra_b1",
    materia: "Constituição da República de Angola (CRA)",
    nivel: "basico",
    pergunta: "De acordo com o Artigo 3.º da Constituição da República de Angola (CRA), a quem pertence a soberania nacional?",
    opcoes: [
      "A) Exclusivamente ao Governo Provincial.",
      "B) Ao Povo, que a exerce através do sufrágio universal e dos órgãos de soberania.",
      "C) Apenas aos órgãos de defesa e segurança.",
      "D) Às empresas estatais de grande dimensão."
    ],
    resposta_correta: 1,
    explicacao: "Nos termos do Artigo 3.º da CRA, a soberania é uma, indivisível e pertence ao povo, que a exerce por meio do sufrágio universal, livre, igual, directo, secreto e periódico."
  },
  {
    id: "cra_b2",
    materia: "Constituição da República de Angola (CRA)",
    nivel: "basico",
    pergunta: "Qual é a capital oficial da República de Angola consagrada no Artigo 19.º da Constituição?",
    opcoes: [
      "A) Benguela.",
      "B) Huambo.",
      "C) Luanda.",
      "D) Lubango."
    ],
    resposta_correta: 2,
    explicacao: "Nos termos do Artigo 19.º da Constituição da República de Angola, a capital da República de Angola é a cidade de Luanda."
  },
  {
    id: "cra_m1",
    materia: "Constituição da República de Angola (CRA)",
    nivel: "medio",
    pergunta: "De acordo com o Artigo 8.º da CRA, qual é a forma de Estado consagrada na República de Angola?",
    opcoes: [
      "A) Estado Federado com ampla autonomia regional.",
      "B) Estado Unitário que respeita na sua organização os princípios da autonomia local.",
      "C) Estado Confederado sob regime de co-governação municipal.",
      "D) Estado Socialista Centralizado sem descentralização administrativa."
    ],
    resposta_correta: 1,
    explicacao: "O Artigo 8.º (Estado Unitário) da CRA consagra que a República de Angola é um Estado unitário que respeita na sua organização e funcionamento os princípios da autonomia das autarquias locais."
  },
  {
    id: "cra_m2",
    materia: "Constituição da República de Angola (CRA)",
    nivel: "medio",
    pergunta: "No âmbito dos Direitos, Liberdades e Garantias Fundamentais, como é tratada a pena de morte em Angola?",
    opcoes: [
      "A) Permitida em crimes militares de alta traição.",
      "B) Aplicável apenas durante a vigência do estado de sítio.",
      "C) Expressamente proibida em qualquer circunstância.",
      "D) Permitida mediante aprovação sumária do Supremo Tribunal."
    ],
    resposta_correta: 2,
    explicacao: "O Artigo 59.º da CRA estabelece categoricamente que 'a pena de morte é proibida', garantindo a inviolabilidade do direito à vida (Artigo 30.º)."
  },
  {
    id: "cra_s1",
    materia: "Constituição da República de Angola (CRA)",
    nivel: "superior",
    pergunta: "Qual é o meio constitucional idóneo e urgente para tutelar a liberdade física e de locomoção de um cidadão contra a prisão ou detenção ilegal?",
    opcoes: [
      "A) Recurso Hierárquico Impróprio ao Ministro do Interior.",
      "B) Providência de Habeas Corpus interposta perante o Tribunal competente.",
      "C) Ação Popular Administrativa junto do Governo Provincial.",
      "D) Requerimento de Amnistia junto do Conselho da República."
    ],
    resposta_correta: 1,
    explicacao: "O Artigo 68.º da CRA consagra a garantia fundamental do 'Habeas Corpus', providência extraordinária que assegura a libertação imediata em caso de prisão ou detenção ilegal exercida por autoridade pública."
  },
  {
    id: "cra_s2",
    materia: "Constituição da República de Angola (CRA)",
    nivel: "superior",
    pergunta: "Sobre a presunção de inocência e garantias do processo criminal (Artigo 67.º da CRA), assinale a afirmação constitucionalmente correcta:",
    opcoes: [
      "A) O arguido presume-se culpado até apresentação de prova em contrário.",
      "B) Qualquer pessoa acusada de uma infração presume-se inocente até ao trânsito em julgado da sentença de condenação.",
      "C) As provas obtidas mediante tortura ou coação são válidas se o crime for grave.",
      "D) A prisão preventiva pode prolongar-se indefinidamente sem controlo judicial."
    ],
    resposta_correta: 1,
    explicacao: "O Artigo 67.º, n.º 2 da CRA estipula que 'todo o arguido se presume inocente até ao trânsito em julgado da sentença de condenação', e são nulas todas as provas obtidas mediante tortura ou coação."
  },

  // =======================================================
  // 2. ESTATUTO ORGÂNICO & LEGISLAÇÃO DO MININT
  // =======================================================
  {
    id: "minint_b1",
    materia: "Estatuto Orgânico & Legislação do MININT",
    nivel: "basico",
    pergunta: "Qual é o órgão de Polícia que garante a ordem e tranquilidade públicas, patrulhamento urbano e segurança rodoviária em Angola?",
    opcoes: [
      "A) SPCB - Serviço de Protecção Civil e Bombeiros.",
      "B) PNA - Polícia Nacional de Angola.",
      "C) SME - Serviço de Migração e Estrangeiros.",
      "D) SPN - Serviço Penitenciário."
    ],
    resposta_correta: 1,
    explicacao: "A Polícia Nacional de Angola (PNA) é uma força paramilitar com competência geral para garantir a ordem, segurança e tranquilidade públicas em todo o território nacional."
  },
  {
    id: "minint_b2",
    materia: "Estatuto Orgânico & Legislação do MININT",
    nivel: "basico",
    pergunta: "De acordo com a Lei da Polícia Nacional de Angola, qual é o dever primordial de todo o agente policial no exercício de patrulhamento?",
    opcoes: [
      "A) Aplicar sanções financeiras imediatas sem passar pelos tribunais.",
      "B) Respeitar e fazer respeitar a lei, protegendo os cidadãos, os seus bens e os Direitos Humanos.",
      "C) Decidir de forma autónoma quais as leis que devem ser cumpridas na sua zona.",
      "D) Exercer atividades comerciais privadas durante o turno de patrulha."
    ],
    resposta_correta: 1,
    explicacao: "Nos termos da Lei Orgânica da PNA, a missão institucional centra-se na proteção do cidadão, na garantia da ordem e no estrito cumprimento da legalidade democrática."
  },
  {
    id: "minint_m1",
    materia: "Estatuto Orgânico & Legislação do MININT",
    nivel: "medio",
    pergunta: "O uso de força física e meios coercivos por agentes da Polícia Nacional de Angola (PNA) deve obedecer rigorosamente a quais princípios legais?",
    opcoes: [
      "A) Vingança, rapidez e autoridade absoluta.",
      "B) Necessidade, adequação, proporcionalidade e legalidade.",
      "C) Superioridade numérica e discricionariedade sem limites.",
      "D) Conveniência pessoal e autorização verbal dos populares."
    ],
    resposta_correta: 1,
    explicacao: "O uso da força coerciva policial é estritamente regulado pelos princípios da necessidade, proporcionalidade, adequação e legalidade."
  },
  {
    id: "minint_s1",
    materia: "Estatuto Orgânico & Legislação do MININT",
    nivel: "superior",
    pergunta: "Perante a emissão de uma ordem superior manifestamente ilícita ou violadora dos Direitos Humanos fundamentais, qual é a conduta jurídica imposta pela Lei da PNA?",
    opcoes: [
      "A) Cumprir a ordem imediatamente sem questionar, transferindo toda a responsabilidade para o superior.",
      "B) Recusar o cumprimento da ordem manifestamente ilegal e comunicar imediatamente o facto às autoridades hierárquicas superiores e inspeção competente.",
      "C) Executar a ordem e requerer uma compensação financeira posterior.",
      "D) Abandonar o serviço policial sem dar qualquer conhecimento."
    ],
    resposta_correta: 1,
    explicacao: "A obediência hierárquica nas forças de segurança cessa perante ordens manifestamente criminosas ou violadoras dos direitos e garantias fundamentais consagrados na CRA."
  },

  // =======================================================
  // 3. SERVIÇO PENITENCIÁRIO (SPN)
  // =======================================================
  {
    id: "spn_b1",
    materia: "Serviço Penitenciário (SPN)",
    nivel: "basico",
    pergunta: "Qual é a principal missão do Serviço Penitenciário (SPN) em relação aos reclusos nos estabelecimentos prisionais?",
    opcoes: [
      "A) Aplicar castigos físicos diários para punir o crime cometido.",
      "B) Garantir a execução das penas privativas de liberdade e promover a reabilitação e reintegração social.",
      "C) Investigar novos crimes ocorridos fora das cadeias.",
      "D) Emitir vistos de residência temporária."
    ],
    resposta_correta: 1,
    explicacao: "O SPN tem por missão fundamental a custódia humana dos reclusos e a criação de condições para a sua reeducação, aprendizagem profissional e reintegração na sociedade."
  },
  {
    id: "spn_m1",
    materia: "Serviço Penitenciário (SPN)",
    nivel: "medio",
    pergunta: "De acordo com as normas de execução de penas, como deve ser feita a separação dos reclusos nos estabelecimentos penitenciários?",
    opcoes: [
      "A) Todos os reclusos (homens, mulheres e jovens) devem partilhar a mesma cela.",
      "B) Separados obrigatoriamente por sexo, idade (jovens/adultos) e situação jurídica (preventivos e condenados).",
      "C) Separados apenas por naturalidade ou província de origem.",
      "D) Não há critérios de separação no sistema penal angolano."
    ],
    resposta_correta: 1,
    explicacao: "A Lei de Execução das Penas Privativas de Liberdade estabelece a separação categórica dos reclusos por sexo, faixa etária (jovens separados de adultos) e estado judicial (detidos preventivamente separados de condenados com sentença transitada)."
  },

  // =======================================================
  // 4. MATEMÁTICA BÁSICA & RACIOCÍNIO LÓGICO
  // =======================================================
  {
    id: "mat_b1",
    materia: "Matemática Básica & Raciocínio Lógico",
    nivel: "basico",
    pergunta: "Numa esquadra da PNA com 200 efetivos, 25% dos agentes estão alocados ao patrulhamento rodoviário. Quantos agentes estão nessa missão?",
    opcoes: [
      "A) 25 agentes.",
      "B) 40 agentes.",
      "C) 50 agentes.",
      "D) 75 agentes."
    ],
    resposta_correta: 2,
    explicacao: "Cálculo de percentagem: 25% de 200 = (25 / 100) × 200 = 50 agentes."
  },
  {
    id: "mat_m1",
    materia: "Matemática Básica & Raciocínio Lógico",
    nivel: "medio",
    pergunta: "Observe a seguinte sequência lógica numérica: 3, 7, 15, 31, 63, ... Qual é o número que vem a seguir?",
    opcoes: [
      "A) 95",
      "B) 112",
      "C) 127",
      "D) 130"
    ],
    resposta_correta: 2,
    explicacao: "A lei de formação da sequência é (Termo × 2) + 1. Assim: (3×2)+1=7; (7×2)+1=15; (15×2)+1=31; (31×2)+1=63; (63×2)+1 = 127."
  },
  {
    id: "mat_s1",
    materia: "Matemática Básica & Raciocínio Lógico",
    nivel: "superior",
    pergunta: "Considerando a proposição lógica condicional: 'Se o inspetor analisa as provas com rigor, então o relatório técnico é aprovado', qual é a sua afirmação contrapositiva equivalente?",
    opcoes: [
      "A) Se o relatório técnico não foi aprovado, então o inspetor não analisou as provas com rigor.",
      "B) Se o relatório técnico foi aprovado, então o inspetor analisou as provas com rigor.",
      "C) O inspetor analisa as provas com rigor e o relatório técnico não é aprovado.",
      "D) Se o inspetor não analisa as provas com rigor, então o relatório técnico não é aprovado."
    ],
    resposta_correta: 0,
    explicacao: "A equivalência lógica de uma condicional (P -> Q) é a sua contrapositiva (~Q -> ~P). Nega-se ambas as partes e inverte-se a ordem."
  },

  // =======================================================
  // 5. HISTÓRIA DE ANGOLA (Descolonização, Independência & Acordos de Paz)
  // =======================================================
  {
    id: "hist_b1",
    materia: "História de Angola",
    nivel: "basico",
    pergunta: "Em que data histórica se comemora a Proclamação da Independência Nacional da República de Angola?",
    opcoes: [
      "A) 4 de Fevereiro de 1961.",
      "B) 11 de Novembro de 1975.",
      "C) 4 de Abril de 2002.",
      "D) 17 de Setembro de 1979."
    ],
    resposta_correta: 1,
    explicacao: "A Independência Nacional foi proclamada em Luanda no dia 11 de Novembro de 1975 pelo Dr. António Agostinho Neto na Praça da Independência."
  },
  {
    id: "hist_b2",
    materia: "História de Angola",
    nivel: "basico",
    pergunta: "O dia 4 de Fevereiro de 1961 marca um momento decisivo no processo de descolonização de Angola. O que ocorreu nessa data?",
    opcoes: [
      "A) Assinatura dos Acordos de Paz de Bicesse.",
      "B) O início da Luta Armada de Libertação Nacional com o assalto às cadeias em Luanda.",
      "C) A aprovação da primeira Constituição da República.",
      "D) A entrada de Angola para a SADC."
    ],
    resposta_correta: 1,
    explicacao: "O 4 de Fevereiro de 1961 é celebrado como o Dia do Início da Luta Armada de Libertação Nacional, quando patriotas angolanos atacaram a Casa de Reclusão e a 4.ª Esquadra da Polícia em Luanda."
  },
  {
    id: "hist_m1",
    materia: "História de Angola",
    nivel: "medio",
    pergunta: "O dia 4 de Abril é celebrado oficialmente em Angola como feriado nacional dedicado a:",
    opcoes: [
      "A) Dia do início da Luta de Libertação.",
      "B) Dia da Paz e da Reconciliação Nacional (Memorando de Entendimento de Luena, 2002).",
      "C) Dia do Herói Nacional.",
      "D) Dia da Fundação da Polícia Nacional."
    ],
    resposta_correta: 1,
    explicacao: "O 4 de Abril de 2002 assinala a assinatura do Memorando de Entendimento de Luena (Moxico), que pôs fim definitivo ao conflito armado, instituindo o Dia da Paz e Reconciliação Nacional."
  },
  {
    id: "hist_m2",
    materia: "História de Angola",
    nivel: "medio",
    pergunta: "Assinado em Maio de 1991 em Portugal, qual acordo consagrou o fim do sistema monopartidário e a transição para a democracia multipartidária em Angola?",
    opcoes: [
      "A) Acordos de Alvor.",
      "B) Acordos de Bicesse.",
      "C) Protocolo de Lusaka.",
      "D) Memorando de Luena."
    ],
    resposta_correta: 1,
    explicacao: "Os Acordos de Bicesse (31 de Maio de 1991) estabeleceram o cessar-fogo, a criação das Forças Armadas Angolanas (FAA) e a realização das primeiras eleições gerais multipartidárias em 1992."
  },
  {
    id: "hist_s1",
    materia: "História de Angola",
    nivel: "superior",
    pergunta: "No processo diplomático de descolonização de Angola, qual foi a importância fundamental dos Acordos de Alvor assinados em Janeiro de 1975?",
    opcoes: [
      "A) A criação do Estado Livre de Benguela sob mandato internacional.",
      "B) A declaração de cessar-fogo e o reconhecimento formal do direito de Angola à independência com a instituição de um Governo de Transição tripartite (Portugal e os três movimentos de libertação).",
      "C) A anexação imediata do enclave de Cabinda à República do Congo.",
      "D) A nomeação definitiva de um Governador-Geral militar português sem prazo de saída."
    ],
    resposta_correta: 1,
    explicacao: "Os Acordos de Alvor (15 de Janeiro de 1975, Portugal) definiram os termos de transição da soberania, fixando o dia 11 de Novembro de 1975 para a Proclamação da Independência Nacional."
  },

  // =======================================================
  // 6. ORGANIZAÇÃO POLÍTICA E ADMINISTRATIVA (OPA)
  // Nova Divisão Político-Administrativa (21 Províncias)
  // =======================================================
  {
    id: "opa_b1",
    materia: "Organização Política e Administrativa (OPA)",
    nivel: "basico",
    pergunta: "De acordo com a Nova Divisão Político-Administrativa de Angola (Lei n.º 14/24), quantas províncias constituem atualmente o território da República de Angola?",
    opcoes: [
      "A) 18 províncias.",
      "B) 20 províncias.",
      "C) 21 províncias.",
      "D) 24 províncias."
    ],
    resposta_correta: 2,
    explicacao: "Com a promulgação da nova Lei da Divisão Político-Administrativa, Angola passou de 18 para 21 províncias para aproximar os serviços públicos das populações."
  },
  {
    id: "opa_m1",
    materia: "Organização Política e Administrativa (OPA)",
    nivel: "medio",
    pergunta: "Quais foram as 3 novas províncias criadas no âmbito da reestruturação da Divisão Político-Administrativa de Angola?",
    opcoes: [
      "A) Cabinda Sul, Namibe Leste e Huambo Norte.",
      "B) Icolo e Bengo (capital Catete), Moxico Leste (capital Cazombo) e Cuando (capital Mavinga).",
      "C) Benguela Interior, Cuanza Sul Leste e Bié Norte.",
      "D) Luanda Ocidental, Zaire do Sul e Cunene Leste."
    ],
    resposta_correta: 1,
    explicacao: "A reorganização territorial desmembrou as províncias mais extensas: criou a província de Icolo e Bengo (Catete), Moxico Leste (Cazombo) e Cuando (Mavinga), dividindo o antigo Cuando Cubango."
  },
  {
    id: "opa_s1",
    materia: "Organização Política e Administrativa (OPA)",
    nivel: "superior",
    pergunta: "Qual é a capital da nova província de Moxico Leste criada pela Lei da Divisão Político-Administrativa?",
    opcoes: [
      "A) Luena.",
      "B) Luau.",
      "C) Cazombo.",
      "D) Menongue."
    ],
    resposta_correta: 2,
    explicacao: "A nova província de Moxico Leste tem como sede capital a vila do Cazombo, enquanto a província do Moxico mantém Luena como sua capital."
  },

  // =======================================================
  // 7. ATUALIDADES, EDUCAÇÃO PATRIÓTICA & CULTURA GERAL
  // (Símbolos Nacionais: Bandeira, Insígnia, Hino, SADC e Geopolítica)
  // =======================================================
  {
    id: "at_b1",
    materia: "Atualidades & Conhecimentos Gerais",
    nivel: "basico",
    pergunta: "Na Bandeira Nacional da República de Angola, qual é o significado oficial da cor Vermelha?",
    opcoes: [
      "A) A riqueza de minérios e petróleo existentes no subsolo.",
      "B) O sangue derramado pelos angolanos durante a opressão colonial, a luta de libertação nacional e a defesa da Pátria.",
      "C) O continente africano e a negritude.",
      "D) A paz conquistada com o fim do conflito armado."
    ],
    resposta_correta: 1,
    explicacao: "Nos termos do Artigo 18.º da CRA, o vermelho representa o sangue derramado pelos angolanos durante a opressão colonial, a luta de libertação nacional e a defesa da Pátria; o preto representa o continente africano."
  },
  {
    id: "at_b2",
    materia: "Atualidades & Conhecimentos Gerais",
    nivel: "basico",
    pergunta: "Quais elementos figuram no centro da Bandeira Nacional de Angola, simbolizando os trabalhadores, o campesinato e o progresso?",
    opcoes: [
      "A) Um livro aberto e uma espada de ouro.",
      "B) Uma meia roda dentada (indústria), uma catana (agricultura/luta) e uma estrela de cinco pontas (solidariedade e progresso).",
      "C) Um ramo de café, uma palma e um sol nascente.",
      "D) Uma enxada e um rifle cruzados."
    ],
    resposta_correta: 1,
    explicacao: "A figura central amarela da Bandeira é composta por uma segmento de roda dentada (trabalhadores e produção industrial), uma catana (campesinato, produção agrícola e luta armada) e uma estrela (solidariedade internacional e progresso)."
  },
  {
    id: "at_m1",
    materia: "Atualidades & Conhecimentos Gerais",
    nivel: "medio",
    pergunta: "Quem são os autores da letra e da música do Hino Nacional da República de Angola ('Angola Avante!')?",
    opcoes: [
      "A) Letra de Agostinho Neto e Música de Pepetela.",
      "B) Letra de Manuel Rui Monteiro e Música de Rui Mingas.",
      "C) Letra de Luandino Vieira e Música de Paulo Flores.",
      "D) Letra de Mario Pinto de Andrade e Música de Bonga."
    ],
    resposta_correta: 1,
    explicacao: "O Hino Nacional 'Angola Avante!' tem a letra escrita pelo escritor Manuel Rui Monteiro e composição musical do maestro e diplomata Rui Mingas."
  },
  {
    id: "at_m2",
    materia: "Atualidades & Conhecimentos Gerais",
    nivel: "medio",
    pergunta: "Na Insígnia da República de Angola, o que simbolizam a catana e a enxada cruzadas e o sol nascente?",
    opcoes: [
      "A) A navegação marítima e os recursos haliêuticos.",
      "B) O trabalho agrícola, a defesa da Pátria e o surgimento da nova Nação.",
      "C) A justiça militar e o poder judicial autárquico.",
      "D) A exploração diamantífera e a aviação civil."
    ],
    resposta_correta: 1,
    explicacao: "A catana e a enxada simbolizam o trabalho, a produção agrícola e a defesa da Pátria. O sol nascente representa o nascimento do novo Estado angolano."
  },
  {
    id: "at_s1",
    materia: "Atualidades & Conhecimentos Gerais",
    nivel: "superior",
    pergunta: "No plano geopolítico e diplomático recente, qual é o papel de liderança desempenhado por Angola na SADC e na região dos Grandes Lagos?",
    opcoes: [
      "A) Angola recusou qualquer intervenção em conflitos regionais por imperativo de isolamento diplomático.",
      "B) Angola desempenha um papel de mediação estratégica no 'Processo de Luanda' para a paz e pacificação do Leste da República Democrática do Congo (RDC).",
      "C) Angola lidera a união monetária exclusiva com os países da Europa do Leste.",
      "D) Angola atua apenas como observadora sem direito a voto nas cimeiras da SADC."
    ],
    resposta_correta: 1,
    explicacao: "Angola é um pilar de estabilidade na África Austral (SADC) e o Presidente angolano atua como Campeão da Paz da União Africana, liderando a mediação do Processo de Luanda para a pacificação da RDC."
  },

  // =======================================================
  // 8. LÍNGUA PORTUGUESA (Interpretação, Gramática & Redação Oficial)
  // =======================================================
  {
    id: "lp_b1",
    materia: "Língua Portuguesa",
    nivel: "basico",
    pergunta: "Assinale a opção em que a frase apresenta correta pontuação e uso da vírgula:",
    opcoes: [
      "A) O candidato, entrou na sala mas, não levou o Bilhete de Identidade.",
      "B) Em Luanda, os candidatos realizaram a prova de aptidão com muita disciplina.",
      "C) Os agentes da PNA garantem a ordem, pública em todo o país.",
      "D) O exame do MININT começou, às 08 horas da manhã."
    ],
    resposta_correta: 1,
    explicacao: "A opção B emprega corretamente a vírgula para isolar o adjunto adverbial de lugar deslocado ('Em Luanda,'). Não se deve separar o sujeito do verbo por vírgula."
  },
  {
    id: "lp_b2",
    materia: "Língua Portuguesa",
    nivel: "basico",
    pergunta: "Qual das opções apresenta a concordância nominal correta de acordo com a norma padrão?",
    opcoes: [
      "A) Seguem anexo as fichas de inscrição do concurso.",
      "B) Seguem anexas as fichas de inscrição do concurso.",
      "C) A candidata disse muito obrigado ao instrutor do curso.",
      "D) Elas mesmo preencheram os formulários da Polícia."
    ],
    resposta_correta: 1,
    explicacao: "A palavra 'anexo' concorda em género e número com o substantivo a que se refere ('anexas as fichas'). A candidata mulher diria 'obrigada' e 'elas mesmas'."
  },
  {
    id: "lp_m1",
    materia: "Língua Portuguesa",
    nivel: "medio",
    pergunta: "Assinale a alternativa em que a concordância verbal com o verbo 'haver' ou 'fazer' cumpre rigorosamente a norma culta:",
    opcoes: [
      "A) Haviam muitos cidadãos a aguardar a emissão de passaportes na instalação do SME.",
      "B) Havia muitos cidadãos a aguardar a emissão de passaportes na instalação do SME.",
      "C) Houveram várias perguntas sobre a nova divisão administrativa.",
      "D) Fazem três anos que o candidato concluiu a formação de bombeiros."
    ],
    resposta_correta: 1,
    explicacao: "O verbo 'haver' no sentido de 'existir' é impessoal, devendo permanecer na 3.ª pessoa do singular ('Havia muitos cidadãos'). O mesmo acontece com 'fazer' indicando tempo decorrido ('Faz três anos')."
  },
  {
    id: "lp_m2",
    materia: "Língua Portuguesa",
    nivel: "medio",
    pergunta: "Em Redação Oficial da Administração Pública Angolana, qual é a fórmula de vocativo recomendada ao dirigir um Ofício formal ao Titular do Ministério do Interior?",
    opcoes: [
      "A) Querido Ministro do Interior,",
      "B) Excelentíssimo Senhor Ministro do Interior,",
      "C) Olá Senhor Ministro,",
      "D) Prezado Amigo Ministro,"
    ],
    resposta_correta: 1,
    explicacao: "O Manual de Redacção Oficial estabelece a fórmula 'Excelentíssimo Senhor [Cargo]' (Exmo. Sr. Ministro) para tratamento respeitoso e formal nas comunicações do Estado."
  },
  {
    id: "lp_s1",
    materia: "Língua Portuguesa",
    nivel: "superior",
    pergunta: "Na análise sintáctica do texto oficial do edital do MININT: 'Convocam-se todos os candidatos aprovados para a inspeção médica', qual é a função sintáctica do elemento 'todos os candidatos aprovados' e da partícula 'se'?",
    opcoes: [
      "A) Complemento directo e partícula de realce.",
      "B) Sujeito paciente da oração na voz passiva sintética e partícula apassivadora (se).",
      "C) Objeto indireto e pronome reflexivo.",
      "D) Predicativo do sujeito e conjunção subordinativa integrante."
    ],
    resposta_correta: 1,
    explicacao: "O verbo 'convocar' é transitivo direto (convocar alguém). A partícula 'se' atua como partícula apassivadora, tornando 'todos os candidatos aprovados' o sujeito paciente no plural ('Todos os candidatos aprovados são convocados')."
  },
  {
    id: "lp_s2",
    materia: "Língua Portuguesa",
    nivel: "superior",
    pergunta: "Qual das seguintes características é indispensável no estilo da Redação Oficial (Ofícios, Despachos e Memorandos) da Administração Pública?",
    opcoes: [
      "A) Uso abundante de figuras de estilo poéticas e metáforas pessoais.",
      "B) Impessoalidade, clareza, concisão, formalidade e observância da norma culta da língua.",
      "C) Emprego frequente de gírias e abreviaturas informais de redes sociais.",
      "D) Ausência total de pontuação para acelerar a leitura."
    ],
    resposta_correta: 1,
    explicacao: "Os atos administrativos e a correspondência oficial pautam-se estritamente pelos princípios da impessoalidade, clareza, concisão, objetividade e clareza gramatical."
  }
];

/**
 * Helper function to select 5 questions for an exam round.
 * If category is provided, pick 5 from that category for the specified level.
 * If category is null (Simulado Completo), select 1 question from each of the 5 core subject areas:
 *  1. CRA
 *  2. MININT / Legislação
 *  3. Matemática Básica & Raciocínio Lógico
 *  4. SPN / OPA
 *  5. História / Atualidades / Língua Portuguesa
 */
export function getExamQuestions(category: string | null, level: Level): Question[] {
  // First, filter by level
  let levelQuestions = SAMPLE_QUESTIONS.filter(q => q.nivel === level);
  if (levelQuestions.length === 0) {
    levelQuestions = [...SAMPLE_QUESTIONS];
  }

  // If specific category is selected
  if (category) {
    const catQuestions = levelQuestions.filter(q => q.materia === category);
    if (catQuestions.length >= 5) {
      return catQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    }
    if (catQuestions.length > 0) {
      // Fall back to mixing with same category from other levels if needed
      const allCatQuestions = SAMPLE_QUESTIONS.filter(q => q.materia === category);
      return allCatQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    }
  }

  // For "Simulado Completo" (category === null) or fallback:
  // Pick 1 question from each key area:
  const area1 = levelQuestions.filter(q => q.materia.includes("Constituição"));
  const area2 = levelQuestions.filter(q => q.materia.includes("MININT") || q.materia.includes("Estatuto"));
  const area3 = levelQuestions.filter(q => q.materia.includes("Matemática"));
  const area4 = levelQuestions.filter(q => q.materia.includes("Penitenciário") || q.materia.includes("Organização"));
  const area5 = levelQuestions.filter(q => q.materia.includes("História") || q.materia.includes("Atualidades") || q.materia.includes("Língua"));

  const selected: Question[] = [];
  const pickOne = (arr: Question[]) => {
    if (arr.length > 0) {
      const unused = arr.filter(q => !selected.some(s => s.id === q.id));
      if (unused.length > 0) {
        const rand = unused[Math.floor(Math.random() * unused.length)];
        selected.push(rand);
      }
    }
  };

  pickOne(area1);
  pickOne(area2);
  pickOne(area3);
  pickOne(area4);
  pickOne(area5);

  // If still fewer than 5, fill from remaining levelQuestions or sample questions
  let pool = levelQuestions.length >= 5 ? levelQuestions : SAMPLE_QUESTIONS;
  while (selected.length < 5 && pool.length > selected.length) {
    const remaining = pool.filter(q => !selected.some(s => s.id === q.id));
    if (remaining.length === 0) break;
    const rand = remaining[Math.floor(Math.random() * remaining.length)];
    selected.push(rand);
  }

  return selected.slice(0, 5);
}
