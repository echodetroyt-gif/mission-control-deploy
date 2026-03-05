import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Task history - would come from OpenClaw in real setup
const taskHistory = [
  { 
    id: '1', 
    title: 'Here.Now Skill', 
    status: 'completed', 
    priority: 'high', 
    category: 'Skills',
    completedAt: '2026-03-02T10:00:00Z',
    notes: 'Created publish script for instant web deployment'
  },
  { 
    id: '2', 
    title: 'IMAP IDLE Service', 
    status: 'completed', 
    priority: 'high', 
    category: 'Automation',
    completedAt: '2026-03-03T08:00:00Z',
    notes: 'Running stable, monitoring Gmail for calendar invites'
  },
  { 
    id: '3', 
    title: 'Console Scenes Research', 
    status: 'completed', 
    priority: 'high', 
    category: 'Audio',
    completedAt: '2026-02-28T15:00:00Z',
    notes: 'Built OSC creator for DiGiCo/Midas/Yamaha/Avid'
  },
  { 
    id: '4', 
    title: 'Mission Control Dashboard', 
    status: 'completed', 
    priority: 'high', 
    category: 'Dev',
    completedAt: '2026-03-04T18:00:00Z',
    notes: 'Deployed to Vercel with OpenClaw API integration'
  },
];

const activeTasks = [
  { 
    id: '5', 
    title: 'Home Assistant Integration', 
    status: 'running', 
    priority: 'medium', 
    category: 'Home',
    startedAt: '2026-03-03T20:00:00Z',
    notes: 'Running 24+ hours, needs dashboard widgets'
  },
  { 
    id: '6', 
    title: 'ngrok Tunnel Monitoring', 
    status: 'in-progress', 
    priority: 'medium', 
    category: 'Infrastructure',
    startedAt: '2026-03-04T17:00:00Z',
    notes: 'Auto-restart on disconnect'
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'all';
  
  let tasks = [];
  if (type === 'completed') tasks = taskHistory;
  else if (type === 'active') tasks = activeTasks;
  else tasks = [...activeTasks, ...taskHistory];
  
  // Sort by date (newest first)
  tasks.sort((a: any, b: any) => {
    const dateA = a.completedAt || a.startedAt || '';
    const dateB = b.completedAt || b.startedAt || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  return NextResponse.json({ tasks });
}
