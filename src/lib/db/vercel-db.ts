/**
 * Serverless-compatible database layer for Vercel
 * Uses in-memory storage since SQLite file writes don't persist in serverless
 */
import { v4 as uuidv4 } from 'uuid';

// Demo data for Vercel serverless environment
const demoData = {
  workspaces: [
    { id: 'default', name: 'Default Workspace', slug: 'default', description: 'Main workspace', icon: 'home', createdAt: new Date().toISOString() },
    { id: 'audio', name: 'Audio Console Control', slug: 'audio', description: 'Audio mixing console scenes', icon: 'audio', createdAt: new Date().toISOString() },
  ],
  projects: [
    { id: '1', workspaceId: 'default', name: 'OpenClaw Setup', description: 'Deploy Mission Control', status: 'active', priority: 'high', createdAt: new Date().toISOString() },
    { id: '2', workspaceId: 'default', name: 'Email Automation', description: 'IMAP IDLE integration', status: 'active', priority: 'medium', createdAt: new Date().toISOString() },
    { id: '3', workspaceId: 'audio', name: 'DiGiCo Scene Library', description: 'Building console scenes', status: 'in_progress', priority: 'high', createdAt: new Date().toISOString() },
  ],
  tasks: [
    { id: 't1', projectId: '1', title: 'Deploy Mission Control to Vercel', status: 'in_progress', priority: 'high', assignedTo: 'clawdbot', createdAt: new Date().toISOString() },
    { id: 't2', projectId: '1', title: 'Add OpenClaw API integration', status: 'todo', priority: 'high', assignedTo: 'clawdbot', createdAt: new Date().toISOString() },
    { id: 't3', projectId: '2', title: 'IMAP IDLE service running', status: 'completed', priority: 'medium', assignedTo: 'clawdbot', createdAt: new Date().toISOString() },
    { id: 't4', projectId: '3', title: 'Research DiGiCo SD format', status: 'completed', priority: 'high', assignedTo: 'clawdbot', createdAt: new Date().toISOString() },
  ],
  agents: [
    { id: 'clawdbot', name: 'Clawdbot', status: 'online', type: 'main', lastSeen: new Date().toISOString(), capabilities: ['telegram', 'email', 'osc', 'cron'] },
    { id: 'subagent-2121', name: 'Deploy Agent', status: 'idle', type: 'subagent', lastSeen: new Date().toISOString(), capabilities: ['vercel', 'build'] },
  ],
};

// In-memory store
const store = { ...demoData };

export const db = {
  workspaces: {
    findAll: () => store.workspaces,
    findById: (id: string) => store.workspaces.find(w => w.id === id),
  },
  projects: {
    findAll: (workspaceId?: string) => 
      workspaceId ? store.projects.filter(p => p.workspaceId === workspaceId) : store.projects,
    findById: (id: string) => store.projects.find(p => p.id === id),
  },
  tasks: {
    findAll: (projectId?: string) =>
      projectId ? store.tasks.filter(t => t.projectId === projectId) : store.tasks,
    findById: (id: string) => store.tasks.find(t => t.id === id),
    update: (id: string, updates: any) => {
      const idx = store.tasks.findIndex(t => t.id === id);
      if (idx >= 0) store.tasks[idx] = { ...store.tasks[idx], ...updates };
      return store.tasks[idx];
    },
    create: (data: any) => {
      const task = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      store.tasks.push(task as any);
      return task;
    },
  },
  agents: {
    findAll: () => store.agents,
    updateStatus: (id: string, status: string) => {
      const idx = store.agents.findIndex(a => a.id === id);
      if (idx >= 0) {
        store.agents[idx].status = status;
        store.agents[idx].lastSeen = new Date().toISOString();
      }
    },
  },
};

// For Vercel, we can't use SQLite - this is a lightweight in-memory alternative
export const isVercel = process.env.VERCEL === '1';
