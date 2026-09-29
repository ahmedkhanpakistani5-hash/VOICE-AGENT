'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  CheckSquare,
  Activity,
  Trash2,
  Plus,
  Clock,
  Sparkles,
  Shield,
  Cpu,
  Layers,
  FileText,
  X,
  ChevronRight,
  Server,
} from 'lucide-react';
import { MemoryItem, TaskItem, NoteItem, ActivityLogEntry, SystemTelemetry } from '@/types/agent';
import { useIsMounted } from '@/hooks/use-mounted';

interface SystemDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: SystemTelemetry;
  memories: MemoryItem[];
  tasks: TaskItem[];
  notes: NoteItem[];
  activityLogs: ActivityLogEntry[];
  onAddMemory: (key: string, value: string, category: 'fact' | 'preference' | 'task' | 'context') => void;
  onDeleteMemory: (id: string) => void;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high', dueDate?: string) => void;
  onDeleteTask: (id: string) => void;
  toolsUsedCount: number;
}

export function SystemDashboard({
  isOpen,
  onClose,
  telemetry,
  memories,
  tasks,
  notes,
  activityLogs,
  onAddMemory,
  onDeleteMemory,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  toolsUsedCount,
}: SystemDashboardProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'memory' | 'tasks' | 'logs'>('status');
  const isMounted = useIsMounted();

  // New Memory Modal State
  const [newMemKey, setNewMemKey] = useState('');
  const [newMemVal, setNewMemVal] = useState('');
  const [newMemCategory, setNewMemCategory] = useState<'fact' | 'preference' | 'task' | 'context'>('fact');
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemKey.trim() || !newMemVal.trim()) return;
    onAddMemory(newMemKey.trim(), newMemVal.trim(), newMemCategory);
    setNewMemKey('');
    setNewMemVal('');
    setIsAddingMemory(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-slate-950/95 border-l border-cyan-500/30 z-50 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="font-mono text-sm font-bold text-white tracking-wider uppercase">
                  NEXUS Diagnostic HUD
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-cyan-500/15 bg-slate-950/60 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                  activeTab === 'status'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('memory')}
                className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'memory'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Memory</span>
                {memories.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded-full">
                    {memories.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'tasks'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Tasks</span>
                {tasks.filter((t) => !t.completed).length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full">
                    {tasks.filter((t) => !t.completed).length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                  activeTab === 'logs'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Logs
              </button>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
              {/* TAB: STATUS */}
              {activeTab === 'status' && (
                <div className="space-y-4">
                  {/* System Overview Card */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                    <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Neural Engine Telemetry</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500">Core Status</div>
                        <div className="text-cyan-300 font-bold uppercase mt-0.5">
                          {telemetry.status}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500">Model Engine</div>
                        <div className="text-white font-bold mt-0.5">Gemini 3.8 Flash</div>
                      </div>
                      <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500">Latency Avg</div>
                        <div className="text-cyan-300 font-bold mt-0.5">
                          {telemetry.latencyMs > 0 ? `${telemetry.latencyMs}ms` : '380ms'}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500">Tools Dispatched</div>
                        <div className="text-white font-bold mt-0.5">{toolsUsedCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Registered System Capabilities */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                    <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider mb-2">
                      Active Sub-Agents & Tools
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span>Meteorological Sensor (Weather)</span>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span>Web Grounding Engine (Google Search)</span>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span>Arithmetic Evaluator (Math)</span>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span>Short-Term Cognitive Memory Bank</span>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span>Directive Task Orchestrator</span>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Speech Synthesis (Gemini TTS / WebAudio)</span>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MEMORY */}
              {activeTab === 'memory' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
                      Cognitive Short-Term Memory ({memories.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingMemory(!isAddingMemory)}
                      className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/30"
                    >
                      <Plus className="w-3 h-3" /> Add Fact
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans">
                    NEXUS automatically extracts key deadlines, user preferences, and project parameters from dialogue, and retains them during the session.
                  </p>

                  {/* Add Memory Form */}
                  {isAddingMemory && (
                    <form onSubmit={handleCreateMemory} className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Subject / Key</label>
                        <input
                          type="text"
                          placeholder="e.g. Project Deadline, Preferred Stack"
                          value={newMemKey}
                          onChange={(e) => setNewMemKey(e.target.value)}
                          className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Value / Detail</label>
                        <input
                          type="text"
                          placeholder="e.g. Friday 5 PM, Next.js + Tailwind"
                          value={newMemVal}
                          onChange={(e) => setNewMemVal(e.target.value)}
                          className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingMemory(false)}
                          className="px-2 py-1 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded"
                        >
                          Commit
                        </button>
                      </div>
                    </form>
                  )}

                  {memories.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                      No memories recorded yet. Tell NEXUS: &quot;Remember that my deadline is Friday&quot; or add a custom fact above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 flex items-start justify-between gap-2 group transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-cyan-300 font-bold">{mem.key}</span>
                              <span className="text-[9px] text-slate-500 uppercase px-1 border border-slate-800 rounded">
                                {mem.category}
                              </span>
                            </div>
                            <div className="text-slate-200 mt-0.5 text-xs font-sans">
                              {mem.value}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteMemory(mem.id)}
                            className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Forget Memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
                      Directives & Action Matrix ({tasks.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(!isAddingTask)}
                      className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/30"
                    >
                      <Plus className="w-3 h-3" /> Add Task
                    </button>
                  </div>

                  {isAddingTask && (
                    <form onSubmit={handleCreateTask} className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Directive Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Test Gemini Voice API"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-slate-400">Priority:</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as any)}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingTask(false)}
                          className="px-2 py-1 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded"
                        >
                          Register
                        </button>
                      </div>
                    </form>
                  )}

                  {tasks.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                      No active tasks. Tell NEXUS: &quot;Create a study plan for me&quot; or register a directive manually.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 group transition-colors ${
                            task.completed
                              ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                              : 'bg-slate-900/70 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => onToggleTask(task.id)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer"
                            />
                            <span className={task.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                                task.priority === 'high'
                                  ? 'border-red-500/40 text-red-400 bg-red-950/30'
                                  : task.priority === 'medium'
                                  ? 'border-amber-500/40 text-amber-400 bg-amber-950/30'
                                  : 'border-slate-700 text-slate-400'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ACTIVITY LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider pb-1">
                    System Event Stream ({activityLogs.length})
                  </div>
                  {activityLogs.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                      No system events logged yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {activityLogs.slice(-20).reverse().map((log) => (
                        <div
                          key={log.id}
                          className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="text-cyan-400 uppercase font-semibold text-[10px]">
                              {log.type}
                            </span>
                            <span suppressHydrationWarning>
                              {isMounted ? new Date(log.timestamp).toLocaleTimeString() : ''}
                            </span>
                          </div>
                          <div className="text-slate-300 mt-0.5">{log.message}</div>
                          {log.detail && (
                            <div className="text-slate-500 text-[10px] mt-0.5">{log.detail}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
