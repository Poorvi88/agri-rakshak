import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Parse large JSON payloads for high-resolution farmer crop photos
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI with recommended telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract base64 data and mime type from data URL
function parseBase64Image(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  // Default to image/jpeg if raw base64 string provided
  return { mimeType: 'image/jpeg', data: dataUrl };
}

// 1. Photo Scanner API (Leaf, Crop, Seed)
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { image, scanType, language, cropHint, location } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required for scanning.' });
    }

    const { mimeType, data } = parseBase64Image(image);
    const targetLang = language || 'English';
    const type = scanType || 'leaf';

    const systemInstruction = `
You are AgriRakshak AI, an authoritative, veteran Senior Plant Pathologist and Agricultural Scientist advising Indian farmers.
Your goal is to inspect photographs of crop leaves, fields, or seeds, and provide compassionate, highly practical, scientifically rigorous, and safe agronomic advice.

The user is scanning: ${type.toUpperCase()}.
Farmer's selected language: ${targetLang}.
Reported crop: ${cropHint || 'Unknown / General Crop'}.
Farmer's Region/State: ${location || 'India (General Agro-climatic zone)'}.

CRITICAL PROTOCOLS:
1. All descriptions, symptoms, recommendations, and explanations MUST be written in the specified language (${targetLang}), with clear, simple, farmer-accessible phrasing. Maintain botanical/scientific names in Latin/English alongside local names.
2. If scanning LEAF:
   - Identify visible foliar diseases (e.g. Early/Late Blight, Powdery Mildew, Rust, Leaf Spot, Anthracnose, Leaf Curl Virus) or insect damage (leaf miner trails, thrips curling, aphid honeydew).
   - Differentiate nutrient deficiencies (e.g. Nitrogen chlorosis vs Potassium leaf edge scorch) from fungal/bacterial infections.
3. If scanning CROP (whole field / plant stand):
   - Assess plant vigor, visible canopy stress, wilting (bacterial vs fusarium wilt), stand density, lodging, or waterlogging symptoms.
   - Outline field-level containment strategies.
4. If scanning SEED:
   - Identify visible physical characteristics: seed discoloration, visible fungal mycelium/blackening, insect boreholes (bruchid/weevil holes), wrinkling, broken seed coats, or foreign matter.
   - Detail visual signs of healthy certified seeds.
   - Explain how to perform a simple, zero-cost 7-day wet cloth / rag-doll germination test at home.
   - MANDATORY SEED DISCLAIMER: You MUST strictly emphasize: "Visual photo inspection cannot prove genetic purity, true variety, internal seed-borne viral/bacterial infections, or germination percentage. Always perform a rag-doll test and procure government/NSC/state-certified seed with genuine blue/green tags."
5. PESTICIDE & TREATMENT SAFETY:
   - Prioritize Integrated Pest Management (IPM), biological biocontrol agents (e.g., Trichoderma viride, Pseudomonas fluorescens, Beauveria bassiana, Neem cake/Neem oil 10,000 ppm), and cultural practices (intercropping, balanced NPK, clean sanitation).
   - Only recommend standard registered active chemical ingredients recognized by Indian agricultural authorities (CIB&RC / ICAR / State KVKs) such as Mancozeb, Copper Oxychloride, Chlorantraniliprole, Imidacloprid, etc.
   - NEVER fabricate chemical names, arbitrary proprietary brand cocktails, or untrusted doses.
   - Specify safety measures: PPE (masks, chemical gloves, eye protection), spray timing (early morning or late evening, not in high winds), and Pre-Harvest Interval (waiting period).
   - Instruct farmers to follow the registered container label and consult their local Krishi Vigyan Kendra (KVK) or Raitha Samparka Kendra before chemical application.
6. Provide an "audioSummaryText": A short, clean, 2-3 sentence paragraph in ${targetLang} designed specifically to be read aloud via Text-to-Speech to the farmer, stating the diagnosed issue, severity, and the most crucial immediate step.

Output format MUST be a valid JSON object matching this schema:
{
  "cropName": "Crop name in English and in ${targetLang}",
  "scanType": "${type}",
  "problemIdentified": "Name of disease, visible pest, or seed condition in ${targetLang}",
  "scientificName": "Botanical/pathogen name in Latin or English",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "confidence": "High" | "Moderate" | "Needs Expert Verification",
  "confidenceExplanation": "Plain explanation of confidence and visible visual indicators",
  "symptoms": ["Symptom 1", "Symptom 2", ...],
  "possibleCauses": ["Cause 1", "Cause 2", ...],
  "immediateActions": ["Immediate step 1", "Immediate step 2", ...],
  "naturalControl": ["Organic/IPM practice 1", "Bio-agent/Neem 2", ...],
  "chemicalControl": {
    "recommendedActives": ["Active ingredient 1 with precautionary note", ...],
    "safetyGear": ["Mask", "Chemical gloves", "Protective eyewear"],
    "waitingPeriodDays": "X days before harvest (PHI)",
    "labelWarning": "Strict notice to read official container label and consult local KVK"
  },
  "preventionMethods": ["Long-term prevention 1", "Cultural method 2", ...],
  "seedGuidance": {
    "visualQualityCheck": "Explanation of visual quality indicators",
    "certifiedSeedAdvice": "Guidance on identifying genuine certified seed tags (NSC/ICAR)",
    "germinationTestSteps": ["Step 1", "Step 2", "Step 3"],
    "limitationNotice": "A photograph alone cannot guarantee purity, seed health or germination."
  },
  "audioSummaryText": "Concise spoken summary in ${targetLang} for farmer TTS readout",
  "expertAdviceNotice": "Guidance on contacting local KVK / Raitha Samparka Kendra"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data,
          },
        },
        {
          text: `Please analyze this agricultural ${type} photograph for the farmer. Produce the diagnosis and actionable guidance in ${targetLang}.`,
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let resultJson;
    try {
      resultJson = JSON.parse(rawText);
    } catch {
      // Fallback cleanup if model wrapped in markdown fences
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleanJson);
    }

    res.json({ success: true, result: resultJson });
  } catch (error: any) {
    console.error('Error in /api/scan:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze crop image. Please check your image and try again.',
    });
  }
});

// 2. Multilingual AI Farmer Chatbot ("Ask Agri AI")
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, language, image } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required.' });
    }

    const targetLang = language || 'English';

    const systemInstruction = `
