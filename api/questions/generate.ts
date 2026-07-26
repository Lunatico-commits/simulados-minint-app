import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Permitir pedidos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { materia, nivel, count } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Chave GEMINI_API_KEY não configurada nas variáveis da Vercel.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Gera ${count || 5} questões inéditas de escolha múltipla para o concurso do Ministério do Interior de Angola (MININT).
Matéria: ${materia || 'Legislação e Cultura Geral'}.
Nível: ${nivel || 'basico'}.

Devolve EXCLUSIVAMENTE um JSON válido no seguinte formato de array, sem blocos de código nem marcações adicionais:
[
  {
    "id": "q1",
    "materia": "${materia}",
    "pergunta": "Texto da pergunta aqui",
    "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "resposta_correta": 0,
    "explicacao": "Fundamentação técnica ou jurídica."
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleanJson);

    return res.status(200).json({ success: true, questions });

  } catch (error: any) {
    console.error("Erro na API generate:", error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao comunicar com a IA'
    });
  }
}
