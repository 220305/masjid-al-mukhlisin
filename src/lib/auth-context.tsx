'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { AppUser } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (passwordOrEmail: string, maybePassword?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi Supabase jika terkonfigurasi
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Pengurus Masjid',
            role: 'admin',
          });
        } else {
          checkLocalSession();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Pengurus Masjid',
            role: 'admin',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      checkLocalSession();
      setLoading(false);
    }
  }, []);

  const checkLocalSession = () => {
    try {
      const stored = localStorage.getItem('masjid_user');
      const token = localStorage.getItem('access_token');
      if (stored && token) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const login = async (
    passwordOrEmail: string,
    maybePassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    let email = 'admin@masjid.id';
    let password = passwordOrEmail;

    // Jika dipanggil dengan 2 argumen: login(email, password)
    if (maybePassword !== undefined) {
      email = passwordOrEmail;
      password = maybePassword;
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Silakan masukkan kata sandi pengurus' };
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session) {
        const loggedUser: AppUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || 'Pengurus DKM Al-Mukhlisin',
          role: 'admin',
        };
        setUser(loggedUser);
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('masjid_user', JSON.stringify(loggedUser));
        return { success: true };
      }
    }

    // Standalone / Production fallback login (Hanya butuh sandi pengurus)
    const storedPw = typeof window !== 'undefined' ? (localStorage.getItem('masjid_admin_password') || localStorage.getItem('simas_pw')) : null;
    const defaultMasterPw = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (storedPw) {
      if (password !== storedPw && password !== defaultMasterPw) {
        return { success: false, error: 'Kata sandi tidak sesuai. Silakan coba lagi.' };
      }
    } else {
      if (password !== defaultMasterPw && password.length < 4) {
        return { success: false, error: 'Kata sandi minimal 4 karakter' };
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('masjid_admin_password', password);
      }
    }

    const fallbackUser: AppUser = {
      id: 'usr_local_admin',
      email: email,
      name: 'Admin DKM Al-Mukhlisin',
      role: 'admin',
    };
    setUser(fallbackUser);
    localStorage.setItem('access_token', 'masjid_auth_token_live');
    localStorage.setItem('masjid_user', JSON.stringify(fallbackUser));
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const newUser: AppUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: name,
          role: 'admin',
        };
        setUser(newUser);
        return { success: true };
      }
    }

    // Local fallback
    const fallbackUser: AppUser = {
      id: `usr_${Date.now()}`,
      email,
      name,
      role: 'admin',
    };
    setUser(fallbackUser);
    localStorage.setItem('access_token', 'masjid_auth_token_live');
    localStorage.setItem('masjid_user', JSON.stringify(fallbackUser));
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('masjid_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isSupabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
