import type { Profile, AuthTokens } from './supabase';

const BASE = '/api/v1';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function hasToken(): boolean {
  return token() !== null;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = token();
  if (t) headers['Authorization'] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });

  if (res.status === 401) {
    // Reload only when a stale token existed (session expired mid-use).
    // Logged-out screens have no token — just throw so callers no-op
    // instead of entering an infinite reload loop.
    const hadToken = token() !== null;
    localStorage.removeItem('auth_token');
    if (hadToken) window.location.reload();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

function qs(params: Record<string, any> | undefined): string {
  if (!params) return '';
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      for (const item of v) u.append(k, String(item));
    } else {
      u.append(k, String(v));
    }
  }
  const s = u.toString();
  return s ? `?${s}` : '';
}

export const api = {
  get: <T>(path: string, params?: Record<string, any>) => request<T>(`${path}${qs(params)}`),

  post: <T>(path: string, body?: any) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body?: any) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: any) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  postForm: async <T>(path: string, form: FormData) => {
    const headers: Record<string, string> = {};
    const t = token();
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const res = await fetch(`${BASE}${path}`, { method: 'POST', body: form, headers });
    if (res.status === 401) {
      const hadToken = token() !== null;
      localStorage.removeItem('auth_token');
      if (hadToken) window.location.reload();
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
  },
};

export const authApi = {
  signIn: async (email: string, password: string) =>
    api.post<AuthTokens>('/auth/sign_in', { email, password }),

  signUp: async (email: string, password: string, fullName: string, college: string, username?: string) =>
    api.post<AuthTokens>('/auth/sign_up', { email, password, full_name: fullName, college, username }),

  signOut: async () => {
    localStorage.removeItem('auth_token');
    await api.delete('/auth/sign_out');
  },

  me: async () => api.get<{ user: Profile }>('/users/me'),
};
