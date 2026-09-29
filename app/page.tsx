'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Terminal,
  Activity,
  Cpu,
  Brain,
  Layers,
  Shield,
  Volume2,
  VolumeX,
  Radio,
  FileCode,
  LayoutDashboard,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

import {
  AgentStatus,
  Message,
  MemoryItem,
  TaskItem,
  NoteItem,
  ActivityLogEntry,
  SystemTelemetry,
} from '@/types/agent';
import { NexusCore } from '@/components/NexusCore';
import { VoiceController } from '@/components/VoiceController';
import { ChatStream } from '@/components/ChatStream';
import { SystemDashboard } from '@/components/SystemDashboard';
import { ExamplePrompts } from '@/components/ExamplePrompts';
import { DocumentModal } from '@/components/DocumentModal';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';

const INITIAL_SESSION_TIMESTAMP = '2026-09-29T18:00:00.000Z';

export default function NexusApp() {
  // Agent core status
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // User input & speech transcript
  const [inputPrompt, setInputPrompt] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');

  // Drawers and Modals
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [showComparisonMatrix, setShowComparisonMatrix] = useState(false);

  // System Telemetry
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    status: 'idle',
    coreTemperature: 36.4,
    neuralLoad: 18,
    activeToolsCount: 7,
    latencyMs: 340,
    sessionDurationSec: 0,
  });

  // Short-term Memory Bank
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 'mem-default-1',
      key: 'Hackathon Mission',
      value: 'Autonomous multi-step AI operating system with voice interaction and tool execution',
      category: 'context',
      timestamp: INITIAL_SESSION_TIMESTAMP,
    },
    {
      id: 'mem-default-2',
      key: 'Project Target',
      value: 'Winning production prototype for AI Studio Hackathon 2026',
      category: 'fact',
      timestamp: INITIAL_SESSION_TIMESTAMP,
    },
  ]);

  // Tasks Matrix
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: 'Initialize NEXUS neural operating engine',
      completed: true,
      priority: 'high',
      createdAt: INITIAL_SESSION_TIMESTAMP,
    },
    {
      id: 'task-2',
      title: 'Verify live weather, math, search, and memory tools',
      completed: true,
      priority: 'medium',
      createdAt: INITIAL_SESSION_TIMESTAMP,
    },
    {
      id: 'task-3',
      title: 'Run hackathon agent framework benchmark demo',
      completed: false,
      priority: 'high',
      dueDate: 'Today',
      createdAt: INITIAL_SESSION_TIMESTAMP,
    },
  ]);

  // Notes & Scratchpad
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      title: 'NEXUS Architecture Overview',
      content: 'Multi-turn agent loop powered by Gemini 3.8 Flash with tool grounding, real-time speech, and cognitive persistence.',
      tags: ['architecture', 'gemini'],
      updatedAt: INITIAL_SESSION_TIMESTAMP,
    },
  ]);

  // System Activity Stream
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([
    {
      id: 'log-1',
      timestamp: INITIAL_SESSION_TIMESTAMP,
      type: 'agent_start',
      message: 'NEXUS Autonomous Core v4.2 initialized and standing by.',
      detail: 'Sensors online · Speech recognition & Neural TTS verified.',
    },
  ]);

  // Messages History
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Greetings, operator. NEXUS is fully operational. All cognitive pipelines, live weather sensors, web search grounding, arithmetic evaluators, and neural speech synthesis are synchronized. How may I assist your mission today?',
      timestamp: INITIAL_SESSION_TIMESTAMP,
      executionMeta: {
        model: 'gemini-3.8-flash',
        durationMs: 140,
      },
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync telemetry status
  useEffect(() => {
    setTelemetry((prev) => ({
      ...prev,
      status: isSpeaking
        ? 'speaking'
        : isListening
        ? 'listening'
        : isProcessing
        ? 'thinking'
        : 'idle',
      neuralLoad: isProcessing ? 84 : isSpeaking ? 42 : isListening ? 38 : 14,
    }));
  }, [isSpeaking, isListening, isProcessing]);

  // Auto-scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, liveTranscript]);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        sessionDurationSec: prev.sessionDurationSec + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Log activity helper
  const addLog = useCallback(
    (type: ActivityLogEntry['type'], message: string, detail?: string) => {
      setActivityLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          type,
          message,
          detail,
        },
      ]);
    },
    []
  );

  // Interruption handler
  const handleInterrupt = useCallback(() => {
    if ((window as any).nexusInterrupt) {
      (window as any).nexusInterrupt();
    }
    setIsSpeaking(false);
    setStatus('idle');
    addLog('system_alert', 'Vocal synthesis interrupted by operator directive.');
  }, [addLog]);

  // Trigger vocal speech
  const handleSpeak = useCallback((text: string) => {
    if ((window as any).nexusSpeak) {
      (window as any).nexusSpeak(text);
    }
  }, []);

  // Main Submit Handler
  const handleExecutePrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isProcessing) return;

    // Stop speaking if assistant was talking
    if (isSpeaking) {
      handleInterrupt();
    }

    setInputPrompt('');
    setLiveTranscript('');
    setIsProcessing(true);
    setStatus('thinking');

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    addLog('agent_start', `Operator command dispatched: "${trimmed.slice(0, 45)}..."`);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          memories,
          tasks,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent gateway returned ${response.status}`);
      }

      const data = await response.json();

      // Commit any new memories extracted by NEXUS
      if (data.newMemories && data.newMemories.length > 0) {
        setMemories((prev) => [...prev, ...data.newMemories]);
        data.newMemories.forEach((m: MemoryItem) => {
          addLog('memory_update', `Cognitive Memory Committed: [${m.key}]`, m.value);
        });
      }

      // Commit any new tasks created
      if (data.newTasks && data.newTasks.length > 0) {
        setTasks((prev) => [...prev, ...data.newTasks]);
        data.newTasks.forEach((t: TaskItem) => {
          addLog('tool_call', `Task directive scheduled: "${t.title}"`);
        });
      }

      // Commit any notes
      if (data.newNotes && data.newNotes.length > 0) {
        setNotes((prev) => [...prev, ...data.newNotes]);
      }

      // Log tool calls
      if (data.toolCalls && data.toolCalls.length > 0) {
        data.toolCalls.forEach((tc: any) => {
          addLog('tool_finish', `Tool executed: ${tc.displayName || tc.name}`, `${tc.executionTimeMs || 0}ms`);
        });
      }

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Directive acknowledged, sir.',
        timestamp: new Date().toISOString(),
        toolCalls: data.toolCalls,
        planSteps: data.planSteps,
        executionMeta: data.executionMeta,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
      setStatus('speaking');

      // Vocalize response automatically
      handleSpeak(data.text);
    } catch (err: any) {
      console.error('Execution error:', err);
      setIsProcessing(false);
      setStatus('idle');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Operational anomaly detected: ${err.message}. Cognitive core restored and awaiting input.`,
          timestamp: new Date().toISOString(),
        },
      ]);
      addLog('system_alert', `Error: ${err.message}`);
    }
  };

  // Hackathon Autonomous Research Demo Flow
  const handleTriggerHackathonDemo = async () => {
    if (isProcessing) return;
    if (isSpeaking) handleInterrupt();

    setIsProcessing(true);
    setStatus('thinking');
    setShowComparisonMatrix(true);

    const demoPrompt =
      'Research the latest AI agent frameworks, compare them, and give me a recommendation for my hackathon project.';

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: demoPrompt,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    addLog('planning', 'Initiated Autonomous Hackathon Framework Benchmark Pipeline.');

    try {
      const res = await fetch('/api/agent/hackathon-demo', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Demo pipeline error');

      const data = await res.json();

      const assistantMsg: Message = {
        id: `demo-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toISOString(),
        planSteps: data.planSteps,
        toolCalls: data.toolCalls,
        executionMeta: data.executionMeta,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
      setStatus('speaking');

      const summarySpoken =
        'Research complete, sir. I have benchmarked Google GenAI SDK, LangGraph, CrewAI, and AutoGen. For your hackathon, I strongly recommend the Google GenAI SDK with Next.js for maximum velocity and native multimodal capabilities. Detailed decision matrix is now projected on your HUD.';
      handleSpeak(summarySpoken);
    } catch (err: any) {
      setIsProcessing(false);
      setStatus('idle');
      console.error(err);
    }
  };

  // Document & Code Analysis Handler
  const handleDocumentAnalysis = async (
    content: string,
    mode: 'explain_code' | 'summarize' | 'analyze',
    title: string
  ) => {
    setIsDocModalOpen(false);
    setIsProcessing(true);
    setStatus('thinking');

    const promptText = `Please ${
      mode === 'explain_code' ? 'analyze and explain the code for' : 'summarize the document'
    } "${title}":\n\n${content}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `[Inspecting ${title} (${mode})]\n${content.slice(0, 200)}...`,
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch('/api/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode, title }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `asst-doc-${Date.now()}`,
        role: 'assistant',
        content: data.result || 'Analysis concluded.',
        timestamp: new Date().toISOString(),
        planSteps: [
          {
            id: 'doc-step-1',
            stepNumber: 1,
            title: `Document Parse & AST Inspection: ${title}`,
            description: `Evaluated ${content.length} characters using Gemini neural reasoning.`,
            status: 'completed',
          },
        ],
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
      setStatus('speaking');
      handleSpeak(data.result);
    } catch (err: any) {
      setIsProcessing(false);
      setStatus('idle');
    }
  };

  // Reset conversation
  const handleResetSession = () => {
    handleInterrupt();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'System re-indexed. Cognitive core ready for new mission parameters.',
        timestamp: new Date().toISOString(),
      },
    ]);
    addLog('agent_start', 'Session history reset by operator.');
  };

  const currentActiveStatus = isSpeaking
    ? 'speaking'
    : isListening
    ? 'listening'
    : isProcessing
    ? 'thinking'
    : 'idle';

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Cybernetic HUD Grid & Radial Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Radial cyan atmospheric glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-600/10 via-blue-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl" />
      </div>

      {/* Top Futuristic Command Header */}
      <header className="relative z-20 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold tracking-widest text-white">
                  NEXUS
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-500/30 rounded">
                  OS v4.2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Multimodal Autonomous AI Operating System
              </p>
            </div>
          </div>

          {/* Center Telemetry Readout (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CORE: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>LOAD: {telemetry.neuralLoad}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span>MEMORY: {memories.length} ITEMS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>LATENCY: {telemetry.latencyMs}MS</span>
            </div>
          </div>

          {/* Action Tools & Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset Dialogue */}
            <button
              type="button"
              onClick={handleResetSession}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800 transition-colors"
              title="Reset conversation session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Diagnostic Sidebar Trigger */}
            <button
              type="button"
              onClick={() => setIsDashboardOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)] cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">System HUD</span>
              <span className="text-[10px] bg-cyan-500/20 px-1 rounded text-cyan-300">
                {memories.length + tasks.filter((t) => !t.completed).length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interface Content Area */}
      <div className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Hero Section: Animated AI Core & State Indicator */}
        <section className="flex flex-col items-center justify-center pt-2 pb-6">
          <NexusCore
            status={currentActiveStatus}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onCoreClick={() => {
              if (isSpeaking) {
                handleInterrupt();
              } else {
                // Focus command input or trigger voice
                const inputEl = document.getElementById('nexus-cmd-input');
                inputEl?.focus();
              }
            }}
            onInterrupt={handleInterrupt}
          />
        </section>

        {/* Hackathon Interactive Matrix (when toggled or triggered) */}
        {showComparisonMatrix && (
          <ComparisonMatrix onClose={() => setShowComparisonMatrix(false)} />
        )}

        {/* Conversation Dialogue Stream */}
        <section className="flex-1 my-4">
          <ChatStream
            messages={messages}
            isProcessing={isProcessing}
            onSpeakText={handleSpeak}
          />
          <div ref={chatBottomRef} />
        </section>

        {/* Live Speech Recognition Transcript Overlay */}
        <AnimatePresence>
          {liveTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="my-2 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold uppercase">Transcribing:</span>
                <span className="text-white italic">&quot;{liveTranscript}&quot;</span>
              </div>
              <button
                type="button"
                onClick={() => handleExecutePrompt(liveTranscript)}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-[11px]"
              >
                Send Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Commands & Hackathon Demo Banner */}
        <section className="my-3">
          <ExamplePrompts
            onSelectPrompt={(text) => handleExecutePrompt(text)}
            onOpenDocumentModal={() => setIsDocModalOpen(true)}
            onTriggerHackathonDemo={handleTriggerHackathonDemo}
            disabled={isProcessing}
          />
        </section>

        {/* Bottom Command Bar / HUD Console */}
        <section className="sticky bottom-3 z-30 pt-2">
          <div className="bg-slate-950/90 border border-cyan-500/35 rounded-2xl p-2 sm:p-2.5 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.15)] flex items-center gap-2">
            {/* Voice Controller Mic & Voice Config */}
            <VoiceController
              isListening={isListening}
              setIsListening={setIsListening}
              isSpeaking={isSpeaking}
              setIsSpeaking={setIsSpeaking}
              onSpeechInput={(transcript) => handleExecutePrompt(transcript)}
              liveTranscript={liveTranscript}
              setLiveTranscript={setLiveTranscript}
            />

            {/* Text Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecutePrompt(inputPrompt);
              }}
              className="flex-1 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  id="nexus-cmd-input"
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening to speech...'
                      : 'Transmit directive or question to NEXUS... (e.g. "What\'s the weather today?", "Calculate 25% of 8500")'
                  }
                  disabled={isProcessing}
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-sm font-sans text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isProcessing}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Transmit</span>
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Slide-out Diagnostic System Dashboard */}
      <SystemDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        telemetry={telemetry}
        memories={memories}
        tasks={tasks}
        notes={notes}
        activityLogs={activityLogs}
        onAddMemory={(key, value, category) => {
          const newMem: MemoryItem = {
            id: `mem-${Date.now()}`,
            key,
            value,
            category,
            timestamp: new Date().toISOString(),
          };
          setMemories((prev) => [...prev, newMem]);
          addLog('memory_update', `Manual Memory Inserted: [${key}]`, value);
        }}
        onDeleteMemory={(id) => {
          setMemories((prev) => prev.filter((m) => m.id !== id));
          addLog('memory_update', 'Memory item purged from short-term bank.');
        }}
        onToggleTask={(id) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
          );
        }}
        onAddTask={(title, priority, dueDate) => {
          const newTask: TaskItem = {
            id: `task-${Date.now()}`,
            title,
            completed: false,
            priority,
            dueDate,
            createdAt: new Date().toISOString(),
          };
          setTasks((prev) => [...prev, newTask]);
          addLog('tool_call', `New Task Registered: "${title}"`);
        }}
        onDeleteTask={(id) => {
          setTasks((prev) => prev.filter((t) => t.id !== id));
        }}
        toolsUsedCount={activityLogs.filter((l) => l.type === 'tool_finish').length}
      />

      {/* Code & Document Analysis Modal */}
      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmitAnalysis={handleDocumentAnalysis}
        isProcessing={isProcessing}
      />
    </main>
  );
}
