import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { INDIAN_STATES, COMMON_CROPS } from '../data/samples';

interface PesticideAdvisorProps {
  language: LanguageCode;
}

interface VerifiedPestRecord {
  id: string;
  crop: string;
  pestDisease: string;
  ipmCultural: string[];
  biological: string[];
  registeredActives: string[];
  phiDays: string;
  ppe: string[];
  precautions: string;
}

const VERIFIED_RECORDS: VerifiedPestRecord[] = [
  {
    id: 'paddy-blast',
    crop: 'Paddy / Rice (ಭತ್ತ / धान)',
    pestDisease: 'Blast Disease (Magnaporthe oryzae)',
    ipmCultural: [
      'Avoid high doses of nitrogenous fertilizers; split nitrogen into 3-4 top dressings.',
      'Maintain adequate water level in the field; do not let soil crack dry.',
      'Burn or compost stubbles from previously blast-infected paddy crops.',
    ],
    biological: [
      'Seed treatment with Pseudomonas fluorescens @ 10g/kg of seed.',
      'Foliar spray with Pseudomonas fluorescens @ 2.5 kg/ha at early tillering.',
    ],
    registeredActives: [
      'Tricyclazole 75% WP (Approved by CIB&RC for paddy blast)',
      'Isoprothiolane 40% EC',
      'Kasugamycin 3% SL',
    ],
    phiDays: '21 - 30 Days before harvest',
    ppe: ['Chemical-resistant gloves', 'N95 or particulate face mask', 'Full sleeve apron/boots'],
    precautions: 'Do not spray against wind. Avoid spraying when rain is forecasted within 4 hours.',
  },
  {
    id: 'cotton-pink-bollworm',
    crop: 'Cotton (ಹತ್ತಿ / कपास)',
    pestDisease: 'Pink Bollworm (Pectinophora gossypiella)',
    ipmCultural: [
      'Install Gossyplure pheromone traps @ 5 traps/acre for mass monitoring.',
      'Hand-pick and destroy rosette flowers containing larvae.',
      'Avoid continuous cotton monoculture; terminate crop after 140-150 days.',
    ],
    biological: [
      'Release Trichogramma bactrae egg parasitoid @ 60,000/acre.',
      'Spray 5% Neem Seed Kernel Extract (NSKE) or Neem oil 10,000 ppm.',
    ],
    registeredActives: [
      'Chlorantraniliprole 18.5% SC',
      'Emamectin Benzoate 5% SG',
      'Spinetoram 11.7% SC',
    ],
    phiDays: '14 - 20 Days',
    ppe: ['Safety goggles', 'Face shield/mask', 'Rubber nitrile gloves'],
    precautions: 'Spray in late evening when moths are active. Never use synthetic pyrethroids repeatedly.',
  },
  {
    id: 'tomato-early-blight',
    crop: 'Tomato (ಟೊಮೇಟೊ / टमाटर)',
    pestDisease: 'Early & Late Blight (Alternaria solani / Phytophthora)',
    ipmCultural: [
      'Stake plants and prune lower leaves touching moist soil.',
      'Use drip irrigation instead of sprinkler overhead splashing.',
      'Rotate with non-solanaceous crops (maize, pulses).',
    ],
    biological: [
      'Soil application of Trichoderma viride enriched farmyard manure.',
      'Foliar application of Bacillus subtilis formulations.',
    ],
    registeredActives: [
      'Mancozeb 75% WP (Standard contact fungicide)',
      'Copper Oxychloride 50% WP',
      'Azoxystrobin 23% SC',
    ],
    phiDays: '3 - 7 Days for table tomato harvest',
    ppe: ['Respirator mask', 'Waterproof gloves', 'Protective eyewear'],
    precautions: 'Maintain 7-day interval between harvest and consumption; wash harvested fruit thoroughly.',
  },
  {
    id: 'chilli-thrips',
    crop: 'Chilli / Pepper (ಮೆಣಸಿನಕಾಯಿ / मिर्च)',
    pestDisease: 'Black Thrips & Murda Leaf Curl Complex',
    ipmCultural: [
      'Install blue sticky traps (@ 25-30 traps/acre) at canopy level.',
      'Grow 2-3 rows of maize or sorghum as protective border crops around chilli plot.',
      'Avoid excess urea application which produces succulent leaves favored by thrips.',
    ],
    biological: [
      'Beauveria bassiana @ 5g/liter foliar spray in high humidity.',
      'Lecithocladium or Neem oil 1% spray at initial pest appearance.',
    ],
    registeredActives: [
      'Spinetoram 11.7% SC',
      'Cyantraniliprole 10.26% OD',
      'Fipronil 5% SC',
    ],
    phiDays: '5 - 7 Days',
    ppe: ['Mask', 'Gloves', 'Eye goggles'],
    precautions: 'Do not spray when honeybees are foraging in flowers during midday.',
  },
  {
    id: 'maize-fall-armyworm',
    crop: 'Maize / Corn (ಮೆಕ್ಕೆಜೋಳ / मक्का)',
    pestDisease: 'Fall Armyworm (Spodoptera frugiperda)',
    ipmCultural: [
      'Intercrop with cowpea or pigeonpea to attract natural predators.',
      'Deep summer ploughing to expose pupae to birds and sunlight.',
      'Place sand-ash mixture (9:1) into whorls of young plants.',
    ],
    biological: [
      'Metarhizium anisopliae or Beauveria bassiana @ 5g/liter.',
      'Release egg parasitoids Trichogramma pretiosum.',
    ],
    registeredActives: [
      'Chlorantraniliprole 18.5% SC directed into leaf whorls',
      'Spinetoram 11.7% SC',
      'Emamectin Benzoate 5% SG',
    ],
    phiDays: '21 Days before green cob harvest',
    ppe: ['Respirator/Mask', 'Long rubber gloves', 'Goggles'],
    precautions: 'Target spray specifically into central whorls early in morning.',
  },
];

