import { create } from 'zustand';
import { supabase } from '../db';

interface User {
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
}

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Demo user for development
const DEMO_USER = {
  email: 'demo@example.com',
  user_metadata: {
    name: 'Demo User',
    role: 'admin'
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      // In development, check for demo credentials
      if (email === 'demo@example.com' && password === 'demo123') {
        const session = { user: DEMO_USER };
        localStorage.setItem('session', JSON.stringify(session));
        set({ user: DEMO_USER, session, loading: false });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      set({ user: data.user, session: data.session, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message || 'Invalid credentials' });
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      localStorage.removeItem('session');
      set({ user: null, session: null, loading: false });
    } catch (error: any) {
      console.error('Error signing out:', error);
      set({ loading: false, error: error.message });
    }
  },
  
  initialize: async () => {
    try {
      set({ loading: true, error: null });

      // Check for stored demo session first
      const storedSession = localStorage.getItem('session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        set({ session, user: session.user, loading: false });
        return;
      }

      // Set to demo user for development
      const session = { user: DEMO_USER };
      localStorage.setItem('session', JSON.stringify(session));
      set({ user: DEMO_USER, session, loading: false });
      
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      set({ loading: false, error: error.message });
    }
  },
}));