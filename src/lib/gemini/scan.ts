import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Wine, WineColor, MaturityPhase } from '@/types/wine';
import { GEMINI_API_KEY } from '@/config/gemini';

export interface ScanResult {
  domain_name?: string;
  cuvee_name?: string | null;
  color?: WineColor | null;
  country?: string;
  region?: string;
  vintage?: number;
  producer_name?: string | null;
  grape_varieties?: string[] | null;
  alcohol_content?: number | null;
  confidence: number; // 0-1
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export async function scanWineLabel(
  labelImageBase64: string,
  backLabelImageBase64?: string
): Promise<{ data: ScanResult | null; error: Error | null }> {
  if (!genAI) return { data: null, error: new Error('GEMINI_API_KEY non configurée') };

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Tu es un expert en œnologie. Analyse cette étiquette de vin et extrais les informations suivantes au format JSON strict :
{
  "domain_name": "nom du domaine/château",
  "cuvee_name": "nom de la cuvée si présent, sinon null",
  "color": "red|white|rose|yellow|orange (déduis de l'image et du contexte)",
  "country": "pays d'origine",
  "region": "région viticole",
  "vintage": année (nombre),
  "producer_name": "nom du producteur si différent du domaine, sinon null",
  "grape_varieties": ["cépage1", "cépage2"] ou null si non identifiable,
  "alcohol_content": degré d'alcool (nombre) ou null,
  "confidence": score de confiance entre 0 et 1
}

Si une information n'est pas visible ou déductible, mets null.
Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;

  const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [
    { inlineData: { mimeType: 'image/jpeg', data: labelImageBase64 } },
  ];

  if (backLabelImageBase64) {
    imageParts.push({ inlineData: { mimeType: 'image/jpeg', data: backLabelImageBase64 } });
  }

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    if (!response) {
      return { data: null, error: new Error('Réponse API vide') };
    }
    let text: string;
    try {
      text = response.text();
    } catch {
      return { data: null, error: new Error('Réponse API invalide') };
    }
    const trimmed = text.trim();
    const jsonStr = trimmed.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr) as ScanResult;
    return { data: parsed, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

export async function enrichWineData(
  wine: Partial<Wine>
): Promise<
  | {
      maturity_phase: MaturityPhase;
      peak_date?: string;
      ideal_temp?: number;
      decanting_time?: number;
      description?: string;
      food_pairings?: string[];
    }
  | null
> {
  if (!genAI) return null;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Tu es un sommelier expert. Pour ce vin :
- Domaine : ${wine.domain_name}
- Cuvée : ${wine.cuvee_name || 'non précisée'}
- Couleur : ${wine.color}
- Région : ${wine.region}, ${wine.country}
- Millésime : ${wine.vintage}

Fournis au format JSON strict :
{
  "maturity_phase": "drink|peak|wait|sleep",
  "peak_date": "année estimée d'apogée (YYYY)",
  "ideal_temp": température de service en °C (nombre),
  "decanting_time": temps de carafage en minutes (nombre, 0 si non nécessaire),
  "description": "description concise du vin en 2 phrases",
  "food_pairings": ["plat1", "plat2", "plat3"]
}

IMPORTANT : Indique clairement quand tu n'es pas sûr. Réponds UNIQUEMENT en JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as {
      maturity_phase: MaturityPhase;
      peak_date?: string;
      ideal_temp?: number;
      decanting_time?: number;
      description?: string;
      food_pairings?: string[];
    };
  } catch (err) {
    return null;
  }
}

