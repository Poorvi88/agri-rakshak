import React, { useState, useEffect } from 'react';
import {
  History,
  CloudSun,
  AlertTriangle,
  Lightbulb,
  FileText,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { LanguageCode, ScanResult, WeatherRiskReport } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { INDIAN_STATES } from '../data/samples';

interface FarmerDashboardProps {
  language: LanguageCode;
  onViewScanResult: (result: ScanResult) => void;
  onGoToScanner: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  language,
  onViewScanResult,
  onGoToScanner,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [savedReports, setSavedReports] = useState<ScanResult[]>([]);
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [weatherData, setWeatherData] = useState<WeatherRiskReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'saved' | 'weather'>('history');

  // Load localStorage history
  useEffect(() => {
    try {
      const histRaw = localStorage.getItem('agrirakshak_scan_history');
      if (histRaw) setHistory(JSON.parse(histRaw));

      const savedRaw = localStorage.getItem('agrirakshak_saved_reports');
      if (savedRaw) setSavedReports(JSON.parse(savedRaw));
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
  }, []);

  const loadWeather = async (stateName: string) => {
    setIsLoadingWeather(true);
    try {
      const res = await fetch(`/api/weather-advisories?state=${encodeURIComponent(stateName)}`);
      const data = await res.json();
      setWeatherData(data);
    } catch (e) {
      console.error('Weather load error:', e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedState);
  }, [selectedState]);

  const clearHistory = () => {
    if (window.confirm('Clear all scan history?')) {
      localStorage.removeItem('agrirakshak_scan_history');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Farm Records & Agro-Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
            {t.navDashboard}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Track past crop scans, view saved reports, and monitor weather-triggered disease outbreaks.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.recentScans} ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'saved'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Saved Reports ({savedReports.length})
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'weather'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.weatherAlerts}
          </button>
        </div>
      </div>

      {/* Tab 1: Scan History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h2 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <span>{t.recentScans}</span>
            </h2>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                {t.noScansYet}
              </p>
              <button
                onClick={onGoToScanner}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.scanNowBtn}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.problemIdentified}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase">
                        {item.cropName} · {item.scanType}
                      </span>
                      <h3 className="font-bold text-stone-900 text-sm truncate">
                        {item.problemIdentified}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        item.severity === 'Critical' || item.severity === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : item.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.severity}
                    </span>

                    <button
                      onClick={() => onViewScanResult(item)}
                      className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.viewReport}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Reports */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-bold text-stone-900 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>Saved Crop Protection Reports</span>
          </h2>

          {savedReports.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              No reports bookmarked yet. When you scan a crop, click "Save to Dashboard" to keep it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedReports.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.problemIdentified}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase">
                        {item.cropName}
                      </span>
                      <h3 className="font-bold text-stone-900 text-sm truncate">
                        {item.problemIdentified}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {item.audioSummaryText}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex justify-end">
                    <button
                      onClick={() => onViewScanResult(item)}
                      className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Full Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Weather-Based Agro-meteorological Alerts */}
      {activeTab === 'weather' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-600" />
                <span>{t.weatherAlerts}</span>
              </h2>
              <p className="text-xs text-stone-500">
                Weather parameters, relative humidity, and pathogen surge models for Indian agro-zones.
              </p>
            </div>

            {/* State selection */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 text-sm bg-stone-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={() => loadWeather(selectedState)}
                className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {weatherData && (
            <div className="space-y-6">
              {/* Weather Snapshot Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-xs text-stone-500 uppercase font-semibold">Agro-Climatic Zone</div>
                  <div className="text-sm font-bold text-stone-900 mt-1">{weatherData.zone}</div>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-xs text-stone-500 uppercase font-semibold">Temperature & Humidity</div>
                  <div className="text-lg font-bold text-stone-900 mt-1">
                    {weatherData.temperature} · {weatherData.humidity} RH
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-xs text-stone-500 uppercase font-semibold">Rainfall & Dew Outlook</div>
                  <div className="text-xs font-semibold text-emerald-800 mt-1">
                    {weatherData.rainfallOutlook}
                  </div>
                </div>
              </div>

              {/* Active Disease Risks List */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Forecasted Pathogen & Pest Pressures:</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weatherData.diseaseRisks?.map((risk, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl border bg-white shadow-xs space-y-2 border-stone-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 uppercase">
                          {risk.crop}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            risk.riskLevel === 'Critical' || risk.riskLevel === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {risk.riskLevel} Risk
                        </span>
                      </div>
                      <div className="font-bold text-stone-950 text-sm">
                        {risk.disease}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {risk.advisory}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seasonal Farming Tips */}
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  <span>{t.farmingTips}:</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-emerald-950">
                  {weatherData.farmingTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
