import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Leaf,
  Wheat,
  Sprout,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { LanguageCode, ScanType, ScanResult } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { SAMPLE_SCANS, COMMON_CROPS, INDIAN_STATES, HERO_IMAGE } from '../data/samples';

interface ScannerSectionProps {
  language: LanguageCode;
  onScanComplete: (result: ScanResult) => void;
  activeScanType: ScanType;
  setActiveScanType: (type: ScanType) => void;
}

export const ScannerSection: React.FC<ScannerSectionProps> = ({
  language,
  onScanComplete,
  activeScanType,
  setActiveScanType,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (imagePath: string, crop: string) => {
    setErrorMessage(null);
    setSelectedCrop(crop);
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      // Fallback
      setSelectedImage(imagePath);
    }
  };

  const executeScan = async () => {
    if (!selectedImage) {
      setErrorMessage('Please capture or upload a crop photo first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        image: selectedImage,
        scanType: activeScanType,
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
        cropHint: selectedCrop,
        location: selectedState,
      };

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'Unable to analyze image.');
      }

      const scanResult: ScanResult = {
        id: `scan-${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: selectedImage,
        scanType: activeScanType,
        cropName: data.result.cropName || selectedCrop || 'Crop',
        problemIdentified: data.result.problemIdentified || 'Analysis Complete',
        scientificName: data.result.scientificName || 'Botanical inspection',
        severity: data.result.severity || 'Medium',
        confidence: data.result.confidence || 'High',
        confidenceExplanation: data.result.confidenceExplanation || '',
        symptoms: data.result.symptoms || [],
        possibleCauses: data.result.possibleCauses || [],
        immediateActions: data.result.immediateActions || [],
        naturalControl: data.result.naturalControl || [],
        chemicalControl: data.result.chemicalControl || {
          recommendedActives: [],
          safetyGear: [],
          waitingPeriodDays: 'Follow label',
          labelWarning: 'Read container label',
        },
        preventionMethods: data.result.preventionMethods || [],
        seedGuidance: data.result.seedGuidance,
        audioSummaryText: data.result.audioSummaryText || '',
        expertAdviceNotice: data.result.expertAdviceNotice || '',
        location: selectedState,
      };

      // Save to localStorage scan history
      try {
        const existingRaw = localStorage.getItem('agrirakshak_scan_history');
        const history: ScanResult[] = existingRaw ? JSON.parse(existingRaw) : [];
        const updated = [scanResult, ...history.slice(0, 19)]; // keep 20
        localStorage.setItem('agrirakshak_scan_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }

      onScanComplete(scanResult);
    } catch (err: any) {
      console.error('Scan failed:', err);
      setErrorMessage(err.message || 'Image analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScannerTabDesc = () => {
    switch (activeScanType) {
      case 'leaf':
        return t.leafScanDesc;
      case 'crop':
        return t.cropScanDesc;
      case 'seed':
        return t.seedScanDesc;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Strip with Indian Agricultural Context */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200 bg-stone-900 text-white">
        <img
          src={HERO_IMAGE}
          alt="Indian Agricultural Farmland"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-100 text-xs font-semibold backdrop-blur-sm border border-emerald-600/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Doctor for Indian Agriculture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            {t.tagline}
          </h1>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
            {language === 'kn'
              ? 'ನಿಮ್ಮ ಜಮೀನಿನ ಬೆಳೆ ಅಥವಾ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ. ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯೊಂದಿಗೆ ರೋಗ, ಕೀಟ ಮತ್ತು ಬೀಜದ ಗುಣಮಟ್ಟವನ್ನು ತಕ್ಷಣ ಪತ್ತೆಹಚ್ಚಿ ಸುರಕ್ಷಿತ ಪರಿಹಾರ ಪಡೆಯಿರಿ.'
              : language === 'hi'
              ? 'अपनी फसल की पत्ती या खेत की तस्वीर लें। जेमिनी AI से रोग, कीट व बीज की सटीक जांच कराएं और सुरक्षित रोकथाम की सलाह पाएं।'
              : 'Capture a photo of your leaf, crop or seeds. Instant diagnosis of crop diseases, visible pests and seed quality with safe farmer guidance.'}
          </p>
        </div>
      </div>

      {/* Main Scanner Workspace */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-6">
        {/* Step 1: Scan Mode Selector (3 Clear Options) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold uppercase tracking-wider text-stone-500">
              1. {language === 'kn' ? 'ಸ್ಕ್ಯಾನ್ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ' : language === 'hi' ? 'स्कैन विकल्प चुनें' : 'Choose Scanning Option'}
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Leaf Scanner Button */}
            <button
              type="button"
              onClick={() => {
                setActiveScanType('leaf');
                setSelectedImage(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                activeScanType === 'leaf'
                  ? 'border-emerald-700 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-700'
                  : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  activeScanType === 'leaf'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-stone-900 text-base">{t.leafScanner}</div>
                <div className="text-xs text-stone-500">
                  {language === 'kn' ? 'ಚುಕ್ಕೆ, ಹಳದಿ, ಸುಟ್ಟ ಎಲೆ' : language === 'hi' ? 'पत्ती धब्बा व कीट' : 'Leaf spots, pests & chlorosis'}
                </div>
              </div>
            </button>

            {/* Crop Scanner Button */}
            <button
              type="button"
              onClick={() => {
                setActiveScanType('crop');
                setSelectedImage(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                activeScanType === 'crop'
                  ? 'border-emerald-700 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-700'
                  : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  activeScanType === 'crop'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-stone-900 text-base">{t.cropScanner}</div>
                <div className="text-xs text-stone-500">
                  {language === 'kn' ? 'ಜಮೀನಿನ ಗಿಡಗಳು, ಬಾಡುವಿಕೆ' : language === 'hi' ? 'पूरा खेत व मुरझाना' : 'Whole plant & field canopy'}
                </div>
              </div>
            </button>

            {/* Seed Scanner Button */}
            <button
              type="button"
              onClick={() => {
                setActiveScanType('seed');
                setSelectedImage(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                activeScanType === 'seed'
                  ? 'border-emerald-700 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-700'
                  : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  activeScanType === 'seed'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <Wheat className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-stone-900 text-base">{t.seedScanner}</div>
                <div className="text-xs text-stone-500">
                  {language === 'kn' ? 'ಬೀಜ ಹಾನಿ, ಮೊಳಕೆ ಪರೀಕ್ಷೆ' : language === 'hi' ? 'बीज क्षति व अंकुरण' : 'Seed damage & germination test'}
                </div>
              </div>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            📌 {getScannerTabDesc()}
          </p>
        </div>

        {/* Step 2: Crop Details (Optional hints for localized precision) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              {t.selectCropOptional}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">
                {language === 'kn' ? '-- ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ (ಐಚ್ಛಿಕ) --' : language === 'hi' ? '-- फसल चुनें (वैकल्पिक) --' : '-- Choose Crop (Optional) --'}
              </option>
              {COMMON_CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              {t.selectState}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Photo Capture / Upload Zone */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">
            2. {language === 'kn' ? 'ಫೋಟೋ ಸೆರೆಹಿಡಿಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : language === 'hi' ? 'फोटो लें या अपलोड करें' : 'Capture or Upload Photo'}
          </label>

          {/* Hidden native inputs */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
              }
            }}
          />
          {/* Direct Camera Trigger */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
              }
            }}
          />

          {!selectedImage ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-3xl p-6 sm:p-10 text-center bg-stone-50 hover:bg-emerald-50/20 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">
                    {t.dragOrClick}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    {language === 'kn'
                      ? 'ಉತ್ತಮ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಹಗಲಿನ ಬೆಳಕಿನಲ್ಲಿ ಸ್ಪಷ್ಟ ಚಿತ್ರ ತೆಗೆದುಕೊಳ್ಳಿ.'
                      : language === 'hi'
                      ? 'सटीक परिणाम के लिए दिन की रोशनी में साफ फोटो लें।'
                      : 'Capture in natural daylight for optimal visual detection.'}
                  </p>
                </div>

                {/* Big Action Buttons for Farmers */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{t.takePhoto}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Upload className="w-5 h-5 text-stone-600" />
                    <span>{t.uploadPhoto}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900">
              <div className="aspect-video sm:aspect-[21/9] max-h-96 w-full flex items-center justify-center bg-black/80">
                <img
                  src={selectedImage}
                  alt="Crop preview"
                  className="max-h-96 w-full object-contain"
                />
              </div>

              {/* Action Toolbar on image */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'kn' ? 'ಬದಲಾಯಿಸಿ' : language === 'hi' ? 'बदलें' : 'Change'}</span>
                </button>
              </div>

              <div className="p-3 bg-stone-800 text-white text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {language === 'kn' ? 'ಚಿತ್ರ ಸಿದ್ಧವಾಗಿದೆ' : language === 'hi' ? 'तस्वीर तैयार है' : 'Photo ready for inspection'}
                </span>
                <span className="text-stone-300">
                  {activeScanType.toUpperCase()} MODE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Selector (Instant Test feature for Evaluators & Farmers) */}
        <div className="pt-2 border-t border-stone-100">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            💡 {t.trySample}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SAMPLE_SCANS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setActiveScanType(sample.type);
                  handleSelectSample(sample.imagePath, sample.crop);
                }}
                className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/50 text-left transition-colors group"
              >
                <img
                  src={sample.imagePath}
                  alt={sample.title}
                  className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-900">
                    {sample.crop}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {sample.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold">
                {language === 'kn' ? 'ದೋಷ:' : language === 'hi' ? 'समस्या:' : 'Notice:'}{' '}
              </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Primary Scan Button */}
        <div>
          <button
            type="button"
            disabled={!selectedImage || isLoading}
            onClick={executeScan}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all ${
              !selectedImage || isLoading
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t.analyzingImage}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{t.scanNowBtn}</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>

          {isLoading && (
            <p className="text-center text-xs text-stone-500 mt-2 animate-pulse">
              {t.analyzingSubtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
