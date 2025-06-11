import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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