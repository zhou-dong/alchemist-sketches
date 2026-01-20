import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseSpeechOptions {
  rate?: number;      // Speed: 0.1 to 10 (default: 0.9)
  pitch?: number;     // Pitch: 0 to 2 (default: 1)
  volume?: number;    // Volume: 0 to 1 (default: 1)
  lang?: string;      // Language: e.g., 'en-US' (default: browser default)
}

export interface UseSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  currentVoice: SpeechSynthesisVoice | null;
  /** 
   * Get the current voice at call-time (safe for use in callbacks/closures)
   * This avoids stale closure issues when voice loads asynchronously
   */
  getCurrentVoice: () => SpeechSynthesisVoice | null;
}

/**
 * Premium voice identifiers - these are known to be higher quality
 * Google voices are the best for naturalness
 */
const PREMIUM_VOICE_PATTERNS = [
  // Google voices (best quality)
  /^Google /i,
  // Windows neural voices
  /neural/i,
  /natural/i,
  // Microsoft Edge voices (high quality)
  /microsoft.*online/i,
  // Enhanced/Premium markers
  /premium/i,
  /enhanced/i,
  // Google's cloud voices
  /wavenet/i,
  // Note: macOS voices (Samantha, Alex, etc.) are NOT included
  // as they sound robotic compared to Google voices
];

/**
 * Known high-quality voice names by platform (ordered by priority)
 * Google voices are significantly better than macOS voices
 */
const PREFERRED_VOICES: { name: string; priority: number }[] = [
  // Chrome - Google voices (highest priority - most natural sounding)
  { name: 'Google US English', priority: 100 },
  { name: 'Google UK English Female', priority: 95 },
  { name: 'Google UK English Male', priority: 90 },
  // Windows 11 - Natural voices (good quality)
  { name: 'Microsoft Aria Online', priority: 80 },
  { name: 'Microsoft Jenny Online', priority: 75 },
  { name: 'Microsoft Guy Online', priority: 70 },
  // macOS voices - fallback only (sound robotic)
  { name: 'Samantha', priority: 10 },
  { name: 'Alex', priority: 9 },
  { name: 'Allison', priority: 8 },
  { name: 'Ava', priority: 7 },
  { name: 'Zoe', priority: 6 },
  { name: 'Tom', priority: 5 },
];

/**
 * Score a voice for quality - higher is better
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name;
  const lang = voice.lang;

  // HIGHEST PRIORITY: Google English voices get massive bonus
  // This ensures Google English voices are ALWAYS selected first if available
  const isGoogleVoice = /google/i.test(name);
  const isEnglish = lang.startsWith('en');

  if (isGoogleVoice && isEnglish) {
    score += 1000; // Guaranteed top priority
  }

  // Prefer English voices
  if (isEnglish) {
    score += 10;
    // Prefer US or UK English
    if (lang === 'en-US' || lang === 'en-GB') {
      score += 5;
    }
  }

  // Check if it's a known preferred voice (with priority bonus)
  const preferredMatch = PREFERRED_VOICES.find(pv => name.includes(pv.name));
  if (preferredMatch) {
    score += preferredMatch.priority;
  }

  // Extra bonus for Google voices (even non-English)
  if (isGoogleVoice) {
    score += 40;
  }

  // Check for premium patterns
  for (const pattern of PREMIUM_VOICE_PATTERNS) {
    if (pattern.test(name)) {
      score += 30;
      break;
    }
  }

  // Local service voices are often higher quality on desktop
  if (voice.localService) {
    score += 5;
  }

  // Penalize generic/basic voices
  if (/agnes|albert|bad news|bahh|bells|boing|bruce|bubbles|cellos|deranged|fred|good news|hysterical|junior|kathy|organ|princess|ralph|trinoids|whisper|zarvox/i.test(name)) {
    score -= 100;
  }

  return score;
}

/**
 * Get the best available voice from a list
 */
function getBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  // Score and sort voices
  const scored = voices.map(v => ({ voice: v, score: scoreVoice(v) }));
  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.voice ?? null;
}

/**
 * useSpeech - React hook for Web Speech API text-to-speech
 * 
 * @example
 * const { speak, stop, isSpeaking } = useSpeech({ rate: 0.9 });
 * speak("Hello, welcome to Theta Sketch!");
 */
export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
  const {
    rate = 0.9,
    pitch = 1,
    volume = 1,
    lang = 'en-US',
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Ref to always have access to the latest voice (for use in callbacks/closures)
  const currentVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();

      // Sort voices by quality score for the dropdown
      const sortedVoices = [...availableVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
      setVoices(sortedVoices);

      // Set default voice to the best available
      if (!currentVoice && availableVoices.length > 0) {
        const bestVoice = getBestVoice(availableVoices);
        if (bestVoice) {
          setCurrentVoice(bestVoice);
        }
      }
    };

    loadVoices();

    // Voices may load asynchronously
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported, currentVoice]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Speech synthesis is not supported in this browser');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    if (currentVoice) {
      utterance.voice = currentVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, lang, currentVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
    currentVoiceRef.current = voice;
  }, []);

  // Keep the ref in sync with state
  useEffect(() => {
    currentVoiceRef.current = currentVoice;
  }, [currentVoice]);

  // Getter function that always returns the latest voice (safe for callbacks)
  const getCurrentVoice = useCallback((): SpeechSynthesisVoice | null => {
    return currentVoiceRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setVoice,
    currentVoice,
    getCurrentVoice,
  };
}

