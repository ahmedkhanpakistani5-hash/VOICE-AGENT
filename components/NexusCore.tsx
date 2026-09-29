'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AgentStatus } from '@/types/agent';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Cpu, Radio, Shield } from 'lucide-react';

interface NexusCoreProps {
  status: AgentStatus;
  isListening: boolean;
  isSpeaking: boolean;
  onCoreClick: () => void;
  onInterrupt: () => void;
  audioLevel?: number; // 0 to 100 for responsive soundwave
}

export function NexusCore({
  status,
  isListening,
  isSpeaking,
  onCoreClick,
  onInterrupt,
  audioLevel = 0,
}: NexusCoreProps) {
  // Audio spectrum visualizer bars
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 75, 90, 60, 85, 40, 65, 30]);

  useEffect(() => {
    if (status === 'speaking' || status === 'listening') {
      const interval = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 9 }, () => Math.floor(Math.random() * 65) + 25)
        );
      }, 120);
      return () => clearInterval(interval);
    } else if (status === 'thinking' || status === 'executing_tool') {
      const interval = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 9 }, (_, i) => 25 + Math.sin(Date.now() / 200 + i) * 20)
        );
      }, 80);
      return () => clearInterval(interval);
    }
  }, [status]);

  const activeWaveHeights = status === 'idle' ? [12, 16, 24, 28, 20, 26, 18, 14, 10] : waveHeights;

  // Color scheme based on state
  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return {
          label: 'VOICE RECEPTOR ACTIVE',
          subtext: 'NEXUS is listening... Speak clearly',
          primary: 'text-emerald-400',
          border: 'border-emerald-500/50',
          glow: 'rgba(16, 185, 129, 0.4)',
          accentBg: 'bg-emerald-500/10',
          ringSpeed: 4,
        };
      case 'thinking':
      case 'executing_tool':
        return {
          label: status === 'executing_tool' ? 'EXECUTING DIRECTIVE' : 'NEURAL PROCESSING',
          subtext: status === 'executing_tool' ? 'Orchestrating agent tools...' : 'Reasoning & computing response...',
          primary: 'text-amber-400',
          border: 'border-amber-500/50',
          glow: 'rgba(245, 158, 11, 0.4)',
          accentBg: 'bg-amber-500/10',
          ringSpeed: 2,
        };
      case 'speaking':
        return {
          label: 'VOCAL SYNTHESIS ACTIVE',
          subtext: 'Broadcasting response · Click to interrupt',
          primary: 'text-cyan-300',
          border: 'border-cyan-400/60',
          glow: 'rgba(6, 182, 212, 0.5)',
          accentBg: 'bg-cyan-500/15',
          ringSpeed: 6,
        };
      default:
        return {
          label: 'NEXUS CORE // ONLINE',
          subtext: 'System standby · Click core or speak to engage',
          primary: 'text-cyan-400',
          border: 'border-cyan-500/30',
          glow: 'rgba(0, 240, 255, 0.25)',
          accentBg: 'bg-cyan-500/5',
          ringSpeed: 20,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Background radial ambient aura */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none transition-all duration-700 blur-3xl opacity-40"
        style={{ background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)` }}
      />

      {/* Main Core Container */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Outermost Segmented HUD Ring (Clockwise) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: config.ringSpeed * 6,
            ease: 'linear',
          }}
          className={`absolute inset-0 rounded-full border border-dashed ${config.border} opacity-40 pointer-events-none`}
        />

        {/* Outer Ring with Cardinal Ticks (Counter-Clockwise) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: config.ringSpeed * 4,
            ease: 'linear',
          }}
          className="absolute inset-3 sm:inset-4 rounded-full border border-cyan-500/20 pointer-events-none"
        >
          {/* HUD Tech notches */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-cyan-400/80 shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-cyan-400/80 shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-3 bg-cyan-400/80 shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-3 bg-cyan-400/80 shadow-[0_0_8px_#00f0ff]" />
        </motion.div>

        {/* Arc Reactor Layer (Clockwise) */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: config.ringSpeed * 2.5,
            ease: 'linear',
          }}
          className="absolute inset-8 sm:inset-10 w-[calc(100%-4rem)] sm:w-[calc(100%-5rem)] h-[calc(100%-4rem)] sm:h-[calc(100%-5rem)] pointer-events-none"
          viewBox="0 0 100 100"
        >
          {/* Concentric high-tech arcs */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="14 10 28 8 36 12"
            className={`${config.primary} opacity-60 transition-colors duration-500`}
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 6 16 10"
            className="text-cyan-500/40"
          />
        </motion.svg>

        {/* Counter Arc Reactor Layer */}
        <motion.svg
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: config.ringSpeed * 3,
            ease: 'linear',
          }}
          className="absolute inset-12 sm:inset-14 w-[calc(100%-6rem)] sm:w-[calc(100%-7rem)] h-[calc(100%-6rem)] sm:h-[calc(100%-7rem)] pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="22 14 4 12"
            className={`${config.primary} opacity-70 transition-colors duration-500`}
          />
        </motion.svg>

        {/* Interactive Pulsing Core Button */}
        <motion.button
          onClick={isSpeaking ? onInterrupt : onCoreClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`group relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center backdrop-blur-md cursor-pointer transition-all duration-500 ${config.accentBg} ${config.border} border-2 shadow-[0_0_25px_${config.glow}]`}
          title={isSpeaking ? 'Click to interrupt' : isListening ? 'Click to stop listening' : 'Click to talk to NEXUS'}
        >
          {/* Inner Glow Center */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-b from-cyan-900/30 via-slate-950/80 to-black/90 pointer-events-none" />

          {/* Sound Wave Spectrum (when speaking or listening) */}
          <div className="relative z-20 flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2">
            {activeWaveHeights.map((h, idx) => (
              <motion.div
                key={idx}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className={`w-1 sm:w-1.5 rounded-full transition-colors duration-300 ${
                  status === 'speaking'
                    ? 'bg-gradient-to-t from-cyan-500 to-sky-200 shadow-[0_0_6px_#38bdf8]'
                    : status === 'listening'
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-200 shadow-[0_0_6px_#10b981]'
                    : status === 'thinking' || status === 'executing_tool'
                    ? 'bg-gradient-to-t from-amber-500 to-amber-200 shadow-[0_0_6px_#f59e0b]'
                    : 'bg-cyan-500/50'
                }`}
                style={{ maxHeight: '100%' }}
              />
            ))}
          </div>

          {/* Core Symbol / Action Icon */}
          <div className="relative z-20 mt-1 flex items-center gap-1">
            {isSpeaking ? (
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase flex items-center gap-1">
                <Volume2 className="w-3 h-3 animate-pulse" /> INTERRUPT
              </span>
            ) : isListening ? (
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                <Mic className="w-3 h-3 animate-bounce" /> LISTENING
              </span>
            ) : status === 'thinking' || status === 'executing_tool' ? (
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3 animate-spin" /> COMPUTING
              </span>
            ) : (
              <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                <Radio className="w-3 h-3" /> ENGAGE
              </span>
            )}
          </div>
        </motion.button>
      </div>

      {/* Futuristic Telemetry HUD status badge */}
      <div className="mt-4 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider">
          <span className={`w-2 h-2 rounded-full ${
            status === 'speaking' ? 'bg-cyan-400 animate-ping' :
            status === 'listening' ? 'bg-emerald-400 animate-ping' :
            status === 'thinking' || status === 'executing_tool' ? 'bg-amber-400 animate-ping' :
            'bg-cyan-500'
          }`} />
          <span className={`font-semibold ${config.primary} drop-shadow-[0_0_8px_${config.glow}]`}>
            {config.label}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 text-[11px]">24.8 kHz</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-sans max-w-sm">
          {config.subtext}
        </p>

        {/* Quick Interrupt banner when speaking */}
        {isSpeaking && (
          <motion.button
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onInterrupt}
            className="mt-2.5 px-3 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 text-xs font-mono rounded flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            <VolumeX className="w-3.5 h-3.5" /> Stop Speaking [ESC]
          </motion.button>
        )}
      </div>
    </div>
  );
}
