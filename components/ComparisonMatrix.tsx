'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Check, Sparkles, Code2, Layers, Cpu, ExternalLink, Zap, Copy, CheckCheck } from 'lucide-react';

interface ComparisonMatrixProps {
  onClose?: () => void;
}

export function ComparisonMatrix({ onClose }: ComparisonMatrixProps) {
  const [copied, setCopied] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string>('gemini');

  const frameworks = [
    {
      id: 'gemini',
      name: 'Google GenAI SDK',
      tagline: 'Winner for Multimodal & Speed',
      badge: 'TOP HACKATHON PICK',
      recommended: true,
      velocityScore: 98,
      multiAgentScore: 90,
      toolCallingScore: 99,
      pros: [
        'Native Gemini 3.8 Flash, Live audio/video, & TTS',
        'Built-in Google Search grounding without 3rd party keys',
        'Direct TypeScript typing & zero-dependency overhead',
        'Blazing latency: ideal for 5-minute live judges demo',
      ],
      cons: ['Newer API surface requires latest @google/genai package'],
      starterSnippet: `import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const res = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: "Evaluate project architecture",
  config: { tools: [{ googleSearch: {} }] }
});`,
    },
    {
      id: 'langgraph',
      name: 'LangGraph',
      tagline: 'State Machines & Cyclical Graphs',
      badge: 'BEST FOR GRAPH STATE',
      recommended: false,
      velocityScore: 82,
      multiAgentScore: 94,
      toolCallingScore: 90,
      pros: [
        'Deterministic cycles & human-in-the-loop checkpoints',
        'Rich ecosystem of LangChain connectors',
        'Time-travel debugging and state rollbacks',
      ],
      cons: ['Steeper learning curve for tight hackathon deadlines', 'More abstractions to debug on stage'],
      starterSnippet: `// LangGraph State Graph
const workflow = new StateGraph({ channels: agentStateChannels })
  .addNode("agent", callModel)
  .addNode("tools", toolExecutor)
  .addEdge("agent", "tools");`,
    },
    {
      id: 'crewai',
      name: 'CrewAI',
      tagline: 'Role-Based Collaborative Teams',
      badge: 'POPULAR MULTI-AGENT',
      recommended: false,
      velocityScore: 86,
      multiAgentScore: 92,
      toolCallingScore: 88,
      pros: [
        'Intuitive agent personas (Researcher, Writer, QA)',
        'Easy sequential or hierarchical execution flows',
        'Fast initial concept setup',
      ],
      cons: ['Token heavy due to multi-agent chattiness', 'Can loop or hallucinate if tools fail'],
      starterSnippet: `from crewai import Agent, Crew, Task
researcher = Agent(role='Analyst', goal='Scan trends')
writer = Agent(role='Author', goal='Write report')
crew = Crew(agents=[researcher, writer], tasks=[...])`,
    },
    {
      id: 'autogen',
      name: 'Microsoft AutoGen',
      tagline: 'Conversational Multi-Agent Swarms',
      badge: 'ENTERPRISE RESEARCH',
      recommended: false,
      velocityScore: 78,
      multiAgentScore: 93,
      toolCallingScore: 86,
      pros: [
        'Powerful group chat managers and code execution environments',
        'Flexible custom speaker selection',
      ],
      cons: ['High complexity configuration', 'Longer setup time for hackathons'],
      starterSnippet: `from autogen import AssistantAgent, UserProxyAgent
assistant = AssistantAgent("assistant", llm_config=...)
user_proxy = UserProxyAgent("user_proxy", code_execution_config=...)`,
    },
  ];

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFw = frameworks.find((f) => f.id === selectedFramework) || frameworks[0];

  return (
    <div className="w-full bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,240,255,0.15)] my-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Hackathon Architectural Analysis & Recommendation
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Comparative benchmark across 5 dimensions: latency, multimodal abilities, tool reliability, and stage demo velocity.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-auto text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
          >
            Close HUD
          </button>
        )}
      </div>

      {/* Grid of Framework Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {frameworks.map((fw) => {
          const isSelected = fw.id === selectedFramework;
          return (
            <div
              key={fw.id}
              onClick={() => setSelectedFramework(fw.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 relative ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              {fw.recommended && (
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-[10px] font-mono font-bold text-black px-2 py-0.5 rounded shadow">
                  RECOMMENDED
                </div>
              )}
              <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">
                {fw.badge}
              </div>
              <h4 className="text-sm font-bold text-white">{fw.name}</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">{fw.tagline}</p>

              {/* Mini Score Metric */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Velocity:</span>
                <span className="text-cyan-300 font-bold">{fw.velocityScore}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Framework Deep Dive */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-cyan-300 font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              {activeFw.name} · Deep Technical Profile
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Multi-Agent: {activeFw.multiAgentScore}%</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Tool Calling: {activeFw.toolCallingScore}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {/* Pros & Cons */}
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1.5">
              Competitive Advantages
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {activeFw.pros.map((p, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mt-3 mb-1">
              Caveats
            </div>
            <ul className="space-y-1 text-xs text-slate-400">
              {activeFw.cons.map((c, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quickstart Starter Code */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Quickstarter Template</span>
              <button
                type="button"
                onClick={() => handleCopyCode(activeFw.starterSnippet)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200"
              >
                {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-slate-300 mt-2 overflow-x-auto text-[11px] leading-relaxed">
              {activeFw.starterSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
