export type LanguageCode =
  | 'en'
  | 'kn'
  | 'hi'
  | 'te'
  | 'ta'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa';

export type ScanType = 'leaf' | 'crop' | 'seed';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ConfidenceLevel = 'High' | 'Moderate' | 'Needs Expert Verification';

export interface ChemicalControlInfo {
  recommendedActives: string[];
  safetyGear: string[];
  waitingPeriodDays: string;
  labelWarning: string;
}

export interface SeedGuidanceInfo {
  visualQualityCheck: string;
  certifiedSeedAdvice: string;
  germinationTestSteps: string[];
  limitationNotice: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  scanType: ScanType;
  cropName: string;
  problemIdentified: string;
  scientificName: string;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  confidenceExplanation: string;
  symptoms: string[];
  possibleCauses: string[];
  immediateActions: string[];
  naturalControl: string[];
  chemicalControl: ChemicalControlInfo;
  preventionMethods: string[];
  seedGuidance?: SeedGuidanceInfo;
  audioSummaryText: string;
  expertAdviceNotice: string;
  farmerNotes?: string;
  location?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp: number;
}

export interface DiseaseRiskAlert {
  crop: string;
  disease: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  advisory: string;
}

export interface WeatherRiskReport {
  state: string;
  zone: string;
  temperature: string;
  humidity: string;
  rainfallOutlook: string;
  diseaseRisks: DiseaseRiskAlert[];
  farmingTips: string[];
}
