'use client';

import React from 'react';
import {
  CloudSun,
  Search,
  Code2,
  FileText,
  CalendarCheck,
  Calculator,
  Terminal,
  BookmarkPlus,
  Play,
  Sparkles,
} from 'lucide-react';

interface ExamplePromptsProps {
  onSelectPrompt: (promptText: string) => void;
  onOpenDocumentModal: () => void;
  onTriggerHackathonDemo: () => void;
  disabled?: boolean;
}

export function ExamplePrompts({
  onSelectPrompt,
  onOpenDocumentModal,
  onTriggerHackathonDemo,
  disabled,
}: ExamplePromptsProps) {
  const exampleCommands = [
    {
      label: "What's the weather today?",
      icon: CloudSun,
      prompt: "What's the current weather in Tokyo and San Francisco?",
    },
    {
      label: 'Search web for latest AI news',
      icon: Search,
      prompt: 'Search the web for the latest breakthrough AI agent and multimodal news this week.',
    },
    {
      label: 'Calculate 25% of 8500',
      icon: Calculator,
      prompt: 'Calculate 25% of 8500, then compute compounding interest on it at 7% for 3 years.',
    },
    {
      label: 'Create a study plan',
      icon: CalendarCheck,
      prompt: 'Create a 5-day intense hackathon preparation study plan and register it as high priority directives.',
    },
    {
      label: 'Remember my deadline',
      icon: BookmarkPlus,
      prompt: 'Remember that my hackathon final submission deadline is this Friday at 5:00 PM PST.',
    },
    {
      label: 'Build a Python AI project',
      icon: Terminal,
      prompt: 'Help me architect a Python AI agent using the Google GenAI SDK with tool calling and streaming.',
    },
  ];

  return (
    <div className="w-full space-y-2.5">
      {/* Primary Hackathon Demo Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/40 to-slate-950 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Autonomous Hackathon Research Demo</span>
              <span className="text-[10px] text-cyan-400 font-normal px-1.5 py-0.2 bg-cyan-950 border border-cyan-500/40 rounded">
                Multi-Step Pipeline
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5">
              Watch NEXUS reason, search the web, compare agent frameworks (LangGraph vs CrewAI vs GenAI), and recommend the winning architecture.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTriggerHackathonDemo}
          disabled={disabled}
          className="self-end sm:self-auto shrink-0 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Demo Flow</span>
        </button>
      </div>

      {/* Quick Command Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
        {exampleCommands.map((cmd, idx) => {
          const Icon = cmd.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(cmd.prompt)}
              disabled={disabled}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{cmd.label}</span>
            </button>
          );
        })}

        {/* Special Inspector Button */}
        <button
          type="button"
          onClick={onOpenDocumentModal}
          disabled={disabled}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Inspect Code / Document</span>
        </button>
      </div>
    </div>
  );
}
