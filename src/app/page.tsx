'use client';

import { useEffect, useState, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  completedAt?: string;
  startedAt?: string;
  notes?: string;
}

interface OpenClawStatus {
  connected: boolean;
  version: string;
  agent: string;
  model: string;
  host: string;
  sessions: number;
  activeSubagents: number;
}

export default function Home() {
  const [status, setStatus] = useState<OpenClawStatus | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchData() {
    try {
      const [statusRes, tasksRes, chatRes] = await Promise.all([
        fetch('/api/openclaw/status'),
        fetch(`/api/tasks/history?type=${taskFilter}`),
        fetch('/api/chat'),
      ]);
      if (statusRes.ok) setStatus(await statusRes.json());
      if (tasksRes.ok) setTasks((await tasksRes.json()).tasks || []);
      if (chatRes.ok) setMessages((await chatRes.json()).messages || []);
    } catch (e) {}
  }

  async function sendMessage() {
    if (!inputMessage.trim()) return;
    setIsChatting(true);
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });
      setInputMessage('');
      const chatRes = await fetch('/api/chat');
      if (chatRes.ok) setMessages((await chatRes.json()).messages || []);
    } finally {
      setIsChatting(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [taskFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🎛️ Mission Control</h1>
          <p className="text-sm text-gray-400">OpenClaw Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-2 ${status?.connected ? 'text-green-400' : 'text-yellow-400'}`}>
            <span className={`w-2 h-2 rounded-full ${status?.connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
            {status?.connected ? 'Connected' : 'Standalone'}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-[600px]">
          <div className="p-3 border-b border-gray-700">
            <h2 className="font-semibold">💬 Chat with Echo</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Start a conversation...</p>
            ) : (
              messages.slice().reverse().map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700 border border-gray-600'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-60">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type message..."
              disabled={isChatting}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
            <button onClick={sendMessage} disabled={isChatting || !inputMessage.trim()} className="px-4 py-2 bg-blue-600 rounded text-sm disabled:opacity-50">
              {isChatting ? '...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h2 className="font-semibold mb-2">📊 Status</h2>
            {status && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Agent:</span><span>{status.agent}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Host:</span><span>{status.host}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Version:</span><span>{status.version}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Sessions:</span><span>{status.sessions}</span></div>
              </div>
            )}
          </div>

          {/* Task History */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">📋 Tasks</h2>
              <select 
                value={taskFilter} 
                onChange={(e) => setTaskFilter(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded text-sm px-2 py-1"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
            </div>
            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="bg-gray-750 rounded p-2 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      task.status === 'completed' ? 'bg-green-900 text-green-300' :
                      task.status === 'running' ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{task.category} • {task.priority}</div>
                  {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
