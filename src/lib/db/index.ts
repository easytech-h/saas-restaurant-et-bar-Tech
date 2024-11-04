import { LocalStorageDB } from './LocalStorageDB';
import { getSupabaseClient } from './supabase';

// Initialize local storage database
export const localDb = new LocalStorageDB('restaurant_pos');

// Initialize Supabase client
export const supabase = getSupabaseClient();

// Sync function for development
export async function syncDatabases(): Promise<void> {
  try {
    // In development, just log the sync attempt
    console.log('Database sync simulated in development mode');
  } catch (error) {
    console.error('Database sync failed:', error);
    throw error;
  }
}