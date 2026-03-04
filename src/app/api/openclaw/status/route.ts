import { NextResponse } from 'next/server';
import { openclaw } from '@/lib/openclaw-client';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await openclaw.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
