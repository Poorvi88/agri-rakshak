import React, { useState } from 'react';
import { Sprout, Globe, Menu, X, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'scanner', label: t.navScanner },
    { id: 'advisor', label: t.navAdvisor },
    { id: 'chat', label: t.navChat },
    { id: 'dashboard', label: t.navDashboard },
    { id: 'how-it-works', label: t.navHowItWorks },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Strict single text element / lockup) */}
          <button
            onClick={() => handleNavClick('scanner')}
            className="flex items-center gap-2 text-left shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-emerald-950 whitespace-nowrap">
                AgriRakshak AI
              </span>
              <span className="text-[11px] font-medium text-emerald-700 whitespace-nowrap -mt-0.5">
                {t.tagline}
              </span>
            </div>
          </button>

          {/* Zone 2: Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-emerald-900 ${
                    isActive
                      ? 'text-emerald-800 font-semibold'
                      : 'text-stone-600'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language Selector & Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg border border-stone-200 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
              >
                <Globe className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-emerald-900">
                  {currentLangObj.nativeName}
                </span>
                <span className="text-stone-500 hidden sm:inline">
                  ({currentLangObj.name})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      {t.selectLanguage}
                    </div>
                    {/* Kannada & Hindi pinned prominently at top */}
                    <div className="p-1.5 border-b border-stone-100 mb-1 bg-emerald-50/50">
                      <div className="text-[11px] font-semibold text-emerald-800 px-2 py-0.5">
                        ಜನಪ್ರಿಯ / लोकप्रिय (Featured)
                      </div>
                      <button
                        onClick={() => {
                          setLanguage('kn');
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm transition-colors ${
                          language === 'kn'
                            ? 'bg-emerald-700 text-white font-semibold'
                            : 'hover:bg-emerald-100 text-stone-900 font-medium'
                        }`}
                      >
                        <span className="text-base font-bold">ಕನ್ನಡ</span>
                        <span className={language === 'kn' ? 'text-emerald-100 text-xs' : 'text-stone-500 text-xs'}>
                          Kannada
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('hi');
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm transition-colors mt-0.5 ${
                          language === 'hi'
                            ? 'bg-emerald-700 text-white font-semibold'
                            : 'hover:bg-emerald-100 text-stone-900 font-medium'
                        }`}
                      >
                        <span className="text-base font-bold">हिंदी</span>
                        <span className={language === 'hi' ? 'text-emerald-100 text-xs' : 'text-stone-500 text-xs'}>
                          Hindi
                        </span>
                      </button>
                    </div>

                    {/* Remaining Supported Indian Languages */}
                    <div className="px-1">
                      {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'kn' && l.code !== 'hi').map(
                        (langObj) => {
                          const isSel = language === langObj.code;
                          return (
                            <button
                              key={langObj.code}
                              onClick={() => {
                                setLanguage(langObj.code);
                                setLangMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm transition-colors ${
                                isSel
                                  ? 'bg-emerald-700 text-white font-semibold'
                                  : 'hover:bg-stone-100 text-stone-800'
                              }`}
                            >
                              <span className="font-semibold">{langObj.nativeName}</span>
                              <span
                                className={`text-xs ${
                                  isSel ? 'text-emerald-100' : 'text-stone-400'
                                }`}
                              >
                                {langObj.name}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Accordion */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-200 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
