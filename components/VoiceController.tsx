'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceControllerProps {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (val: boolean) => void;
  onSpeechInput: (transcript: string) => void;
  liveTranscript: string;
  setLiveTranscript: (text: string) => void;
}

export function VoiceController({
  isListening,
  setIsListening,
  isSpeaking,
  setIsSpeaking,
  onSpeechInput,
  liveTranscript,
  setLiveTranscript,
}: VoiceControllerProps) {
  const [synthesisVoiceType, setSynthesisVoiceType] = useState<'gemini' | 'browser'>('gemini');
  const [voiceVolume, setVoiceVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setLiveTranscript(currentText);

        if (finalTranscript.trim()) {
          onSpeechInput(finalTranscript.trim());
          setLiveTranscript('');
          recognition.stop();
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setIsListening, onSpeechInput, setLiveTranscript]);

  // Interrupt helper
  const interruptAssistant = useCallback(() => {
    // 1. Stop HTML5 audio element
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    // 2. Stop browser SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [setIsSpeaking]);

  const fallbackToBrowserSpeech = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();

      // Clean text for speech
      const clean = text
        .replace(/```[\s\S]*?```/g, 'Code block generated.')
        .replace(/[*_#`[\]()]/g, '')
        .slice(0, 350);

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = voiceVolume;

      // Pick best English voice
      const voices = window.speechSynthesis.getVoices();
      const jarvisVoice =
        voices.find(
          (v) =>
            v.name.includes('Daniel') ||
            v.name.includes('George') ||
            (v.lang.startsWith('en') && v.name.includes('Male'))
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (jarvisVoice) {
        utterance.voice = jarvisVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [setIsSpeaking, voiceVolume]
  );

  // Keyboard shortcut: ESC to interrupt assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSpeaking) {
        interruptAssistant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, interruptAssistant]);

  // Toggle listening
  const toggleListening = () => {
    if (isSpeaking) {
      interruptAssistant();
    }

    if (!recognitionRef.current) {
      alert(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or use keyboard input.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setLiveTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  };

  // Expose play function to parent via event or window helper
  useEffect(() => {
    (window as any).nexusSpeak = async (text: string) => {
      if (isMuted) return;

      // Stop previous audio
      interruptAssistant();
      setIsSpeaking(true);

      // Try Gemini TTS first if selected
      if (synthesisVoiceType === 'gemini') {
        try {
          const res = await fetch('/api/agent/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voiceName: 'Puck' }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.audioUrl) {
              const audio = new Audio(data.audioUrl);
              audio.volume = voiceVolume;
              activeAudioRef.current = audio;

              audio.onended = () => {
                setIsSpeaking(false);
                activeAudioRef.current = null;
              };

              audio.onerror = () => {
                fallbackToBrowserSpeech(text);
              };

              await audio.play();
              return;
            }
          }
        } catch (err) {
          console.warn('Gemini TTS error, falling back to browser speech:', err);
        }
      }

      // Fallback or browser mode
      fallbackToBrowserSpeech(text);
    };

    (window as any).nexusInterrupt = () => {
      interruptAssistant();
    };

    return () => {
      delete (window as any).nexusSpeak;
      delete (window as any).nexusInterrupt;
    };
  }, [isMuted, synthesisVoiceType, voiceVolume, interruptAssistant, setIsSpeaking, fallbackToBrowserSpeech]);

  return (
    <div className="flex items-center gap-3">
      {/* Speech Recognition Mic Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`relative p-2.5 sm:p-3 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
          isListening
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse'
            : 'bg-cyan-950/40 text-cyan-400 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
        }`}
        title={isListening ? 'Listening... click to stop' : 'Click to speak to NEXUS'}
      >
        {isListening ? (
          <Mic className="w-5 h-5 text-emerald-400" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>

      {/* Voice Mode Toggle (Gemini Neural TTS vs Local Browser) */}
      <div className="hidden sm:flex items-center bg-slate-900/80 border border-cyan-500/20 rounded-lg p-0.5 text-xs font-mono">
        <button
          type="button"
          onClick={() => setSynthesisVoiceType('gemini')}
          className={`px-2 py-1 rounded transition-colors ${
            synthesisVoiceType === 'gemini'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Uses Gemini 3.8 Flash Lite TTS neural voice"
        >
          Neural TTS
        </button>
        <button
          type="button"
          onClick={() => setSynthesisVoiceType('browser')}
          className={`px-2 py-1 rounded transition-colors ${
            synthesisVoiceType === 'browser'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Uses local browser zero-latency speech synthesis"
        >
          Fast Audio
        </button>
      </div>

      {/* Mute / Unmute Button */}
      <button
        type="button"
        onClick={() => {
          if (!isMuted && isSpeaking) {
            interruptAssistant();
          }
          setIsMuted(!isMuted);
        }}
        className="p-2 text-slate-400 hover:text-cyan-300 transition-colors"
        title={isMuted ? 'Voice output muted' : 'Voice output active'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
