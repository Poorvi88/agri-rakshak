import React from 'react';
import {
  Layers,
  Camera,
  Cpu,
  FileCheck2,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Sprout,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HowItWorksProps {
  language: LanguageCode;
  onStartScanning: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  language,
  onStartScanning,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const steps = [
    {
      num: '01',
      icon: <Layers className="w-6 h-6 text-emerald-700" />,
      title: t.step1Title,
      desc: t.step1Desc,
    },
    {
      num: '02',
      icon: <Camera className="w-6 h-6 text-emerald-700" />,
      title: t.step2Title,
      desc: t.step2Desc,
    },
    {
      num: '03',
      icon: <Cpu className="w-6 h-6 text-emerald-700" />,
      title: t.step3Title,
      desc: t.step3Desc,
    },
    {
      num: '04',
      icon: <FileCheck2 className="w-6 h-6 text-emerald-700" />,
      title: t.step4Title,
      desc: t.step4Desc,
    },
    {
      num: '05',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-700" />,
      title: t.step5Title,
      desc: t.step5Desc,
    },
    {
      num: '06',
      icon: <MessageSquare className="w-6 h-6 text-emerald-700" />,
      title: t.step6Title,
      desc: t.step6Desc,
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Sprout className="w-4 h-4 text-emerald-700" />
          <span>Simple 6-Step Farmer Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          {t.howItWorksTitle}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {language === 'kn'
            ? 'ಕೇವಲ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಬಳಸಿ ಯಾವುದೇ ತಜ್ಞರಿಲ್ಲದೆ ನಿಮ್ಮ ಹೊಲದ ಬೆಳೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುವ ಸುಲಭ ವಿಧಾನ ಇಲ್ಲಿದೆ.'
            : language === 'hi'
            ? 'मोबाइल कैमरे की मदद से बिना किसी झंझट के फसल रोगों की पहचान और सही समाधान पाने का 6-चरणीय आसान तरीका।'
            : 'How Indian farmers can diagnose crop health, identify seed problems, and consult the AI farm doctor in 6 easy steps.'}
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-2xl font-black text-stone-200 tabular-nums">
                  {step.num}
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-lg leading-snug">
                {step.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-emerald-800 text-white shadow-lg space-y-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          {language === 'kn'
            ? 'ಇಂದೇ ನಿಮ್ಮ ಬೆಳೆಯ ಆರೋಗ್ಯ ಪರೀಕ್ಷಿಸಿ!'
            : language === 'hi'
            ? 'आज ही अपनी फसल की सेहत जांचें!'
            : 'Ready to Protect Your Crops Today?'}
        </h2>
        <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
          {language === 'kn'
            ? 'ಎಲೆ, ಬೆಳೆ ಅಥವಾ ಬೀಜಗಳ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಮಾದರಿ ಚಿತ್ರಗಳನ್ನು ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಿ.'
            : language === 'hi'
            ? 'पत्ती, फसल या बीज का फोटो अपलोड करें या तुरंत नमूना फोटो से जांचें।'
            : 'Upload a leaf, crop or seed photo or test with our sample pictures instantly.'}
        </p>
        <div>
          <button
            onClick={onStartScanning}
            className="px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-base shadow-md inline-flex items-center gap-2 active:scale-95 transition-transform"
          >
            <span>{t.scanNowBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
