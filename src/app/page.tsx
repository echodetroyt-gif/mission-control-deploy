'use client';

import { useEffect, useState } from 'react';

interface OpenClawStatus {
  connected: boolean;
  version: string;
  agent: string;
  model: string;
  host: string;
  sessions: number;
  activeSubagents: number;
  lastActivity: string;
  error?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
}

interface SystemStats {
  disk: { used: string; free: string; total: string };
  memory?: { used: string; total: string; percent: number };
  services: Array<{ name: string; status: string; since?: string }>;
}

export default function Home() {
  const [status, setStatus] = useState<OpenClawStatus | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const [statusRes, tasksRes, statsRes] = await Promise.all([
        fetch('/api/openclaw/status'),
        fetch('/api/tasks'),
        fetch('/api/system/stats'),
      ]);

      if (statusRes.ok) setStatus(await statusRes.json());
      if (tasksRes.ok) setTasks((await tasksRes.json()).tasks || []);
      if (statsRes.ok) setStats(await statsRes.json());

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Mission Control</h1>
            <p className="text-sm text-gray-400">OpenClaw Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {status?.connected ? (
              <span className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-yellow-400">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Standalone
              </span>
            )}
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? '...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Agent Status
          </h2>
          {status && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Agent:</span><span>{status.agent}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Model:</span><span className="text-xs">{status.model?.split('/').pop()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Host:</span><span>{status.host}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Version:</span><span>v{status.version}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Sessions:</span><span className="text-green-400 font-bold">{status.sessions}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Subagents:</span><span>{status.activeSubagents}</span></div>
            </div>
          )}
        </div>

        {/* System Stats */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            System Stats
          </h2>
          {stats && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Disk:</span><span>{stats.disk.used} of {stats.disk.total}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Memory:</span><span>{stats.memory?.used || '3.1G'} / {stats.memory?.total || '7.9G'}</span></div>
              <div className="mt-4 space-y-1">
                {stats.services?.map(s => (
                  <div key={s.name} className="flex justify-between items-center">
                    <span>{s.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${s.status === 'running' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Active Tasks
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tasks.map(task => (
              <div key={task.id} className="bg-gray-750 rounded p-3 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{task.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.status === 'completed' ? 'bg-green-900 text-green-300' :
                    task.status === 'in-progress' ? 'bg-blue-900 text-blue-300' :
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {task.category} • {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 p-4 text-center text-sm text-gray-500">
        OpenClaw Mission Control • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
