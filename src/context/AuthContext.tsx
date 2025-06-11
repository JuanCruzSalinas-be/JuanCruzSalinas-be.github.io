import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, PersonalInfo } from '../types';
import { supabase, UserProfile } from '../lib/supabase';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updatePersonalInfo: (info: PersonalInfo) => Promise<void>;
  updateUserProgress: (xp: number, level: number, xpToNextLevel: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
  updatePersonalInfo: async () => {},
  updateUserProgress: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Supabase user profile to app user format
  const convertToAppUser = (profile: UserProfile): User => ({
    id: profile.id,
    name: profile.name,
    level: profile.level,
    xp: profile.xp,
    xpToNextLevel: profile.xp_to_next_level,
    personalInfo: profile.personal_info || undefined
  });

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return profile ? convertToAppUser(profile) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Create user profile in database
  const createUserProfile = async (userId: string, name: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          name,
          level: 0,
          xp: 0,
          xp_to_next_level: 100,
          personal_info: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return profile ? convertToAppUser(profile) : null;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  // Check authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadUserProfile(session.user.id);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const profile = await loadUserProfile(data.user.id);
        setUser(profile);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const profile = await createUserProfile(data.user.id, name);
        setUser(profile);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updatePersonalInfo = async (info: PersonalInfo) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ personal_info: info })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser({
        ...user,
        personalInfo: info
      });
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  };

  const updateUserProgress = async (xp: number, level: number, xpToNextLevel: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          xp,
          level,
          xp_to_next_level: xpToNextLevel
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser({
        ...user,
        xp,
        level,
        xpToNextLevel
      });
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      loading,
      updatePersonalInfo,
      updateUserProgress
    }}>
      {children}
    </AuthContext.Provider>
  );
};