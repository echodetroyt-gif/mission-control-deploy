'use client';

import { useEffect, useState } from 'react';

interface OpenClawStatus {
  version: string;
  agent: string;
  model: string;
  host: string;
  sessions: number;
  activeSubagents: number;
  lastActivity: string;
}

export default function Home() {
  const [status, setStatus] = useState<OpenClawStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/openclaw/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Mission Control</h1>
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {status && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold text-blue-400">Agent Status</h2>
            <p>Agent: {status.agent}</p>
            <p>Model: {status.model}</p>
            <p>Host: {status.host}</p>
            <p>Version: {status.version}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold text-green-400">Sessions</h2>
            <p>Active: {status.sessions}</p>
            <p>Subagents: {status.activeSubagents}</p>
          </div>
        </div>
      )}
    </div>
  );
}
