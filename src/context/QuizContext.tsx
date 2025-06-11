import React, { createContext, useState, useContext, useEffect } from 'react';
import { DailyQuest, Quiz, Category, PersonalInfo } from '../types';
import { categories as initialCategories, dailyQuests, generatePersonalizedQuestions } from '../data/quizzes';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface QuizContextType {
  categories: Category[];
  dailyQuests: DailyQuest[];
  selectedCategory: Category | null;
  selectedQuiz: Quiz | null;
  completedQuizzes: string[];
  completedQuests: string[];
  setSelectedCategory: (category: Category | null) => void;
  setSelectedQuiz: (quiz: Quiz | null) => void;
  completeQuiz: (quizId: string, score: number, earnedXp: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  resetDailyQuests: () => Promise<void>;
  loading: boolean;
  loadQuizQuestions: (quizId: string) => Promise<void>;
  quizLoading: boolean;
}

const QuizContext = createContext<QuizContextType>({
  categories: [],
  dailyQuests: [],
  selectedCategory: null,
  selectedQuiz: null,
  completedQuizzes: [],
  completedQuests: [],
  setSelectedCategory: () => {},
  setSelectedQuiz: () => {},
  completeQuiz: async () => {},
  completeQuest: async () => {},
  resetDailyQuests: async () => {},
  loading: true,
  loadQuizQuestions: async () => {},
  quizLoading: false
});

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizCategories, setQuizCategories] = useState<Category[]>(initialCategories);
  const [quizDailyQuests, setQuizDailyQuests] = useState<DailyQuest[]>(dailyQuests);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  
  const { user, isAuthenticated, updateUserProgress } = useAuth();

  // Load user's completed quizzes from database
  const loadCompletedQuizzes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_quiz_completions')
        .select('quiz_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const quizIds = data?.map(completion => completion.quiz_id) || [];
      setCompletedQuizzes(quizIds);
    } catch (error) {
      console.error('Error loading completed quizzes:', error);
    }
  };

  // Load user's completed quests from database
  const loadCompletedQuests = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_quest_completions')
        .select('quest_id')
        .eq('user_id', user.id)
        .eq('reset_date', today);

      if (error) throw error;

      const questIds = data?.map(completion => completion.quest_id) || [];
      setCompletedQuests(questIds);
    } catch (error) {
      console.error('Error loading completed quests:', error);
    }
  };

  // Reset daily quests (remove old completions)
  const resetDailyQuests = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Delete quest completions from previous days
      const { error } = await supabase
        .from('user_quest_completions')
        .delete()
        .eq('user_id', user.id)
        .neq('reset_date', today);

      if (error) throw error;

      // Reload current day's completions
      await loadCompletedQuests();
    } catch (error) {
      console.error('Error resetting daily quests:', error);
    }
  };

  useEffect(() => {
    const initializeQuizzes = async () => {
      if (isAuthenticated && user?.id) {
        try {
          setLoading(true);
          
          await Promise.all([
            loadCompletedQuizzes(),
            loadCompletedQuests()
          ]);

          // Check if we need to reset daily quests
          const lastResetDate = localStorage.getItem(`${user.id}_lastQuestReset`);
          const today = new Date().toDateString();
          
          if (lastResetDate !== today) {
            await resetDailyQuests();
            localStorage.setItem(`${user.id}_lastQuestReset`, today);
          }
        } catch (error) {
          console.error('Error initializing quizzes:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeQuizzes();
  }, [isAuthenticated, user]);

  const loadQuizQuestions = async (quizId: string) => {
    try {
      setQuizLoading(true);
      
      // Find the quiz in categories
      let foundQuiz: Quiz | null = null;
      let categoryIndex = -1;
      let quizIndex = -1;
      
      for (let i = 0; i < quizCategories.length; i++) {
        const category = quizCategories[i];
        const qIndex = category.quizzes.findIndex(q => q.id === quizId);
        if (qIndex !== -1) {
          foundQuiz = category.quizzes[qIndex];
          categoryIndex = i;
          quizIndex = qIndex;
          break;
        }
      }
      
      if (!foundQuiz || categoryIndex === -1 || quizIndex === -1) {
        throw new Error('Quiz not found');
      }
      
      // Always generate fresh questions for each quiz attempt
      const [category, difficulty] = quizId.split('-');
      console.log(`Generating personalized questions for ${category} (${difficulty}) with user info:`, user?.personalInfo);
      
      const questions = await generatePersonalizedQuestions(
        category,
        difficulty as 'easy' | 'medium' | 'hard',
        user?.personalInfo
      );
      
      // Update the quiz with new questions
      const updatedCategories = [...quizCategories];
      updatedCategories[categoryIndex].quizzes[quizIndex].questions = questions;
      setQuizCategories(updatedCategories);
      
      // Update selected quiz if this is the current quiz
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz({
          ...selectedQuiz,
          questions
        });
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  const completeQuiz = async (quizId: string, score: number, earnedXp: number) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Save quiz completion to database
      const { error: insertError } = await supabase
        .from('user_quiz_completions')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          earned_xp: earnedXp
        });

      if (insertError) throw insertError;

      // Update local state
      const updatedCompletedQuizzes = [...completedQuizzes, quizId];
      setCompletedQuizzes(updatedCompletedQuizzes);

      // Update user progress
      const newXp = user.xp + earnedXp;
      let newLevel = user.level;
      let newXpToNextLevel = user.xpToNextLevel;

      if (newXp >= user.xpToNextLevel) {
        newLevel += 1;
        const remainingXp = newXp - user.xpToNextLevel;
        newXpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
        await updateUserProgress(remainingXp, newLevel, newXpToNextLevel);
      } else {
        await updateUserProgress(newXp, newLevel, newXpToNextLevel);
      }
      
      // Update quest completion based on quiz category and performance
      const [category] = quizId.split('-');
      const questsToComplete: string[] = [];
      
      // Check category-specific quests
      const categoryQuestMap: Record<string, string> = {
        'dailyTasks': 'quest1',
        'familyRecognition': 'quest2',
        'simpleTasks': 'quest3',
        'memoryExercises': 'quest4',
        'timeOrientation': 'quest5'
      };
      
      const categoryQuest = categoryQuestMap[category];
      if (categoryQuest && !completedQuests.includes(categoryQuest)) {
        questsToComplete.push(categoryQuest);
      }
      
      // Check perfect score quest
      if (score === 100 && !completedQuests.includes('quest6')) {
        questsToComplete.push('quest6');
      }
      
      // Complete quests
      for (const questId of questsToComplete) {
        await completeQuest(questId);
      }

      // Check for quiz streak quest
      if (updatedCompletedQuizzes.length >= 3 && !completedQuests.includes('quest7')) {
        await completeQuest('quest7');
      }
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const completeQuest = async (questId: string) => {
    if (!isAuthenticated || !user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Save quest completion to database
      const { error } = await supabase
        .from('user_quest_completions')
        .insert({
          user_id: user.id,
          quest_id: questId,
          reset_date: today
        });

      if (error) throw error;

      // Update local state
      const updatedCompletedQuests = [...completedQuests, questId];
      setCompletedQuests(updatedCompletedQuests);
      
      // Update quest display
      const updatedQuests = quizDailyQuests.map(quest => 
        quest.id === questId ? { ...quest, completed: true } : quest
      );
      setQuizDailyQuests(updatedQuests);
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  return (
    <QuizContext.Provider value={{
      categories: quizCategories,
      dailyQuests: quizDailyQuests.map(quest => ({
        ...quest,
        completed: completedQuests.includes(quest.id)
      })),
      selectedCategory,
      selectedQuiz,
      completedQuizzes,
      completedQuests,
      setSelectedCategory,
      setSelectedQuiz,
      completeQuiz,
      completeQuest,
      resetDailyQuests,
      loading,
      loadQuizQuestions,
      quizLoading
    }}>
      {children}
    </QuizContext.Provider>
  );
};