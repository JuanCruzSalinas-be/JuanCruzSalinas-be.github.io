import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseAvailable, UserProfile, QuizCompletion, QuestCompletion } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { PersonalInfo } from '../types';

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  recordQuizCompletion: (quizId: string, score: number, earnedXP: number) => Promise<void>;
  recordQuestCompletion: (questId: string) => Promise<void>;
  getQuizCompletions: () => Promise<QuizCompletion[]>;
  getQuestCompletions: () => Promise<QuestCompletion[]>;
  resetDailyQuests: () => Promise<void>;
  updatePersonalInfo: (personalInfo: PersonalInfo) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSupabaseConnected } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConnected || !supabase) {
      // Create a mock profile for offline mode
      const mockProfile: UserProfile = {
        id: 'offline-user',
        name: 'Guest User',
        level: 1,
        xp: 0,
        xp_to_next_level: 100,
        personal_info: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(mockProfile);
      setLoading(false);
      return;
    }

    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, isSupabaseConnected]);

  const loadProfile = async () => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        await createProfile();
      } else if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (retryCount = 0) => {
    if (!user || !supabase) return;

    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      const newProfile = {
        id: user.id,
        name: user.user_metadata?.name || 'User',
        level: 1,
        xp: 0,
        xp_to_next_level: 100,
        personal_info: {},
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        // Check if it's a foreign key constraint violation (user not yet available)
        if (error.code === '23503' && retryCount < maxRetries) {
          console.log(`Profile creation failed due to foreign key constraint. Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Retry with exponential backoff
          return await createProfile(retryCount + 1);
        }
        
        console.error('Error creating profile:', error);
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      
      // If we've exhausted retries, still try to set loading to false
      if (retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
    }
  };

  const addXP = async (amount: number) => {
    if (!profile) return;

    const newXP = profile.xp + amount;
    let newLevel = profile.level;
    let xpToNextLevel = profile.xp_to_next_level;

    // Check for level up
    while (newXP >= xpToNextLevel) {
      newLevel++;
      xpToNextLevel = newLevel * 100; // Each level requires level * 100 XP
    }

    await updateProfile({
      xp: newXP,
      level: newLevel,
      xp_to_next_level: xpToNextLevel,
    });
  };

  const recordQuizCompletion = async (quizId: string, score: number, earnedXP: number) => {
    if (!user || !supabase) return;

    try {
      await supabase
        .from('user_quiz_completions')
        .insert([{
          user_id: user.id,
          quiz_id: quizId,
          score,
          earned_xp: earnedXP,
        }]);

      await addXP(earnedXP);
    } catch (error) {
      console.error('Error recording quiz completion:', error);
    }
  };

  const recordQuestCompletion = async (questId: string) => {
    if (!user || !supabase) return;

    try {
      await supabase
        .from('user_quest_completions')
        .insert([{
          user_id: user.id,
          quest_id: questId,
        }]);
    } catch (error) {
      console.error('Error recording quest completion:', error);
    }
  };

  const getQuizCompletions = async (): Promise<QuizCompletion[]> => {
    if (!user || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('user_quiz_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error getting quiz completions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getQuizCompletions:', error);
      return [];
    }
  };

  const getQuestCompletions = async (): Promise<QuestCompletion[]> => {
    if (!user || !supabase) return [];

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_quest_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('reset_date', today);

      if (error) {
        console.error('Error getting quest completions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getQuestCompletions:', error);
      return [];
    }
  };

  const resetDailyQuests = async () => {
    if (!user || !supabase) return;

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      await supabase
        .from('user_quest_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('reset_date', yesterdayStr);
    } catch (error) {
      console.error('Error resetting daily quests:', error);
    }
  };

  const updatePersonalInfo = async (personalInfo: PersonalInfo) => {
    await updateProfile({ personal_info: personalInfo });
  };

  const value = {
    profile,
    loading,
    updateProfile,
    addXP,
    recordQuizCompletion,
    recordQuestCompletion,
    getQuizCompletions,
    getQuestCompletions,
    resetDailyQuests,
    updatePersonalInfo,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};