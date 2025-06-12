import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have valid Supabase credentials
const hasValidCredentials = () => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key' &&
    supabaseAnonKey !== 'your-anon-key' &&
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey.length > 20
  );
};

// Only create the client if we have valid credentials
export const supabase = hasValidCredentials() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Database types
export interface UserProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  personal_info: any;
  created_at: string;
  updated_at: string;
}

export interface QuizCompletion {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  earned_xp: number;
  completed_at: string;
}

export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completed_at: string;
  reset_date: string;
}