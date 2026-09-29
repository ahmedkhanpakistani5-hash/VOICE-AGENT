export type AgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing_tool';

export interface AgentToolCall {
  id: string;
  name: string;
  displayName: string;
  input: Record<string, any>;
  output?: Record<string, any> | string;
  status: 'running' | 'success' | 'error';
  executionTimeMs?: number;
  error?: string;
}

export interface AgentPlanStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  toolUsed?: string;
  resultSummary?: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'fact' | 'preference' | 'task' | 'context';
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'agent_start' | 'planning' | 'tool_call' | 'tool_finish' | 'memory_update' | 'voice_input' | 'speech_output' | 'system_alert';
  message: string;
  detail?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: AgentToolCall[];
  planSteps?: AgentPlanStep[];
  audioUrl?: string;
  executionMeta?: {
    model: string;
    durationMs: number;
    tokensEstimated?: number;
  };
}

export interface SystemTelemetry {
  status: AgentStatus;
  coreTemperature: number; // e.g. 34.2 C
  neuralLoad: number; // 0-100%
  activeToolsCount: number;
  latencyMs: number;
  sessionDurationSec: number;
}
