import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Simple in-memory message store (would use proper DB in production)
const messages: Array<{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}> = [];

export async function GET() {
  // Return last 50 messages
  return NextResponse.json({ 
    messages: messages.slice(-50).reverse() 
  });
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Add user message
    const userMsg = {
      id: uuidv4(),
      role: 'user' as const,
      content: message,
      timestamp: Date.now(),
    };
    messages.push(userMsg);

    // Forward to OpenClaw if tunnel is available
    const openclawUrl = process.env.OPENCLAW_API_URL;
    let assistantReply = "I'm not currently connected to OpenClaw. Please check the tunnel status.";

    if (openclawUrl) {
      try {
        const res = await fetch(`${openclawUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
          signal: AbortSignal.timeout(30000),
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          assistantReply = data.reply || "Received empty response";
        }
      } catch (err) {
        console.error('OpenClaw chat error:', err);
        assistantReply = "Connected to OpenClaw but got an error. Using fallback.";
      }
    }

    // Add assistant message
    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant' as const,
      content: assistantReply,
      timestamp: Date.now(),
    };
    messages.push(assistantMsg);

    return NextResponse.json({ 
      message: assistantMsg,
      connected: !!openclawUrl 
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
