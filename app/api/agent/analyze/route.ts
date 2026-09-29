import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { content, mode = 'explain', title = 'Document' } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const ai = getGeminiClient();

    let systemInstruction = 'You are NEXUS, an elite AI operating system. Provide sharp, deep technical breakdowns with clarity and precision.';
    let prompt = '';

    if (mode === 'explain_code') {
      prompt = `Analyze and explain the following code thoroughly:\n\n${content}\n\nInclude:
1. Purpose & High-level Architecture
2. Key Components & Functions breakdown
3. Edge Cases, Performance & Potential Bugs
4. Optimization suggestions`;
    } else if (mode === 'summarize') {
      prompt = `Summarize the following document titled "${title}":\n\n${content}\n\nProvide:
1. Executive Summary (2-3 sentences)
2. Core Takeaways (bulleted list)
3. Actionable Items or Key Conclusions`;
    } else {
      prompt = `Analyze the following content:\n\n${content}\n\nProvide key insights, structured breakdown, and recommendations.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    return NextResponse.json({
      result: response.text || 'Analysis complete.',
      title,
      mode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
