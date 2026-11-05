import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Printer,
  BookmarkCheck,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  Info,
  Wheat,
} from 'lucide-react';
import { LanguageCode, ScanResult } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { speakText, stopSpeaking } from '../utils/speech';

interface ScanResultViewProps {
  result: ScanResult;
  language: LanguageCode;
  onReset: () => void;
  onAskAboutScan: (question: string) => void;
}

export const ScanResultView: React.FC<ScanResultViewProps> = ({
  result,
  language,
  onReset,
  onAskAboutScan,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const summary =
        result.audioSummaryText ||
        `${result.cropName}. ${result.problemIdentified}. ${result.severity} severity.`;
      speakText(
        summary,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveReport = () => {
    try {
      const existingRaw = localStorage.getItem('agrirakshak_saved_reports');
      const reports: ScanResult[] = existingRaw ? JSON.parse(existingRaw) : [];
      if (!reports.some((r) => r.id === result.id)) {
        localStorage.setItem(
          'agrirakshak_saved_reports',
          JSON.stringify([result, ...reports])
        );
      }
      setIsSaved(true);
    } catch (e) {
      console.warn('Failed to save report:', e);
    }
  };

  // Severity styling
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          icon: <AlertOctagon className="w-4 h-4 text-rose-700" />,
        };
      case 'medium':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-600',
          icon: <ShieldAlert className="w-4 h-4 text-amber-700" />,
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
        };
    }
  };

  const badge = getSeverityBadge(result.severity);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white p-4 rounded-2xl border border-stone-200">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.reScanBtn}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audio TTS button */}
          <button
            onClick={handleToggleVoice}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${
              isPlayingAudio
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t.stopAudio}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{t.listenAdvice}</span>
              </>
            )}
          </button>

          {/* Download/Print Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>{t.downloadReport}</span>
          </button>

          {/* Save to Dashboard Button */}
          <button
            onClick={handleSaveReport}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
            }`}
          >
            <BookmarkCheck className={`w-4 h-4 ${isSaved ? 'text-emerald-700' : 'text-stone-600'}`} />
            <span>{isSaved ? '✓ Saved' : t.saveToDashboard}</span>
          </button>

          {/* Ask AI in Chat */}
          <button
            onClick={() =>
              onAskAboutScan(
                `Tell me more about ${result.problemIdentified} in ${result.cropName}. What preventive measures should I take?`
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.askAboutThisScan}</span>
          </button>
        </div>
      </div>

      {/* Main Print / Inspection Report Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-10 space-y-8 print-card">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-stone-200">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <span className="font-semibold text-emerald-800 uppercase tracking-wide">
                AgriRakshak AI · {result.scanType.toUpperCase()} SCAN
              </span>
              <span>·</span>
              <span>{new Date(result.timestamp).toLocaleDateString()}</span>
              {result.location && (
                <>
                  <span>·</span>
                  <span>{result.location}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 text-balance">
              {result.problemIdentified}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-base font-bold text-emerald-800">
                {result.cropName}
              </span>
              {result.scientificName && (
                <span className="text-xs italic text-stone-500">
                  ({result.scientificName})
                </span>
              )}
            </div>
          </div>

          {/* Severity & Confidence Badges */}
          <div className="flex flex-row md:flex-col items-end gap-3 shrink-0">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-bold ${badge.bg}`}
            >
              {badge.icon}
              <span>
                {t.severity}: {result.severity}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {t.confidence}: <strong className="text-stone-900">{result.confidence}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Explanation Banner */}
        {result.confidenceExplanation && (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900">AI Visual Observation: </span>
              {result.confidenceExplanation}
            </div>
          </div>
        )}

        {/* 2-Column Overview: Photo preview + Immediate Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 flex items-center justify-center">
            <img
              src={result.imageUrl}
              alt={result.problemIdentified}
              className="w-full h-full max-h-80 object-contain"
            />
          </div>

          <div className="lg:col-span-7 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-base mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>{t.immediateActionTitle}</span>
              </div>
              <ul className="space-y-2 text-sm text-emerald-950 leading-relaxed">
                {result.immediateActions && result.immediateActions.length > 0 ? (
                  result.immediateActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))
                ) : (
                  <li>Isolate affected plants and reduce excessive overhead moisture.</li>
                )}
              </ul>
            </div>

            <div className="pt-3 border-t border-emerald-200/60 text-xs text-emerald-900 flex items-center justify-between">
              <span>🔊 Spoken audio summary available in {language.toUpperCase()}</span>
              <button
                onClick={handleToggleVoice}
                className="text-emerald-800 font-bold hover:underline"
              >
                {isPlayingAudio ? 'Stop Voice' : 'Play Voice'}
              </button>
            </div>
          </div>
        </div>

        {/* Symptoms and Possible Causes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visible Symptoms */}
          <div className="p-6 rounded-2xl border border-stone-200 bg-white space-y-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {t.symptomsTitle}
            </h3>
            <ul className="space-y-2 text-sm text-stone-700">
              {result.symptoms?.map((symptom, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-stone-400 mt-1">·</span>
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Causes */}
          <div className="p-6 rounded-2xl border border-stone-200 bg-white space-y-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-500" />
              {t.causesTitle}
            </h3>
            <ul className="space-y-2 text-sm text-stone-700">
              {result.possibleCauses?.map((cause, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-stone-400 mt-1">·</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Natural & IPM Control Options (Promoted First!) */}
        <div className="p-6 rounded-2xl border border-emerald-300 bg-emerald-50/40 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              🌿
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-base">
                {t.naturalControlTitle}
              </h3>
              <p className="text-xs text-emerald-800">
                Safe, zero-chemical, biological, and eco-friendly Indian farm remedies.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-stone-800">
            {result.naturalControl?.map((item, i) => (
              <li
                key={i}
                className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Verified Chemical Control with Strict Safety Discipline */}
        <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-stone-950 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                {t.chemicalControlTitle}
              </h3>
              <p className="text-xs text-stone-500">
                Only verified active ingredients conforming to CIB&RC standards. Never invent doses.
              </p>
            </div>
            {result.chemicalControl?.waitingPeriodDays && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>PHI: {result.chemicalControl.waitingPeriodDays}</span>
              </div>
            )}
          </div>

          {/* Recommended Verified Actives */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Verified Active Ingredients:
            </div>
            <ul className="space-y-2 text-sm text-stone-800">
              {result.chemicalControl?.recommendedActives &&
              result.chemicalControl.recommendedActives.length > 0 ? (
                result.chemicalControl.recommendedActives.map((active, i) => (
                  <li
                    key={i}
                    className="bg-white p-3 rounded-xl border border-stone-200 font-medium"
                  >
                    🧪 {active}
                  </li>
                ))
              ) : (
                <li className="text-stone-500 italic text-sm">
                  Consult nearest Krishi Vigyan Kendra (KVK) for specific chemical options.
                </li>
              )}
            </ul>
          </div>

          {/* PPE & Safety Gear Checklist */}
          {result.chemicalControl?.safetyGear &&
            result.chemicalControl.safetyGear.length > 0 && (
              <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Mandatory Protective Equipment (PPE):</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.chemicalControl.safetyGear.map((gear, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-amber-950 font-medium"
                    >
                      🛡️ {gear}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Statutory warning */}
          <div className="text-xs text-stone-500 leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
            ⚠️ <strong>Statutory Disclaimer:</strong>{' '}
            {result.chemicalControl?.labelWarning ||
              'Always adhere to the registered product label for precise dilution rates. Never spray against wind direction or during high noon.'}
          </div>
        </div>

        {/* Seed Scanner Specific Guidance & Germination Protocol */}
        {result.scanType === 'seed' && (
          <div className="p-6 rounded-2xl border-2 border-amber-300 bg-amber-50/30 space-y-4">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-700" />
              {t.seedGuidanceTitle}
            </h3>

            {/* Crucial limitation notice */}
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 text-xs sm:text-sm font-semibold">
              🚨 <strong>Crucial Seed Health Law:</strong>{' '}
              {result.seedGuidance?.limitationNotice ||
                'A photograph alone cannot verify genetic purity, internal seed-borne pathogens, or germination percentage. Always perform a rag-doll test and procure government/NSC/state-certified seed with genuine blue/green tags.'}
            </div>

            {/* Quality check & Certification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                <div className="font-bold text-stone-900 text-xs uppercase tracking-wider text-emerald-800">
                  Visual Quality Signs
                </div>
                <p className="text-stone-700 text-xs leading-relaxed">
                  {result.seedGuidance?.visualQualityCheck ||
                    'Uniform size, bright natural luster, absence of insect boreholes or fungal mold crusts.'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                <div className="font-bold text-stone-900 text-xs uppercase tracking-wider text-emerald-800">
                  Certified Seed Tags
                </div>
                <p className="text-stone-700 text-xs leading-relaxed">
                  {result.seedGuidance?.certifiedSeedAdvice ||
                    'Look for authentic National Seeds Corporation (NSC) or State Seed Certification agency labels (Blue tag = Certified; White tag = Foundation).'}
                </p>
              </div>
            </div>

            {/* 7-Day Germination Test Steps */}
            {result.seedGuidance?.germinationTestSteps && (
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900 text-sm">
                  Simple 7-Day Rag-Doll (Moist Cloth) Germination Test:
                </div>
                <ol className="space-y-1.5 text-xs text-stone-700 list-decimal list-inside">
                  {result.seedGuidance.germinationTestSteps.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Long-term Prevention */}
        {result.preventionMethods && result.preventionMethods.length > 0 && (
          <div className="p-6 rounded-2xl border border-stone-200 bg-white space-y-3">
            <h3 className="font-bold text-stone-900 text-base">
              {t.preventionTitle}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-stone-700">
              {result.preventionMethods.map((method, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expert Notice / Local KVK Footer */}
        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 leading-relaxed text-center">
          {t.expertNoticeText}
        </div>
      </div>
    </div>
  );
};
