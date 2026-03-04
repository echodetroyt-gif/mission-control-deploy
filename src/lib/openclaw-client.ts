/**
 * OpenClaw API Client
 * Connects Mission Control to OpenClaw gateway
 */

export interface OpenClawStatus {
  version: string;
  agent: string;
  model: string;
  host: string;
  sessions: number;
  activeSubagents: number;
  lastActivity: string;
}

export interface Session {
  key: string;
  kind: string;
  channel: string;
  displayName: string;
  model: string;
  updatedAt: number;
}

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  lastStatus?: string;
  nextRunAt?: string;
}

class OpenClawClient {
  private baseUrl: string;
  private token?: string;

  constructor() {
    // Try to get from env, fallback to checking if we're in browser
    this.baseUrl = process.env.OPENCLAW_API_URL || '';
    this.token = process.env.OPENCLAW_TOKEN;
  }

  setEndpoint(url: string, token?: string) {
    this.baseUrl = url;
    this.token = token;
  }

  async getStatus(): Promise<OpenClawStatus | null> {
    if (!this.baseUrl) return this.getMockStatus();
    
    try {
      const res = await fetch(`${this.baseUrl}/api/status`, {
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('OpenClaw status error:', err);
      return this.getMockStatus();
    }
  }

  async getSessions(): Promise<Session[]> {
    if (!this.baseUrl) return this.getMockSessions();
    
    try {
      const res = await fetch(`${this.baseUrl}/api/sessions`, {
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.sessions || [];
    } catch (err) {
      console.error('OpenClaw sessions error:', err);
      return this.getMockSessions();
    }
  }

  async getCronJobs(): Promise<CronJob[]> {
    if (!this.baseUrl) return this.getMockCronJobs();
    
    try {
      // Note: This would need an endpoint on OpenClaw
      const res = await fetch(`${this.baseUrl}/api/cron`, {
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.jobs || [];
    } catch (err) {
      console.error('OpenClaw cron error:', err);
      return this.getMockCronJobs();
    }
  }

  // Mock data for when OpenClaw is not reachable
  private getMockStatus(): OpenClawStatus {
    return {
      version: '2026.2.17',
      agent: 'main',
      model: 'nvidia/moonshotai/kimi-k2.5',
      host: 'ClawdBot',
      sessions: 1,
      activeSubagents: 0,
      lastActivity: new Date().toISOString(),
    };
  }

  private getMockSessions(): Session[] {
    return [
      {
        key: 'agent:main:main',
        kind: 'main',
        channel: 'telegram',
        displayName: 'telegram:g-agent-main-main',
        model: 'moonshotai/kimi-k2.5',
        updatedAt: Date.now(),
      },
    ];
  }

  private getMockCronJobs(): CronJob[] {
    return [
      {
        id: 'gmail-auto-check',
        name: 'Gmail Auto-Check',
        enabled: true,
        schedule: 'every 10m',
        lastStatus: 'ok',
        nextRunAt: new Date(Date.now() + 600000).toISOString(),
      },
    ];
  }
}

export const openclaw = new OpenClawClient();
