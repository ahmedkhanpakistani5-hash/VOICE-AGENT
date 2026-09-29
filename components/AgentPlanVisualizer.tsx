'use client';

import React from 'react';
import { motion } from 'motion/react';
import { AgentPlanStep } from '@/types/agent';
import { CheckCircle2, CircleDashed, Clock, AlertTriangle, ArrowRight, Cpu, Wrench } from 'lucide-react';

interface AgentPlanVisualizerProps {
  steps: AgentPlanStep[];
  currentStatus?: string;
  isProcessing?: boolean;
}

export function AgentPlanVisualizer({
  steps,
  currentStatus,
  isProcessing,
}: AgentPlanVisualizerProps) {
  if (!steps || steps.length === 0) return null;

  // Standard 5-stage conceptual pipeline for high-level visualization
  const pipelineStages = [
    { key: 'understanding', label: 'Understanding' },
    { key: 'planning', label: 'Planning' },
    { key: 'tools', label: 'Using Tools' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Completed' },
  ];

  // Determine which stage is active based on steps & isProcessing
  const hasTools = steps.some((s) => s.toolUsed);
  const allCompleted = steps.every((s) => s.status === 'completed');

  const getStageIndex = () => {
    if (!isProcessing && allCompleted) return 4; // Completed
    if (isProcessing) {
      if (hasTools) return 2; // Using Tools
      return 1; // Planning / Processing
    }
    return 4;
  };

  const activeStageIdx = getStageIndex();

  return (
    <div className="w-full bg-slate-950/70 border border-cyan-500/25 rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] my-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-cyan-300 tracking-wider uppercase">
            Cognitive Pipeline Execution
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {steps.length} Step{steps.length !== 1 ? 's' : ''} Orchestrated
        </span>
      </div>

      {/* High-level 5-Stage Stepper Ribbon */}
      <div className="py-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center min-w-max gap-2 text-xs font-mono">
          {pipelineStages.map((stage, idx) => {
            const isPast = idx < activeStageIdx;
            const isCurrent = idx === activeStageIdx && isProcessing;
            const isDone = idx <= activeStageIdx && !isProcessing;

            return (
              <React.Fragment key={stage.key}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all duration-300 ${
                    isDone || isPast
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                      : isCurrent
                      ? 'bg-amber-950/60 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse'
                      : 'bg-slate-900/40 border border-slate-800 text-slate-500'
                  }`}
                >
                  {isDone || isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  ) : isCurrent ? (
                    <CircleDashed className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span className="font-semibold text-[11px]">{stage.label}</span>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <ArrowRight
                    className={`w-3 h-3 ${
                      idx < activeStageIdx ? 'text-cyan-500/70' : 'text-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed Step Decomposition List */}
      <div className="space-y-2 mt-2 pt-2 border-t border-slate-900">
        {steps.map((step, idx) => {
          return (
            <motion.div
              key={step.id || idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-2.5 text-xs font-mono"
            >
              <div className="mt-0.5">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : step.status === 'in_progress' ? (
                  <CircleDashed className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                ) : step.status === 'failed' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-medium">
                    {step.title}
                  </span>
                  {step.toolUsed && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Wrench className="w-2.5 h-2.5" /> {step.toolUsed}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
