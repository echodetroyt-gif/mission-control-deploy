import { NextResponse } from 'next/server';
import { db } from '@/lib/db/vercel-db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get agents from in-memory store
    const agents = db.agents.findAll();
    
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Agents fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}
