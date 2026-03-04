import { NextResponse } from 'next/server';
import { openclaw } from '@/lib/openclaw-client';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jobs = await openclaw.getCronJobs();
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ jobs: [] }, { status: 500 });
  }
}
