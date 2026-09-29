'use client';

import React, { useState } from 'react';
import { AgentToolCall } from '@/types/agent';
import {
  CloudSun,
  Search,
  Calculator,
  Clock,
  BookmarkCheck,
  CheckSquare,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wind,
  Droplets,
  Thermometer,
  Wrench,
  CheckCircle,
} from 'lucide-react';

interface ToolExecutionCardProps {
  toolCall: AgentToolCall;
}

export function ToolExecutionCard({ toolCall }: ToolExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { name, displayName, input, output, executionTimeMs } = toolCall;

  // Render Weather Card
  if (name === 'getWeather' && output && typeof output === 'object' && !output.error) {
    return (
      <div className="my-2.5 bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border border-cyan-500/30 rounded-xl p-3.5 backdrop-blur-md shadow-[0_4px_16px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs">
            <CloudSun className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider">Atmospheric Telemetry</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{output.location}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              {output.temperatureC}°C
            </span>
            <span className="text-sm font-mono text-cyan-400">/ {output.temperatureF}°F</span>
            <span className="text-xs text-slate-400 font-sans ml-2">({output.condition})</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5" title="Relative Humidity">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>{output.humidity}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Wind Velocity">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>{output.windSpeed}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Thermal Index (Feels Like)">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>{output.feelsLikeC}°C</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Calculator Card
  if (name === 'calculator' && output && typeof output === 'object') {
    return (
      <div className="my-2.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider">Arithmetic Core</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {executionTimeMs ? `${executionTimeMs}ms` : 'Instant'}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Input: <span className="text-slate-200">{input.expression}</span>
          </div>
          <div className="text-lg font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-lg">
            = {String(output.result)}
          </div>
        </div>

        {output.steps && output.steps.length > 0 && (
          <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5 border-t border-slate-900 pt-1.5">
            {output.steps.map((st: string, i: number) => (
              <div key={i} className="text-slate-500">
                › {st}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Web Search Card
  if (name === 'webSearch' && output && typeof output === 'object') {
    return (
      <div className="my-2.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs">
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider">Live Grounded Search</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Query: &quot;{input.query}&quot;
          </span>
        </div>

        {output.sources && output.sources.length > 0 && (
          <div className="mt-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Verified Sources & Citations:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {output.sources.map((src: any, idx: number) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 px-2.5 py-1 rounded transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[200px]">{src.title || src.uri}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render DateTime Card
  if (name === 'getDateTime' && output && typeof output === 'object') {
    return (
      <div className="my-2.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider">Chronometer Sync</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{output.timezone}</span>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="text-lg font-mono font-bold text-white">{output.formatted}</div>
          <div className="text-xs font-mono text-cyan-400">{output.dayOfWeek}</div>
        </div>
      </div>
    );
  }

  // Render Memory Stored Card
  if (name === 'rememberFact') {
    return (
      <div className="my-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase">
          <BookmarkCheck className="w-4 h-4" />
          <span>Cognitive Memory Committed</span>
        </div>
        <div className="mt-1.5 text-xs text-slate-200 font-mono">
          <span className="text-emerald-300 font-bold">{input.key}:</span> {input.value}
        </div>
      </div>
    );
  }

  // Render Task Directive Card
  if (name === 'manageTask') {
    return (
      <div className="my-2.5 bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase">
          <CheckSquare className="w-4 h-4" />
          <span>New Directive Registered</span>
        </div>
        <div className="mt-1 text-xs text-slate-200 font-mono flex items-center justify-between">
          <span>{input.title}</span>
          {input.priority && (
            <span className="text-[10px] text-cyan-300 uppercase px-1.5 py-0.5 border border-cyan-500/40 rounded">
              Priority: {input.priority}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default Generic Tool Card
  return (
    <div className="my-2 bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{displayName || name}</span>
        </div>
        <div className="flex items-center gap-2">
          {executionTimeMs && (
            <span className="text-[10px] font-mono text-slate-400">{executionTimeMs}ms</span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200 p-0.5"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-slate-900 text-[11px] font-mono space-y-1.5">
          <div>
            <span className="text-slate-500">Parameters:</span>
            <pre className="text-slate-300 bg-slate-900/60 p-1.5 rounded mt-0.5 overflow-x-auto">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
          {output && (
            <div>
              <span className="text-slate-500">Telemetry Result:</span>
              <pre className="text-cyan-300 bg-slate-900/60 p-1.5 rounded mt-0.5 overflow-x-auto">
                {JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
