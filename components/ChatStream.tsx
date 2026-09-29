'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Message, AgentToolCall } from '@/types/agent';
import { ToolExecutionCard } from './ToolExecutionCard';
import { AgentPlanVisualizer } from './AgentPlanVisualizer';
import { Volume2, Copy, Check, User, Bot, Sparkles, Terminal } from 'lucide-react';
import { useIsMounted } from '@/hooks/use-mounted';

interface ChatStreamProps {
  messages: Message[];
  isProcessing: boolean;
  onSpeakText: (text: string) => void;
}

export function ChatStream({
  messages,
  isProcessing,
  onSpeakText,
}: ChatStreamProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isMounted = useIsMounted();

  const formatMessageTime = (isoString?: string) => {
    if (!isMounted || !isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to format code blocks and bold text cleanly
  const renderFormattedContent = (content: string) => {
    // Check if contains code blocks
    const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    if (parts.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }

    return (
      <div className="space-y-3">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            return (
              <div
                key={idx}
                className="my-2 rounded-xl bg-slate-950 border border-cyan-500/25 overflow-hidden text-xs font-mono"
              >
                <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-850 flex items-center justify-between text-slate-400">
                  <span className="text-[11px] text-cyan-400 font-semibold">{p.language}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`code-${idx}`, p.content)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300"
                  >
                    {copiedId === `code-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === `code-${idx}` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 text-slate-200 overflow-x-auto leading-relaxed text-[11px]">
                  {p.content}
                </pre>
              </div>
            );
          }
          return (
            <p key={idx} className="whitespace-pre-wrap leading-relaxed text-sm">
              {p.content}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {messages.map((message) => {
        const isAssistant = message.role === 'assistant';

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
          >
            {/* Sender Metadata Bar */}
            <div className="flex items-center gap-2 mb-1.5 px-1 text-xs font-mono">
              {isAssistant ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-bold tracking-wider">NEXUS // CORE</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500 text-[11px]" suppressHydrationWarning>
                    {formatMessageTime(message.timestamp)}
                  </span>
                  {message.executionMeta?.durationMs && (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {message.executionMeta.durationMs}ms
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-slate-500 text-[11px]" suppressHydrationWarning>
                    {formatMessageTime(message.timestamp)}
                  </span>
                  <span className="text-slate-300 font-bold">OPERATOR</span>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`max-w-full md:max-w-[85%] rounded-2xl p-4 sm:p-5 backdrop-blur-xl transition-all ${
                isAssistant
                  ? 'bg-slate-950/80 border border-cyan-500/30 text-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
                  : 'bg-gradient-to-r from-blue-950/50 to-cyan-950/60 border border-cyan-500/40 text-white shadow-[0_4px_20px_rgba(0,119,254,0.15)]'
              }`}
            >
              {/* Optional Planning Steps HUD */}
              {message.planSteps && message.planSteps.length > 0 && (
                <AgentPlanVisualizer steps={message.planSteps} />
              )}

              {/* Tool Execution Cards */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="space-y-2 mb-3">
                  {message.toolCalls.map((tc) => (
                    <ToolExecutionCard key={tc.id} toolCall={tc} />
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div className="text-sm font-sans">
                {renderFormattedContent(message.content)}
              </div>

              {/* Assistant Message Action Bar */}
              {isAssistant && (
                <div className="mt-3 pt-3 border-t border-slate-900/90 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSpeakText(message.content)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                      title="Vocalize this response"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Speak</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(message.id, message.content)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    GEMINI-3.8-FLASH // NEURAL ORCHESTRATED
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Thinking / Tool Execution Spinner */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start"
        >
          <div className="flex items-center gap-2 mb-1.5 px-1 text-xs font-mono text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span className="font-bold tracking-wider">NEXUS COGNITIVE ENGINE BUSY</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-slate-300 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping delay-150" />
            </div>
            <span className="text-xs font-mono text-cyan-200">
              Decomposing command, invoking tools, and synthesizing telemetry...
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