You are "AgriRakshak AI", a warm, empathetic, and expert Indian agricultural advisor and farm doctor.
You converse with farmers in their preferred local language: ${targetLang}.

Core Guidelines:
1. Respond primarily in ${targetLang} (support Kannada, Hindi, Telugu, Tamil, Malayalam, Marathi, Bengali, Gujarati, Punjabi, and English).
2. Use respectful, warm, and practical tone suited for Indian farmers (referring respectfully to farmers, e.g. "Namaskara Raitha Bandhu" in Kannada, "Namaste Kisan Bhai" in Hindi).
3. If the farmer asks an ambiguous question (e.g., "my leaves are yellowing" or "insects in field"), warmly ask clarifying questions:
   - What crop is it?
   - How old is the crop (seedling, vegetative, flowering, fruiting)?
   - Which state/district is your farm in?
   - What is the soil and irrigation situation?
4. Always prioritize Integrated Pest Management (IPM) & organic/biological solutions (Neem oil, Jeevamrutha, Trichoderma, pheromone traps, light traps) before chemical pesticides.
5. For chemical options: only name registered, verified active ingredients (e.g., Mancozeb, Chlorantraniliprole, Carbendazim, Imidacloprid). Never invent doses. Always instruct the farmer to check the registered package label and consult their nearest KVK (Krishi Vigyan Kendra) or Raitha Samparka Kendra.
6. Provide simple step-by-step numbered points so it is easy to read or listen to on a mobile device.
7. Keep sentences clear and avoid overly dense academic jargon.
`;

    // Format chat history for Gemini
    const contents: any[] = [];

    // Add prior conversation turns
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text || '' }],
      });
    }

    // Last user turn (may contain an image attachment)
    const lastMsg = messages[messages.length - 1];
    const lastParts: any[] = [];

    if (image) {
      const { mimeType, data } = parseBase64Image(image);
      lastParts.push({
        inlineData: {
          mimeType,
          data,
        },
      });
    }

    lastParts.push({
      text: `${lastMsg.text || 'Please examine this and provide advice.'}\n\nPlease reply in ${targetLang}.`,
    });

    contents.push({
      role: 'user',
      parts: lastParts,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || 'No response generated.';
    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error?.message || 'Chat service encountered an error. Please try again.',
    });
  }
});

// 3. Pesticide & IPM Advisor Search API
app.post('/api/pesticide-advisor', async (req: Request, res: Response) => {
  try {
    const { crop, targetIssue, language, region } = req.body;
    const targetLang = language || 'English';

    const prompt = `
