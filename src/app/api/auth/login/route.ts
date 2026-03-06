import { NextRequest, NextResponse } from 'next/server';

/**
 * Login endpoint - validates credentials against env vars
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Get expected credentials from environment
    const expectedUsername = process.env.BASIC_AUTH_USERNAME;
    const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

    // If env vars not set, authentication is disabled (dev mode)
    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      );
    }

    // Validate credentials
    if (username === expectedUsername && password === expectedPassword) {
      return NextResponse.json({ success: true });
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
