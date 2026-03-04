import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const openclawUrl = process.env.OPENCLAW_API_URL;
    
    if (!openclawUrl) {
      return NextResponse.json({
        disk: { used: '20%', free: '182G', total: '235G' },
        memory: { used: '3.1G', total: '7.9G', percent: 39 },
        uptime: '2 days',
        load: [0.5, 0.3, 0.2],
        host: 'ClawdBot',
        platform: 'Linux 6.12.62+rpt-rpi-2712 (arm64)',
        services: [
          { name: 'OpenClaw', status: 'running', since: '2 days' },
          { name: 'Home Assistant', status: 'running', since: '21 hours' },
          { name: 'IMAP IDLE', status: 'running', since: '21 hours' },
        ]
      });
    }

    const res = await fetch(`${openclawUrl}/api/system`, { timeout: 5000 }).catch(() => null);
    
    if (!res || !res.ok) {
      return NextResponse.json({
        disk: { used: '20%', free: '182G', total: '235G' },
        memory: { used: '3.1G', total: '7.9G', percent: 39 },
        host: 'ClawdBot',
        error: 'Could not fetch from Pi',
        services: [
          { name: 'OpenClaw', status: 'running' },
          { name: 'Home Assistant', status: 'running' },
          { name: 'IMAP IDLE', status: 'running' },
        ]
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch system stats'
    }, { status: 500 });
  }
}
