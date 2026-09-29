import { NextRequest, NextResponse } from 'next/server';
import { FunctionDeclaration, Type } from '@google/genai';
import { getGeminiClient } from '@/lib/gemini';
import {
  executeCalculator,
  executeDateTimeLookup,
  executeWeatherLookup,
  executeWebSearch,
} from '@/lib/tools';
import { AgentPlanStep, AgentToolCall, MemoryItem, TaskItem, NoteItem } from '@/types/agent';

// Tool definitions for Gemini
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'getWeather',
    description: 'Retrieve real-time live weather conditions, temperature, humidity, and forecast for any city or region.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: 'The city or location name, e.g., "Tokyo", "London", "San Francisco, CA".',
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'webSearch',
    description: 'Perform a web search to gather live real-world information, current news, facts, and citations.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'The search query to look up on the web.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'calculator',
    description: 'Perform mathematical computations, algebraic calculations, percentage calculations (e.g., 25% of 8500), and unit conversions.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        expression: {
          type: Type.STRING,
          description: 'The mathematical expression to evaluate, e.g., "25% of 8500", "(450 * 12) / 3", "2^8".',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'getDateTime',
    description: 'Get current system date, time, day of week, epoch timestamp, or timezone information.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        timezone: {
          type: Type.STRING,
          description: 'Optional IANA timezone name, e.g. "America/New_York", "UTC", "Asia/Tokyo".',
        },
      },
    },
  },
  {
    name: 'rememberFact',
    description: 'Store an important piece of information, deadline, preference, or fact in NEXUS long/short-term memory.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        key: {
          type: Type.STRING,
          description: 'Short descriptor of what is remembered, e.g. "Project Deadline", "Preferred Language", "User Name".',
        },
        value: {
          type: Type.STRING,
          description: 'The full detail or fact remembered.',
        },
        category: {
          type: Type.STRING,
          description: 'Category: "fact", "preference", "task", or "context".',
        },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'manageTask',
    description: 'Create a new action item or task in the user task matrix.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'The task title or description.',
        },
        priority: {
          type: Type.STRING,
          description: '"high", "medium", or "low".',
        },
        dueDate: {
          type: Type.STRING,
          description: 'Optional due date or timeframe.',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'manageNote',
    description: 'Save a quick note, draft, or memo to the NEXUS scratchpad.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'Title of the note.',
        },
        content: {
          type: Type.STRING,
          description: 'The text content or code snippet of the note.',
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Array of category tags.',
        },
      },
      required: ['title', 'content'],
    },
  },
];

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      prompt,
      conversationHistory = [],
      memories = [],
      tasks = [],
      notes = [],
      isDemoFlow = false,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const ai = getGeminiClient();

    // Prepare system instruction with JARVIS personality & contextual memory
    const memoryContext = memories.length > 0
      ? `CURRENT USER MEMORY BANK:\n${memories.map((m: MemoryItem) => `- [${m.category.toUpperCase()}] ${m.key}: ${m.value}`).join('\n')}`
      : 'CURRENT USER MEMORY BANK: No prior memories recorded.';

    const taskContext = tasks.length > 0
      ? `CURRENT ACTIVE TASKS:\n${tasks.map((t: TaskItem) => `- [${t.priority.toUpperCase()}] ${t.title} (${t.completed ? 'COMPLETED' : 'PENDING'})`).join('\n')}`
      : 'CURRENT ACTIVE TASKS: None.';

    const systemInstruction = `You are NEXUS, a state-of-the-art futuristic JARVIS-style personal AI operating system assistant.
Tone & Persona:
- Sophisticated, razor-sharp, calm, highly articulate, and proactive.
- You are not a simple chatbot; you are an autonomous AI operating agent with tool execution, cognitive planning, and memory.
- Keep spoken and textual responses clear, confident, and direct. Avoid unnecessary conversational fluff, but speak with elegant intelligence ("Certainly, sir/ma'am", "Systems operational", "Analysis complete", "Right away").
- If the user asks for actions requiring tools (weather, calculation, date/time, web search, remembering facts, tasks, notes), CALL THE APPROPRIATE TOOL IMMEDIATELY.
- Always use the tools rather than guessing.
- If the user provides a statement like "Remember that my deadline is Friday" or "My name is John" or "I prefer TypeScript", ALWAYS invoke the 'rememberFact' tool or 'manageTask' tool.
- For code generation or explanation, provide clean, modern, well-formatted code with clear architecture commentary.

${memoryContext}
${taskContext}
`;

    // Format conversation history
    const contents: any[] = [];
    // Last 6 turns for context
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if (msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.content }] });
      }
    }
    // Append current prompt
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    // Initial call to check for tool calls
    const initialResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 0.7,
      },
    });

    const toolCallsExecuted: AgentToolCall[] = [];
    const newMemories: MemoryItem[] = [];
    const newTasks: TaskItem[] = [];
    const newNotes: NoteItem[] = [];

    const functionCalls = initialResponse.functionCalls;

    let finalResponseText = '';
    const planSteps: AgentPlanStep[] = [];

    // Step 1: Goal Understanding
    planSteps.push({
      id: 'step-1',
      stepNumber: 1,
      title: 'Intent & Semantic Analysis',
      description: `Parsed user command: "${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}"`,
      status: 'completed',
    });

    if (functionCalls && functionCalls.length > 0) {
      // Step 2: Planning tools
      planSteps.push({
        id: 'step-2',
        stepNumber: 2,
        title: 'Cognitive Strategy & Tool Selection',
        description: `Identified ${functionCalls.length} required tool action(s): ${functionCalls.map((fc) => fc.name || 'tool').join(', ')}`,
        status: 'completed',
      });

      // Execute each tool call
      for (const fc of functionCalls) {
        const toolStartTime = Date.now();
        const callId = `tool-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        let toolOutput: any = null;
        let displayName: string = fc.name || 'System Tool';

        if (fc.name === 'getWeather') {
          displayName = 'Meteorological Sensor (Live Weather)';
          const loc = (fc.args as any)?.location || 'Tokyo';
          toolOutput = await executeWeatherLookup(loc);
        } else if (fc.name === 'webSearch') {
          displayName = 'Global Knowledge Link (Web Search)';
          const q = (fc.args as any)?.query || prompt;
          toolOutput = await executeWebSearch(q);
        } else if (fc.name === 'calculator') {
          displayName = 'Arithmetic Core (Calculator)';
          const expr = (fc.args as any)?.expression || '0';
          toolOutput = executeCalculator(expr);
        } else if (fc.name === 'getDateTime') {
          displayName = 'Chronometer (Date/Time)';
          const tz = (fc.args as any)?.timezone;
          toolOutput = executeDateTimeLookup(tz);
        } else if (fc.name === 'rememberFact') {
          displayName = 'Neural Memory Storage';
          const { key, value, category = 'fact' } = (fc.args as any) || {};
          const mem: MemoryItem = {
            id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            key: key || 'Fact',
            value: value || 'Recorded detail',
            category: category as any,
            timestamp: new Date().toISOString(),
          };
          newMemories.push(mem);
          toolOutput = { success: true, remembered: mem };
        } else if (fc.name === 'manageTask') {
          displayName = 'Task Directive Registry';
          const { title, priority = 'medium', dueDate } = (fc.args as any) || {};
          const task: TaskItem = {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: title || 'New Directive',
            completed: false,
            priority: priority as any,
            dueDate: dueDate || undefined,
            createdAt: new Date().toISOString(),
          };
          newTasks.push(task);
          toolOutput = { success: true, taskCreated: task };
        } else if (fc.name === 'manageNote') {
          displayName = 'System Memo Recorder';
          const { title, content, tags = [] } = (fc.args as any) || {};
          const note: NoteItem = {
            id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: title || 'Note',
            content: content || '',
            tags,
            updatedAt: new Date().toISOString(),
          };
          newNotes.push(note);
          toolOutput = { success: true, noteCreated: note };
        }

        const toolDuration = Date.now() - toolStartTime;

        toolCallsExecuted.push({
          id: callId,
          name: fc.name || 'tool',
          displayName,
          input: (fc.args as Record<string, any>) || {},
          output: toolOutput,
          status: 'success',
          executionTimeMs: toolDuration,
        });

        planSteps.push({
          id: `step-tool-${fc.name || 'tool'}`,
          stepNumber: planSteps.length + 1,
          title: `Executed: ${displayName}`,
          description: `Dispatched parameters: ${JSON.stringify(fc.args)}. Finished in ${toolDuration}ms.`,
          status: 'completed',
          toolUsed: fc.name || 'tool',
        });
      }

      // Step 3: Synthesis with tool outputs
      planSteps.push({
        id: `step-synth`,
        stepNumber: planSteps.length + 1,
        title: 'Neural Synthesis & Output Assembly',
        description: 'Integrating tool telemetry with conversational response stream.',
        status: 'completed',
      });

      // Synthesis pass with tool output data fed back
      const synthesisPrompt = `The user asked: "${prompt}"
The following tools were executed with real-time results:
${toolCallsExecuted
  .map(
    (tc) => `Tool: ${tc.name}\nInput: ${JSON.stringify(tc.input)}\nOutput: ${JSON.stringify(tc.output)}`
  )
  .join('\n\n')}

Provide the final authoritative response for NEXUS.
Incorporate the tool outputs seamlessly, highlighting key facts concisely. If weather was fetched, clearly state temperature, condition, humidity, and location. If a calculation was performed, provide the exact result clearly. If a fact was stored in memory or task created, confirm it with JARVIS-style courtesy.`;

      const synthesisResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...contents,
          { role: 'user', parts: [{ text: synthesisPrompt }] },
        ],
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      finalResponseText = synthesisResponse.text || 'Directive completed, sir. Telemetry verified.';
    } else {
      // Direct conversational / reasoning response without tool calls
      planSteps.push({
        id: 'step-direct-reasoning',
        stepNumber: 2,
        title: 'Direct Neural Synthesis',
        description: 'No external tool required. Processing via internal cognitive core.',
        status: 'completed',
      });

      finalResponseText = initialResponse.text || 'Awaiting further instructions, sir.';
    }

    // Step 4: Completion
    planSteps.push({
      id: 'step-final',
      stepNumber: planSteps.length + 1,
      title: 'Transmission Ready',
      description: 'Response rendered for audio vocalization and HUD projection.',
      status: 'completed',
    });

    const totalDuration = Date.now() - startTime;

    return NextResponse.json({
      text: finalResponseText,
      toolCalls: toolCallsExecuted,
      planSteps,
      newMemories,
      newTasks,
      newNotes,
      executionMeta: {
        model: 'gemini-3.8-flash',
        durationMs: totalDuration,
      },
    });
  } catch (err: any) {
    console.error('Agent chat error:', err);
    return NextResponse.json(
      {
        error: err.message || 'An error occurred during agent execution',
        text: `Systems encountered an operational anomaly: ${err.message}. Core remains active and ready for input.`,
        planSteps: [
          {
            id: 'step-error',
            stepNumber: 1,
            title: 'Diagnostic Alert',
            description: `Interrupted: ${err.message}`,
            status: 'failed',
          },
        ],
        toolCalls: [],
      },
      { status: 500 }
    );
  }
}
