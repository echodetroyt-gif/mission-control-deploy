import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const openclawUrl = process.env.OPENCLAW_API_URL;
    
    if (!openclawUrl) {
      return NextResponse.json({
        connected: false,
        version: '2026.2.17',
        agent: 'main',
        model: 'nvidia/moonshotai/kimi-k2.5',
        host: 'ClawdBot',
        sessions: 1,
        activeSubagents: 0,
        lastActivity: new Date().toISOString(),
        note: 'OPENCLAW_API_URL not configured'
      });
    }

    // Try to fetch real status from OpenClaw
    const res = await fetch(`${openclawUrl}/api/status`, { 
      timeout: 5000 
    }).catch(() => null);
    
    if (!res || !res.ok) {
      // Fallback to mock data with connection status
      return NextResponse.json({
        connected: false,
        version: '2026.2.17',
        agent: 'main',
        model: 'nvidia/moonshotai/kimi-k2.5',
        host: 'ClawdBot',
        sessions: 1,
        activeSubagents: 0,
        lastActivity: new Date().toISOString(),
        error: 'Could not connect to OpenClaw gateway'
      });
    }

    const data = await res.json();
    return NextResponse.json({ connected: true, ...data });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ 
      connected: false,
      error: 'Failed to fetch status'
    }, { status: 500 });
  }
}
