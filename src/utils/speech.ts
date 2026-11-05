import { LanguageCode } from '../types';

export const LANGUAGE_SPEECH_CODES: Record<LanguageCode, string> = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  en: 'en-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
};

// Text-to-Speech (TTS)
export function speakText(
  text: string,
  lang: LanguageCode,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    onError?.('Speech synthesis not supported');
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*#_`]/g, '').trim();
  if (!cleanText) return () => {};

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const speechCode = LANGUAGE_SPEECH_CODES[lang] || 'en-IN';
  utterance.lang = speechCode;
  utterance.rate = 0.95; // Slightly slower, clear pace for farmers
  utterance.pitch = 1.0;

  // Attempt to select an authentic native voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang.toLowerCase() === speechCode.toLowerCase() || v.lang.startsWith(lang)
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    onError?.(e);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    window.speechSynthesis.cancel();
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech Recognition (Speech-to-Text / Voice Input)
export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

export function createSpeechRecognizer(
  lang: LanguageCode,
  onResult: (transcript: string) => void,
  onError: (errorMsg: string) => void,
  onEnd: () => void
): SpeechRecognitionController {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      start: () => onError('Speech recognition is not supported in this browser.'),
      stop: () => {},
      isSupported: false,
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = LANGUAGE_SPEECH_CODES[lang] || 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError(event.error || 'Voice input error occurred.');
  };

  recognition.onend = () => {
    onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err: any) {
        console.warn('Error starting speech recognition:', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err: any) {
        console.warn('Error stopping speech recognition:', err);
      }
    },
    isSupported: true,
  };
}
