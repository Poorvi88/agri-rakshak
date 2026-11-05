import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScannerSection } from './components/ScannerSection';
import { ScanResultView } from './components/ScanResultView';
import { PesticideAdvisor } from './components/PesticideAdvisor';
import { AskAgriChat } from './components/AskAgriChat';
import { FarmerDashboard } from './components/FarmerDashboard';
import { HowItWorks } from './components/HowItWorks';
import { LanguageCode, ScanType, ScanResult } from './types';
import { TRANSLATIONS } from './data/translations';
import { Phone, Sprout } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('kn'); // Default to Kannada with easy Hindi / English toggle
  const [currentTab, setCurrentTab] = useState<string>('scanner');
  const [activeScanType, setActiveScanType] = useState<ScanType>('leaf');
  const [activeScanResult, setActiveScanResult] = useState<ScanResult | null>(null);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string>('');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleScanComplete = (result: ScanResult) => {
    setActiveScanResult(result);
  };

  const handleAskAboutScan = (question: string) => {
    setChatInitialQuestion(question);
    setCurrentTab('chat');
  };

  const handleViewHistoricalResult = (result: ScanResult) => {
    setActiveScanResult(result);
    setCurrentTab('scanner');
  };

  const handleResetScan = () => {
    setActiveScanResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-600 selection:text-white">
      {/* Top Banner: Kisan Call Centre Toll-Free Helpline info */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] sm:text-xs py-1.5 px-4 no-print border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AgriRakshak AI</span>
            <span>·</span>
            <span>{t.tagline}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:18001801551"
              className="inline-flex items-center gap-1.5 hover:text-white font-semibold"
            >
              <Phone className="w-3 h-3 text-emerald-300" />
              <span>
                {language === 'kn'
                  ? 'ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: 1800-180-1551 (ಉಚಿತ)'
                  : language === 'hi'
                  ? 'किसान कॉल सेंटर: 1800-180-1551 (निःशुल्क)'
                  : 'Kisan Call Centre: 1800-180-1551 (Toll-free)'}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Strict 3-Zone Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          // If moving away from scanner, keep active result intact so they can return
        }}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Scanner Tab */}
        {currentTab === 'scanner' && (
          <>
            {activeScanResult ? (
              <ScanResultView
                result={activeScanResult}
                language={language}
                onReset={handleResetScan}
                onAskAboutScan={handleAskAboutScan}
              />
            ) : (
              <ScannerSection
                language={language}
                activeScanType={activeScanType}
                setActiveScanType={setActiveScanType}
                onScanComplete={handleScanComplete}
              />
            )}
          </>
        )}

        {/* Pesticide Advisor Tab */}
        {currentTab === 'advisor' && <PesticideAdvisor language={language} />}

        {/* Ask Agri AI Chat Tab */}
        {currentTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <AskAgriChat
              language={language}
              initialQuestion={chatInitialQuestion}
            />
          </div>
        )}

        {/* Farmer Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <FarmerDashboard
            language={language}
            onViewScanResult={handleViewHistoricalResult}
            onGoToScanner={() => {
              setActiveScanResult(null);
              setCurrentTab('scanner');
            }}
          />
        )}

        {/* How It Works Tab */}
        {currentTab === 'how-it-works' && (
          <HowItWorks
            language={language}
            onStartScanning={() => {
              setActiveScanResult(null);
              setCurrentTab('scanner');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-stone-900 text-base">
                  AgriRakshak AI
                </span>
                <p className="text-xs text-stone-500">
                  {t.tagline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
              <button
                onClick={() => setCurrentTab('scanner')}
                className="hover:text-emerald-800"
              >
                {t.navScanner}
              </button>
              <span>·</span>
              <button
                onClick={() => setCurrentTab('advisor')}
                className="hover:text-emerald-800"
              >
                {t.navAdvisor}
              </button>
              <span>·</span>
              <button
                onClick={() => setCurrentTab('chat')}
                className="hover:text-emerald-800"
              >
                {t.navChat}
              </button>
              <span>·</span>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="hover:text-emerald-800"
              >
                {t.navDashboard}
              </button>
              <span>·</span>
              <button
                onClick={() => setCurrentTab('how-it-works')}
                className="hover:text-emerald-800"
              >
                {t.navHowItWorks}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
            <p>
              Dedicated to the hardworking farmers of India. AI diagnostic suggestions must always be paired with local agricultural expert guidance.
            </p>
            <p>
              Powered by Google Gemini Vision & Soil-to-Plate Agro Intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
