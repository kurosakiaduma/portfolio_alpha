/**
 * Admin authentication utilities.
 * Handles JWT token management, session verification, and login/logout flows.
 */

const AUTH_TOKEN_KEY = 'admin_token';
const AUTH_USER_KEY = 'admin_user';
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || '/api';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Get stored auth token — localStorage first, cookie fallback.
 * Keeps the two in sync so a cookie-only session is still picked up.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const fromStorage = localStorage.getItem(AUTH_TOKEN_KEY);
  if (fromStorage) return fromStorage;
  // Fall back to cookie (set by backend on login)
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set auth token in localStorage.
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Clear auth token from localStorage and cookies.
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  // Expire cookie regardless of path it was set on
  const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `admin_token=; path=/; ${expiry}; SameSite=Lax`;
  document.cookie = `admin_token=; path=/alter; ${expiry}; SameSite=Lax`;
}

/**
 * Get stored user from localStorage.
 */
export function getStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set user in localStorage.
 */
export function setStoredUser(user: AdminUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * Login with email/password. Returns token and user data.
 */
export async function login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  setAuthToken(data.token);
  setStoredUser(data.user);
  return { token: data.token, user: data.user };
}

/**
 * Logout: clear stored tokens and redirect.
 */
export function logout(): void {
  clearAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/alter/login';
  }
}

/**
 * Verify token with backend (server-side or client-side).
 */
export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (has token + user in storage).
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = getAuthToken();
  const user = getStoredUser();
  return !!(token && user);
}
