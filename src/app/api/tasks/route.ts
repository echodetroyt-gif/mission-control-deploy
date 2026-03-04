import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const tasks = [
  { id: '1', title: 'Here.Now Skill', status: 'completed', priority: 'high', category: 'Skills' },
  { id: '2', title: 'IMAP IDLE Service', status: 'in-progress', priority: 'high', category: 'Automation' },
  { id: '3', title: 'Console Scenes Research', status: 'completed', priority: 'high', category: 'Audio' },
  { id: '4', title: 'Home Assistant Integration', status: 'running', priority: 'medium', category: 'Home' },
  { id: '5', title: 'Mission Control Dashboard', status: 'in-progress', priority: 'high', category: 'Dev' },
];

export async function GET() {
  return NextResponse.json({ tasks });
}