export const PesticideAdvisor: React.FC<PesticideAdvisorProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Karnataka');
  const [customPest, setCustomPest] = useState('');
  const [isConsultingAI, setIsConsultingAI] = useState(false);
  const [customResult, setCustomResult] = useState<any | null>(null);

  const filteredRecords = VERIFIED_RECORDS.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.crop.toLowerCase().includes(q) ||
      rec.pestDisease.toLowerCase().includes(q) ||
      rec.registeredActives.some((a) => a.toLowerCase().includes(q))
    );
  });

  const handleConsultAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPest && !selectedCrop) return;

    setIsConsultingAI(true);
    setCustomResult(null);

    try {
      const response = await fetch('/api/pesticide-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: selectedCrop || 'Field Crop',
          targetIssue: customPest,
          language:
            language === 'kn'
              ? 'Kannada'
              : language === 'hi'
              ? 'Hindi'
              : language === 'te'
              ? 'Telugu'
              : language === 'ta'
              ? 'Tamil'
              : language === 'ml'
              ? 'Malayalam'
              : language === 'mr'
              ? 'Marathi'
              : language === 'bn'
              ? 'Bengali'
              : language === 'gu'
              ? 'Gujarati'
              : language === 'pa'
              ? 'Punjabi'
              : 'English',
          region: selectedRegion,
        }),
      });

      const data = await response.json();
      if (data.success && data.advisory) {
        setCustomResult(data.advisory);
      }
    } catch (err) {
      console.error('Failed to get pesticide advisory:', err);
    } finally {
      setIsConsultingAI(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <span>CIB&RC & ICAR Scientific Standards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t.pesticideAdvisorTitle}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          {t.pesticideAdvisorSubtitle}
        </p>

        {/* Golden Rule of Indian Agriculture Warning */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>{t.labelWarningTitle}:</span>
          </div>
          <p className="leading-relaxed">
            {language === 'kn'
              ? 'ಯಾವುದೇ ರಾಸಾಯನಿಕ ಕೀಟನಾಶಕವನ್ನು ಬಳಸುವ ಮುನ್ನ ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ (IPM), ಬೇವಿನ ಎಣ್ಣೆ ಅಥವಾ ಜೈವಿಕ ನಿಯಂತ್ರಣಕ್ಕೆ ಮೊದಲ ಆದ್ಯತೆ ನೀಡಿ. ಬಾಟಲಿ ಮೇಲಿನ ಲೇಬಲ್ ಅನುಮೋದಿತ ಪ್ರಮಾಣವನ್ನು ಮಾತ್ರ ಪಾಲಿಸಿ. ಸಮೀಪದ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK) ಅಥವಾ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದ ಸಲಹೆ ಪಡೆಯಿರಿ.'
              : language === 'hi'
              ? 'रासायनिक कीटनाशक के उपयोग से पूर्व हमेशा जैविक उपाय (नीम का तेल, फेरोमोन ट्रैप) अपनाएं। केवल पंजीकृत मात्रा का प्रयोग करें और उत्पाद के लेबल पर दी गई प्रतीक्षा अवधि (PHI) का कड़ाई से पालन करें।'
              : 'Prioritize Integrated Pest Management (IPM) and organic bio-inputs before synthetic chemicals. Never invent dosages. Adhere strictly to the registered label and consult your local Krishi Vigyan Kendra (KVK).'}
          </p>
        </div>
      </div>

      {/* Verified Crop Protection Database Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {language === 'kn' ? 'ಪರಿಶೀಲಿಸಿದ ಬೆಳೆ ರಕ್ಷಣೆ ಮಾರ್ಗದರ್ಶಿ' : language === 'hi' ? 'सत्यापित फसल सुरक्षा मार्गदर्शिका' : 'Verified Crop Protection Directory'}
            </h2>
            <p className="text-xs text-stone-500">
              Verified ICAR / CIB&RC active ingredients & non-chemical management for major crops
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t.searchCropPest}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    {rec.crop}
                  </span>
                  <h3 className="font-bold text-stone-900 text-base">
                    {rec.pestDisease}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{rec.phiDays}</span>
                </div>
              </div>

              {/* IPM / Non-Chemical Section */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                  🌿 <span>Non-Chemical & Cultural IPM:</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1 pl-4 list-disc">
                  {rec.ipmCultural.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Bio-control */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                  🦠 <span>Biological Agents (Neem / Trichoderma):</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1 pl-4 list-disc">
                  {rec.biological.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Registered Actives */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
                  🧪 <span>CIB&RC Registered Active Ingredients (Generic):</span>
                </div>
                <ul className="text-xs text-stone-800 space-y-1 pl-4 list-disc font-medium">
                  {rec.registeredActives.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* PPE & Precautions */}
              <div className="text-[11px] text-stone-600 space-y-1 bg-stone-100 p-2.5 rounded-lg border border-stone-200">
                <div>
                  <strong>{t.safetyEquipmentNeeded}:</strong> {rec.ppe.join(', ')}
                </div>
                <div>
                  <strong>Precaution:</strong> {rec.precautions}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom AI Pesticide Consult for Other Crops & Rare Pests */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <span>
              {language === 'kn' ? 'ಇನ್ನಿತರ ಬೆಳೆ ಅಥವಾ ಕೀಟದ ಕುರಿತು ತಜ್ಞ ಸಲಹೆ ಕೇಳಿ' : language === 'hi' ? 'अन्य फसल या कीट के लिए वैज्ञानिक परामर्श प्राप्त करें' : 'Ask Scientific Advisory for Other Crops & Pests'}
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Consult the AI agronomist for tailored non-chemical and registered pesticide guidance in your state.
          </p>
        </div>

        <form onSubmit={handleConsultAI} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Crop Name
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">Select Crop...</option>
                {COMMON_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Pest / Disease / Weed Problem
              </label>
              <input
                type="text"
                placeholder="e.g. Stem Borer, Downy Mildew, Aphids"
                value={customPest}
                onChange={(e) => setCustomPest(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                State / Agro-Zone
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={(!customPest && !selectedCrop) || isConsultingAI}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 ${
              (!customPest && !selectedCrop) || isConsultingAI
                ? 'bg-stone-300 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 shadow-md'
            }`}
          >
            {isConsultingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking CIB&RC Standards...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get Verified Advisory</span>
              </>
            )}
          </button>
        </form>

        {/* AI Advisory Output Card */}
        {customResult && (
          <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-300 space-y-4">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-base">
              <Info className="w-5 h-5 text-emerald-700" />
              <span>Scientific Advisory Generated:</span>
            </div>
            <div className="text-xs sm:text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
              {typeof customResult === 'string'
                ? customResult
                : JSON.stringify(customResult, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
