import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Volume2,
  VolumeX,
  X,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { LanguageCode, ChatMessage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../utils/speech';

interface AskAgriChatProps {
  language: LanguageCode;
  initialQuestion?: string;
}

export const AskAgriChat: React.FC<AskAgriChatProps> = ({
  language,
  initialQuestion,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Welcome message in selected language
    const welcomeText =
      language === 'kn'
        ? 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು ಅಗ್ರಿರಕ್ಷಕ್ AI. ನಿಮ್ಮ ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ಫೋಟೋ ಕಳುಹಿಸಿ. ನಾನು ಕನ್ನಡದಲ್ಲೇ ಸರಳವಾಗಿ ಉತ್ತರಿಸುತ್ತೇನೆ.'
        : language === 'hi'
        ? 'नमस्ते किसान भाई! मैं आपका अग्रिरक्षक AI मित्र हूँ। अपनी फसल, बीज या कीट के बारे में कोई भी सवाल पूछें या फोटो भेजें। मैं आपकी भाषा में मदद करूँगा।'
        : 'Namaste Farmer! I am AgriRakshak AI, your dedicated crop and farm doctor. Ask any question about crop diseases, pests, seed selection, or soil health, or attach a photo.';

    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: welcomeText,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputText, setInputText] = useState(initialQuestion || '');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognizerRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
    };
  }, []);

  // Quick Questions in farmer's language
  const quickQuestions: Record<LanguageCode, string[]> = {
    kn: [
      'ಟೊಮೇಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿರುವುದಕ್ಕೆ ಕಾರಣವೇನು?',
      'ಭತ್ತದ ಬೆಳೆಯ ಬೆಂಕಿ ರೋಗ (Blast) ನಿಯಂತ್ರಿಸುವುದು ಹೇಗೆ?',
      'ಹತ್ತಿಯಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿಕೊರಕ ಹುಳು ತಡೆಯುವುದು ಹೇಗೆ?',
      'ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಬೀಜಗಳನ್ನು ಆಯ್ಕೆಮಾಡುವುದು ಹೇಗೆ?',
      'ಜೀವಮೃತ ಮತ್ತು ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ ಹೇಗೆ ತಯಾರಿಸಬೇಕು?',
      'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಸುಧಾರಿಸಲು ಸುಲಭ ಮಾರ್ಗಗಳು?',
    ],
    hi: [
      'टमाटर की पत्तियां पीली क्यों पड़ रही हैं?',
      'धान में ब्लास्ट या शीथ ब्लाइट का उपचार क्या है?',
      'कपास में गुलाबी सुंडी (Pink Bollworm) से बचाव?',
      'प्रमाणित गुणवत्ता वाले बीज की पहचान कैसे करें?',
      'घर पर जैविक कीटनाशक व नीम का अर्क कैसे बनाएं?',
      'मिट्टी की उर्वरता और स्वास्थ्य कैसे सुधारें?',
    ],
    en: [
      'Why are my tomato leaves turning yellow?',
      'How to control blast disease in paddy crop?',
      'How can I protect my cotton from pink bollworm?',
      'How do I select and test good quality certified seeds?',
      'What organic methods work best against sucking insects?',
      'How can I improve soil microbial health with Jeevamrutha?',
    ],
    te: [
      'టమోటా ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?',
      'వరిలో అగ్గి తెగులు నివారణ ఎలా?',
      'పత్తిలో గులాబీ రంగు పురుగు నివారణ ఎలా?',
      'నాణ్యమైన ధృవీకరించిన విత్తనాలను ఎలా గుర్తించాలి?',
    ],
    ta: [
      'தக்காளி இலைகள் ஏன் மஞ்சள் நிறமாக மாறுகின்றன?',
      'நெல் பயிரில் குலை நோய் கட்டுப்பாடு எப்படி?',
      'பருத்தியில் இளஞ்சிவப்பு காய்ப்புழுவை தடுப்பது எப்படி?',
    ],
    ml: [
      'തക്കാളിയുടെ ഇലകൾ മഞ്ഞനിറമാകുന്നത് എന്തുകൊണ്ട്?',
      'നെല്ലിലെ കുമിൾരോഗം എങ്ങനെ നിയന്ത്രിക്കാം?',
    ],
    mr: [
      'टोमॅटोची पाने पिवळी का पडत आहेत?',
      'भातावरील करपा रोगाचे नियंत्रण कसे करावे?',
      'कापसावरील बोंडअळी कशी रोखावी?',
    ],
    bn: [
      'টমেটো গাছের পাতা কেন হলুদ হচ্ছে?',
      'ধানের ব্লাস্ট রোগ নিয়ন্ত্রণের উপায় কী?',
    ],
    gu: [
      'ટામેટાના પાંદડા પીળા કેમ પડી રહ્યા છે?',
      'કપાસમાં ગુલાબી ઈયળથી રક્ષણ કેવી રીતે કરવું?',
    ],
    pa: [
      'ਟਮਾਟਰ ਦੇ ਪੱਤੇ ਪੀਲੇ ਕਿਉਂ ਪੈ ਰਹੇ ਹਨ?',
      'ਝੋਨੇ ਦੇ ਝੁਲਸ ਰੋਗ ਦਾ ਇਲਾਜ ਕੀ ਹੈ?',
    ],
  };

  const samplePrompts = quickQuestions[language] || quickQuestions.en;

  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    const recognizer = createSpeechRecognizer(
      language,
      (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      },
      (err) => {
        setSpeechError(`Voice input: ${err}`);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    speechRecognizerRef.current = recognizer;
    if (recognizer.isSupported) {
      setIsListening(true);
      recognizer.start();
    } else {
      setSpeechError('Voice input not supported in this browser. Please type your question.');
    }
  };

  const handleImageAttach = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if ((!textToSend.trim() && !attachedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      image: attachedImage || undefined,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
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
          image: userMsg.image,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.reply) {
        throw new Error(data.error || 'No answer received.');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak first sentence if farmer was using voice input
      if (isListening) {
        speakText(
          data.reply,
          language,
          () => setPlayingMessageId(assistantMsg.id),
          () => setPlayingMessageId(null)
        );
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text:
          language === 'kn'
            ? 'ಕ್ಷಮಿಸಿ, ಉತ್ತರಿಸುವಲ್ಲಿ ಸಮಸ್ಯೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
            : language === 'hi'
            ? 'क्षमा करें, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered an issue while generating advice. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeakMessage = (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      stopSpeaking();
      setPlayingMessageId(null);
    } else {
      stopSpeaking();
      speakText(
        msg.text,
        language,
        () => setPlayingMessageId(msg.id),
        () => setPlayingMessageId(null),
        () => setPlayingMessageId(null)
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[750px]">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <span>{t.chatTitle}</span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-xs text-stone-500">{t.chatSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {playingMessageId && (
            <button
              onClick={() => {
                stopSpeaking();
                setPlayingMessageId(null);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center gap-1"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Voice</span>
            </button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                  isUser ? 'bg-stone-800' : 'bg-emerald-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs space-y-2 ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none'
                }`}
              >
                {/* Image attachment preview if present */}
                {msg.image && (
                  <div className="rounded-xl overflow-hidden max-h-48 border border-stone-200">
                    <img
                      src={msg.image}
                      alt="Crop attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Speaker icon for assistant message */}
                {!isUser && (
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleToggleSpeakMessage(msg)}
                      className="text-stone-600 hover:text-emerald-800 p-1 flex items-center gap-1 font-medium"
                      title="Read aloud"
                    >
                      {playingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-700">Playing...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-stone-200 flex items-center gap-2 text-stone-600 text-sm shadow-xs">
              <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              <span>AgriRakshak AI is consulting agricultural knowledge...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 border-t border-stone-100 bg-white overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wide shrink-0">
          <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
          {t.suggestedQuestions}
        </span>
        {samplePrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-xs px-3 py-1.5 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-stone-700 border border-stone-200 transition-colors shrink-0 font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={attachedImage}
              alt="Attachment"
              className="w-10 h-10 object-cover rounded-lg border border-emerald-300"
            />
            <span className="text-xs font-semibold text-emerald-950">
              Crop photo attached to question
            </span>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="p-1 hover:bg-emerald-200 rounded-full text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice listening indicator or error */}
      {isListening && (
        <div className="px-4 py-1.5 bg-amber-100 text-amber-950 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-700" />
            <span>{t.listeningVoice}</span>
          </div>
          <button
            onClick={() => setIsListening(false)}
            className="underline text-amber-900"
          >
            Stop
          </button>
        </div>
      )}

      {speechError && (
        <div className="px-4 py-1.5 bg-rose-50 text-rose-800 text-xs flex items-center justify-between border-t border-rose-200">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Input Box and Action Controls */}
      <div className="p-3 sm:p-4 border-t border-stone-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* File input for photos in chat */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageAttach(e.target.files[0]);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 border border-stone-200 transition-colors shrink-0"
            title={t.attachPhoto}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-all shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-emerald-50 border-stone-200'
            }`}
            title={isListening ? 'Stop listening' : t.askVoiceBtn}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chatPlaceholder}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50 focus:bg-white"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedImage) || isLoading}
            className={`p-2.5 rounded-xl font-bold text-white flex items-center justify-center shrink-0 transition-all ${
              (!inputText.trim() && !attachedImage) || isLoading
                ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                : 'bg-emerald-700 hover:bg-emerald-800 shadow-md'
            }`}
            title={t.sendBtn}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
