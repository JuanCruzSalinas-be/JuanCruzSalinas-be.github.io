import React, { createContext, useState, useContext, useEffect } from 'react';
import { DailyQuest, Quiz, Category } from '../types';
import { categories, dailyQuests } from '../data/quizzes';
import { useAuth } from './AuthContext';

interface QuizContextType {
  categories: Category[];
  dailyQuests: DailyQuest[];
  selectedCategory: Category | null;
  selectedQuiz: Quiz | null;
  completedQuizzes: string[];
  completedQuests: string[];
  setSelectedCategory: (category: Category | null) => void;
  setSelectedQuiz: (quiz: Quiz | null) => void;
  completeQuiz: (quizId: string, score: number, earnedXp: number) => void;
  completeQuest: (questId: string) => void;
  resetDailyQuests: () => void;
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
  completeQuiz: () => {},
  completeQuest: () => {},
  resetDailyQuests: () => {}
});

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizCategories, setQuizCategories] = useState<Category[]>(categories);
  const [quizDailyQuests, setQuizDailyQuests] = useState<DailyQuest[]>(dailyQuests);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Load completed quizzes from localStorage
      const storedCompletedQuizzes = localStorage.getItem(`${user?.id}_completedQuizzes`);
      if (storedCompletedQuizzes) {
        setCompletedQuizzes(JSON.parse(storedCompletedQuizzes));
      }
      
      // Load completed quests from localStorage
      const storedCompletedQuests = localStorage.getItem(`${user?.id}_completedQuests`);
      if (storedCompletedQuests) {
        setCompletedQuests(JSON.parse(storedCompletedQuests));
      }

      // Check if we need to reset daily quests (if last reset was on a different day)
      const lastResetDate = localStorage.getItem(`${user?.id}_lastQuestReset`);
      const today = new Date().toDateString();
      
      if (lastResetDate !== today) {
        resetDailyQuests();
        localStorage.setItem(`${user?.id}_lastQuestReset`, today);
      }
    }
  }, [isAuthenticated, user]);

  const completeQuiz = (quizId: string, score: number, earnedXp: number) => {
    if (!isAuthenticated) return;
    
    // Add quiz to completed quizzes
    const updatedCompletedQuizzes = [...completedQuizzes, quizId];
    setCompletedQuizzes(updatedCompletedQuizzes);
    localStorage.setItem(`${user?.id}_completedQuizzes`, JSON.stringify(updatedCompletedQuizzes));
    
    // Check if any quests are completed by this quiz
    const updatedQuests = quizDailyQuests.map(quest => {
      // If quest is about completing a specific quiz
      if (quest.description.includes(selectedQuiz?.title || '') && !quest.completed) {
        return { ...quest, completed: true };
      }
      
      // If quest is about getting 100% on any quiz
      if (quest.title === 'Perfect Score' && score === 100 && !quest.completed) {
        return { ...quest, completed: true };
      }
      
      return quest;
    });
    
    setQuizDailyQuests(updatedQuests);
    
    // Update completed quests
    const newlyCompletedQuests = updatedQuests
      .filter(q => q.completed && !completedQuests.includes(q.id))
      .map(q => q.id);
    
    if (newlyCompletedQuests.length > 0) {
      const updatedCompletedQuests = [...completedQuests, ...newlyCompletedQuests];
      setCompletedQuests(updatedCompletedQuests);
      localStorage.setItem(`${user?.id}_completedQuests`, JSON.stringify(updatedCompletedQuests));
    }
  };

  const completeQuest = (questId: string) => {
    if (!isAuthenticated) return;
    
    // Mark quest as completed
    const updatedQuests = quizDailyQuests.map(quest => 
      quest.id === questId ? { ...quest, completed: true } : quest
    );
    
    setQuizDailyQuests(updatedQuests);
    
    // Add to completed quests
    const updatedCompletedQuests = [...completedQuests, questId];
    setCompletedQuests(updatedCompletedQuests);
    localStorage.setItem(`${user?.id}_completedQuests`, JSON.stringify(updatedCompletedQuests));
  };

  const resetDailyQuests = () => {
    if (!isAuthenticated) return;
    
    // Reset all daily quests
    const resetQuests = quizDailyQuests.map(quest => ({ ...quest, completed: false }));
    setQuizDailyQuests(resetQuests);
    
    // Clear completed quests
    setCompletedQuests([]);
    localStorage.removeItem(`${user?.id}_completedQuests`);
  };

  return (
    <QuizContext.Provider value={{
      categories: quizCategories,
      dailyQuests: quizDailyQuests,
      selectedCategory,
      selectedQuiz,
      completedQuizzes,
      completedQuests,
      setSelectedCategory,
      setSelectedQuiz,
      completeQuiz,
      completeQuest,
      resetDailyQuests
    }}>
      {children}
    </QuizContext.Provider>
  );
};