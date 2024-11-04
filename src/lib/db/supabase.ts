import { createClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './types';

const defaultConfig: SupabaseConfig = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key'
};

export const getSupabaseClient = (config: Partial<SupabaseConfig> = {}) => {
  const { url, anonKey } = { ...defaultConfig, ...config };
  return createClient(
    import.meta.env.VITE_SUPABASE_URL || url,
    import.meta.env.VITE_SUPABASE_ANON_KEY || anonKey
  );
}