'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCode, FileText, Upload, Sparkles, X, Check, Copy } from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAnalysis: (content: string, mode: 'explain_code' | 'summarize' | 'analyze', title: string) => void;
  isProcessing: boolean;
}

export function DocumentModal({
  isOpen,
  onClose,
  onSubmitAnalysis,
  isProcessing,
}: DocumentModalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'explain_code' | 'summarize' | 'analyze'>('explain_code');

  if (!isOpen) return null;

  const samplePythonCode = `def autonomous_agent_loop(goal: str, tools: list):
    """
    JARVIS Autonomous Agent Reasoning Loop
    """
    memory = VectorStore()
    plan = generate_plan(goal)
    
    for step in plan.steps:
        context = memory.retrieve(step.description)
        tool = select_optimal_tool(step, tools)
        result = tool.execute(context)
        memory.commit(step.id, result)
        
    return synthesize_final_report(memory.all())`;

  const sampleDocText = `Project NEXUS - Next-Gen Operating System
Abstract:
NEXUS represents an evolution from passive text-based chatbots to proactive, tool-empowered personal operating system agents. By coupling multi-modal perception with live grounded execution tools, the system achieves sub-second tool planning, short-term cognitive persistence, and natural speech synthesis.

Key Goals:
1. Low latency voice-first interaction with client-side interruption.
2. Automatic tool orchestration (search, weather, calculator, task matrix).
3. Persistent memory extraction without explicit user commands.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmitAnalysis(content, mode, title || (mode === 'explain_code' ? 'Code Analysis' : 'Document Summary'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-white tracking-wide uppercase">
              Document & Code Inspection Subsystem
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Operation Mode */}
          <div>
            <label className="text-slate-400 block mb-1.5 uppercase text-[10px] tracking-wider">
              Inspection Mode:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('explain_code')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  mode === 'explain_code'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                Explain Code
              </button>
              <button
                type="button"
                onClick={() => setMode('summarize')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  mode === 'summarize'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                Summarize Text / PDF
              </button>
              <button
                type="button"
                onClick={() => setMode('analyze')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  mode === 'analyze'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                Deep Analysis
              </button>
            </div>
          </div>

          {/* Quick Preset Fill */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Insert Sample:</span>
            <button
              type="button"
              onClick={() => {
                setContent(samplePythonCode);
                setTitle('Python Agent Core');
                setMode('explain_code');
              }}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              [Sample Python Code]
            </button>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => {
                setContent(sampleDocText);
                setTitle('NEXUS Whitepaper');
                setMode('summarize');
              }}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              [Sample Document]
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="text-slate-400 block mb-1 text-[10px] uppercase">
              Identifier / Title:
            </label>
            <input
              type="text"
              placeholder="e.g. Autonomous Agent Core"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2 text-white"
            />
          </div>

          {/* Content Area */}
          <div>
            <label className="text-slate-400 block mb-1 text-[10px] uppercase">
              Source Code or Document Text:
            </label>
            <textarea
              rows={8}
              placeholder="Paste code or document text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-3 text-slate-200 font-mono text-xs leading-relaxed"
              required
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Processed via Gemini 3.8 Flash Neural Core
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !content.trim()}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isProcessing ? 'Analyzing...' : 'Dispatch to NEXUS'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
