import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceName = 'Puck' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required for TTS' }, { status: 400 });
    }

    // Clean text: strip markdown code blocks or large URLs for speech synthesis
    const speechCleaned = text
      .replace(/```[\s\S]*?```/g, 'Code block generated.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_#]/g, '')
      .trim();

    // Limit text length to prevent huge latency
    const truncatedText = speechCleaned.length > 500
      ? speechCleaned.slice(0, 480) + '... Full report displayed on the HUD.'
      : speechCleaned;

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: truncatedText,
              speechMetadata: {
                style: 'Calm, articulate, high-tech British assistant tone like JARVIS, crisp and confident',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return NextResponse.json({
        fallback: true,
        message: 'No audio returned from Gemini TTS. Browser synthesis will be used.',
      });
    }

    return NextResponse.json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
      voiceUsed: voiceName,
      cleanedText: truncatedText,
    });
  } catch (err: any) {
    console.warn('Gemini TTS warning (will fall back to browser speech synthesis):', err.message);
    return NextResponse.json({
      fallback: true,
      error: err.message,
    });
  }
}
