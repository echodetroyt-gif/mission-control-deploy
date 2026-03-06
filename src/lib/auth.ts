/**
 * Authentication Management
 * Simple auth system for Mission Control
 */

const AUTH_KEY = 'mission-control-auth';
const AUTH_EXPIRY_KEY = 'mission-control-auth-expiry';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthState {
  isAuthenticated: boolean;
  username: string;
  loginTime: number;
}

/**
 * Get stored auth state
 */
export function getAuthState(): AuthState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    if (!expiry) return null;
    
    if (Date.now() > parseInt(expiry)) {
      // Session expired
      logout();
      return null;
    }
    
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Validate credentials against environment config
 * Server-side validation happens via API
 */
export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Cannot login on server' };
  }
  
  try {
    // Validate via API endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Invalid credentials' };
    }
    
    // Store auth state
    const authState: AuthState = {
      isAuthenticated: true,
      username,
      loginTime: Date.now(),
    };
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    localStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Logout - clear stored auth
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthState() !== null;
}
