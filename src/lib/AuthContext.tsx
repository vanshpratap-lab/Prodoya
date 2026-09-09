import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from './supabase';
import { authApi } from './api';

interface AuthContextValue {
  token: string | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = async () => {
    try {
      const { user } = await authApi.me();
      setProfile(user);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    if (t) {
      setToken(t);
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    if (token) await fetchProfile();
  };

  const handleSignOut = async () => {
    await authApi.signOut();
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, profile, loading, refreshProfile, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthActions() {
  return { signIn: authApi.signIn, signUp: authApi.signUp };
}
