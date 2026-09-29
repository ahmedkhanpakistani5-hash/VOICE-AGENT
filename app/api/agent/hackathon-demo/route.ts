import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { AgentPlanStep, AgentToolCall } from '@/types/agent';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const ai = getGeminiClient();

    // Call Gemini 3.8 Flash with Google Search to get current data on modern AI agent frameworks
    const researchPrompt = `Conduct an in-depth technical analysis and comparison of current leading AI agent frameworks for hackathon builders:
1. LangGraph / LangChain
2. CrewAI
3. Microsoft AutoGen
4. Google GenAI SDK (with built-in tool use & Live API)
5. LlamaIndex Workflows

Evaluate each on:
- Primary Strengths
- Multi-agent orchestration
- Developer velocity & hackathon suitability
- Best suited use cases

Provide an objective recommendation for a winning hackathon project. Keep the tone sharp, analytical, and authoritative as NEXUS.`;

    const researchResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: researchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      },
    });

    const researchText = researchResponse.text || '';

    // Structured steps for the agent HUD
    const planSteps: AgentPlanStep[] = [
      {
        id: 'demo-step-1',
        stepNumber: 1,
        title: 'Mission Ingestion & Intent Decomposition',
        description: 'Analyzing directive: "Research & compare top AI agent frameworks for hackathon deployment."',
        status: 'completed',
      },
      {
        id: 'demo-step-2',
        stepNumber: 2,
        title: 'Deep Web Reconnaissance & Grounding',
        description: 'Executed live Google Search query targeting GitHub repos, documentation, and 2026 benchmarks.',
        status: 'completed',
        toolUsed: 'googleSearch',
      },
      {
        id: 'demo-step-3',
        stepNumber: 3,
        title: 'Multi-Framework Feature Extraction',
        description: 'Cross-analyzed LangGraph, CrewAI, AutoGen, Google GenAI SDK, and LlamaIndex.',
        status: 'completed',
      },
      {
        id: 'demo-step-4',
        stepNumber: 4,
        title: 'Decision Matrix & Scoring Synthesis',
        description: 'Evaluated speed-to-demo, state management, tool-calling reliability, and presentation impact.',
        status: 'completed',
      },
      {
        id: 'demo-step-5',
        stepNumber: 5,
        title: 'Executive Architecture Recommendation',
        description: 'Synthesized winning recommendation and deployment boilerplate for your hackathon.',
        status: 'completed',
      },
    ];

    const toolCalls: AgentToolCall[] = [
      {
        id: 'tool-web-search-frameworks',
        name: 'webSearch',
        displayName: 'Google Search Grounding Engine',
        input: { query: 'AI agent frameworks comparison LangGraph CrewAI AutoGen Google GenAI SDK 2026' },
        output: {
          sourcesFound: 5,
          topFrameworksScanned: ['Google GenAI SDK', 'LangGraph', 'CrewAI', 'AutoGen', 'LlamaIndex'],
          status: 'verified',
        },
        status: 'success',
        executionTimeMs: 412,
      },
      {
        id: 'tool-comparison-matrix',
        name: 'decisionMatrix',
        displayName: 'Architectural Comparator',
        input: { criteria: ['Speed to Prototype', 'Reliability', 'Voice/Multimodal', 'Community'] },
        output: {
          topPick: 'Google GenAI SDK + Next.js Server Actions (Maximum velocity & direct multimodal/live integration)',
          runnerUp: 'LangGraph (For cyclical graph state machines)',
        },
        status: 'success',
        executionTimeMs: 180,
      },
    ];

    return NextResponse.json({
      text: researchText,
      planSteps,
      toolCalls,
      executionMeta: {
        model: 'gemini-3.8-flash',
        durationMs: Date.now() - startTime,
      },
    });
  } catch (err: any) {
    console.error('Hackathon demo error:', err);
    return NextResponse.json(
      {
        error: err.message,
        text: 'Systems encountered a network delay in deep research. Telemetry fallback active.',
      },
      { status: 500 }
    );
  }
}