Provide safe, verified agricultural pesticide and IPM advisory for:
Crop: ${crop || 'General Crop'}
Target Pest / Disease / Weed: ${targetIssue || 'General pest protection'}
State/Region: ${region || 'All India'}
Language: ${targetLang}

Requirements:
1. Provide a balanced solution:
   - Cultural and Mechanical control (traps, weeding, spacing)
   - Biological / Natural remedies (Neem, Trichoderma, NPV, etc.)
   - Verified CIB&RC approved chemical active ingredients (generic names only, e.g. Mancozeb, Hexaconazole, Emamectin Benzoate, etc.).
   - Pre-Harvest Intervals (PHI) in days.
   - Mandatory Personal Protective Equipment (PPE) instructions.
   - Precautions regarding honeybees, water bodies, and livestock.
2. Return strictly valid JSON in ${targetLang}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert Indian agronomist and CIB&RC specialist. You must answer in ${targetLang} with strict scientific accuracy and no invented trade chemicals.`,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
    }

    res.json({ success: true, advisory: data });
  } catch (error: any) {
    console.error('Error in /api/pesticide-advisor:', error);
    res.status(500).json({ error: error?.message || 'Failed to retrieve pesticide advisory.' });
  }
});

// 4. Regional Agro-meteorological & Weather Risk Advisories
app.get('/api/weather-advisories', (req: Request, res: Response) => {
  const state = (req.query.state as string) || 'Karnataka';

  // Authentic seasonal agro-meteorological advisories for Indian farming belts
  const regionalData: Record<string, any> = {
    Karnataka: {
      zone: 'Southern Dry & Transitional Zone (Mandya, Hassan, Belagavi, Davanagere, Raichur)',
      temperature: '28°C - 33°C',
      humidity: '72%',
      rainfallOutlook: 'Scattered light showers expected over the next 48 hours.',
      diseaseRisks: [
        {
          crop: 'Paddy / Rice',
          disease: 'Blast & Brown Plant Hopper (BPH)',
          riskLevel: 'Moderate',
          advisory: 'High humidity favors Blast. Avoid excessive nitrogenous fertilizers. Maintain thin water layer.',
        },
        {
          crop: 'Tomato & Chilli',
          disease: 'Leaf Curl & Thrips Infestation',
          riskLevel: 'High',
          advisory: 'Dry spells with warm days trigger Thrips multiplication. Install blue/yellow sticky traps.',
        },
        {
          crop: 'Maize',
          disease: 'Fall Armyworm (FAW)',
          riskLevel: 'High',
          advisory: 'Scout whorls of 15-30 day old crops for FAW larvae. Apply Neem formulations or Metarhizium anisopliae.',
        },
      ],
      farmingTips: [
        'Perform field bunding to conserve localized soil moisture.',
        'Apply Trichoderma viride enriched farmyard manure before sowing.',
        'Check nearby Raitha Samparka Kendra for certified rabi seeds and soil testing kits.',
      ],
    },
    Maharashtra: {
      zone: 'Western Ghats & Marathwada Zone (Pune, Nashik, Aurangabad, Vidarbha)',
      temperature: '26°C - 34°C',
      humidity: '65%',
      rainfallOutlook: 'Dry weather with morning dew.',
      diseaseRisks: [
        {
          crop: 'Cotton',
          disease: 'Pink Bollworm & Sucking Pests',
          riskLevel: 'High',
          advisory: 'Install pheromone traps (5 per acre) for monitoring. Destroy rosette flowers.',
        },
        {
          crop: 'Soybean & Gram',
          disease: 'Pod Borer & Wilt',
          riskLevel: 'Moderate',
          advisory: 'Seed treatment with Trichoderma is essential before sowing Bengal gram.',
        },
        {
          crop: 'Grapes / Pomegranate',
          disease: 'Downy Mildew & Bacterial Blight',
          riskLevel: 'Moderate',
          advisory: 'Spray preventive Copper-based formulations following ICAR-NRC guidelines.',
        },
      ],
      farmingTips: [
        'Ensure proper pruning and light penetration in orchards.',
        'Use drip irrigation during early morning hours to minimize water evaporation.',
      ],
    },
    'Uttar Pradesh': {
      zone: 'Indo-Gangetic Plain (Varanasi, Lucknow, Meerut, Bareilly)',
      temperature: '22°C - 31°C',
      humidity: '68%',
      rainfallOutlook: 'Clear sunny days, moderate humidity.',
      diseaseRisks: [
        {
          crop: 'Wheat',
          disease: 'Yellow / Brown Rust & Termite attack',
          riskLevel: 'Moderate',
          advisory: 'Monitor early sown wheat for yellow pustules on upper leaf surface.',
        },
        {
          crop: 'Sugarcane',
          disease: 'Red Rot & Top Borer',
          riskLevel: 'High',
          advisory: 'Use disease-free certified sets. Avoid ratooning infected cane fields.',
        },
        {
          crop: 'Potato',
          disease: 'Late Blight Risk',
          riskLevel: 'High',
          advisory: 'Cloudy weather with high relative humidity triggers late blight spore spread.',
        },
      ],
      farmingTips: [
        'Optimal time for rabi pulses and oilseed sowing.',
        'Conduct soil testing for micronutrient zinc and boron balance.',
      ],
    },
    Punjab: {
      zone: 'Trans-Gangetic Plain (Ludhiana, Amritsar, Bathinda, Patiala)',
      temperature: '19°C - 29°C',
      humidity: '60%',
      rainfallOutlook: 'Clear skies with dry winds.',
      diseaseRisks: [
        {
          crop: 'Wheat',
          disease: 'Yellow Rust Surveillance',
          riskLevel: 'Moderate',
          advisory: 'Check sub-mountainous foothills for stripe rust. Notify PAU extension if spotted.',
        },
        {
          crop: 'Mustard / Rapeseed',
          disease: 'Aphids & White Rust',
          riskLevel: 'Moderate',
          advisory: 'Sow resistant varieties and maintain recommended plant-to-plant spacing.',
        },
      ],
      farmingTips: [
        'Adopt in-situ paddy straw management with Happy Seeder or Super Seeder.',
        'Use recommended herbicide dosage strictly at 30-35 days after sowing.',
      ],
    },
    'Tamil Nadu': {
      zone: 'Cauvery Delta & Southern Zone (Thanjavur, Madurai, Coimbatore)',
      temperature: '25°C - 32°C',
      humidity: '80%',
      rainfallOutlook: 'Northeast monsoon active, moderate to heavy spells expected.',
      diseaseRisks: [
        {
          crop: 'Paddy / Samba Rice',
          disease: 'Bacterial Leaf Blight (BLB) & Sheath Rot',
          riskLevel: 'High',
          advisory: 'Drain excess field water. Avoid nitrogen top-dressing during heavy rain spells.',
        },
        {
          crop: 'Banana',
          disease: 'Sigatoka Leaf Spot',
          riskLevel: 'High',
          advisory: 'Remove and burn heavily spotted lower leaves. Provide drainage trenches.',
        },
      ],
      farmingTips: [
        'Clear field drainage channels to prevent water stagnation in delta lowlands.',
        'Foliar spray of 1% KCl during cloudy spells improves crop stress tolerance.',
      ],
    },
    'Andhra Pradesh': {
      zone: 'Coastal Andhra & Rayalaseema (Guntur, Krishna, Kurnool, Anantapur)',
      temperature: '27°C - 33°C',
      humidity: '74%',
      rainfallOutlook: 'Partly cloudy with coastal moisture.',
      diseaseRisks: [
        {
          crop: 'Chilli',
          disease: 'Black Thrips & Anthracnose (Fruit Rot)',
          riskLevel: 'Critical',
          advisory: 'Intercrop with maize or sorghum as border crops. Spray bio-pesticides proactively.',
        },
        {
          crop: 'Groundnut',
          disease: 'Tikka Leaf Spot & Collar Rot',
          riskLevel: 'Moderate',
          advisory: 'Seed treatment with Mancozeb or Trichoderma protects early seedlings.',
        },
      ],
      farmingTips: [
        'Monitor chilli nurseries strictly with yellow and blue sticky traps.',
        'Adopt micro-sprinklers for efficient water conservation.',
      ],
    },
  };

  const selected = regionalData[state] || regionalData['Karnataka'];
  res.json({ state, ...selected });
});

// Vite Integration: Mount Vite dev middlewares in development, serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static assets
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Vite middleware in dev
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 AgriRakshak AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
