import React, { createContext, useState, useContext, useEffect } from 'react';
import { DailyQuest, Quiz, Category, PersonalInfo } from '../types';
import { generateCategories, dailyQuests } from '../data/quizzes';
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
  loading: boolean;
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
  resetDailyQuests: () => {},
  loading: true
});

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizCategories, setQuizCategories] = useState<Category[]>([]);
  const [quizDailyQuests, setQuizDailyQuests] = useState<DailyQuest[]>(dailyQuests);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeQuizzes = async () => {
      if (isAuthenticated && user?.id) {
        try {
          setLoading(true);
          // Load personal info
          const storedPersonalInfo = localStorage.getItem(`${user.id}_personalInfo`);
          const personalInfo = storedPersonalInfo ? JSON.parse(storedPersonalInfo) as PersonalInfo : undefined;
          
          // Generate categories with personalized questions
          const categories = await generateCategories(personalInfo);
          setQuizCategories(categories);
          
          // Load completed quizzes
          const storedCompletedQuizzes = localStorage.getItem(`${user.id}_completedQuizzes`);
          if (storedCompletedQuizzes) {
            setCompletedQuizzes(JSON.parse(storedCompletedQuizzes));
          }
          
          // Load completed quests
          const storedCompletedQuests = localStorage.getItem(`${user.id}_completedQuests`);
          if (storedCompletedQuests) {
            setCompletedQuests(JSON.parse(storedCompletedQuests));
          }

          // Check if we need to reset daily quests
          const lastResetDate = localStorage.getItem(`${user.id}_lastQuestReset`);
          const today = new Date().toDateString();
          
          if (lastResetDate !== today) {
            resetDailyQuests();
            localStorage.setItem(`${user.id}_lastQuestReset`, today);
          }
        } catch (error) {
          console.error('Error initializing quizzes:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeQuizzes();
  }, [isAuthenticated, user]);

  const completeQuiz = (quizId: string, score: number, earnedXp: number) => {
    if (!isAuthenticated) return;
    
    const updatedCompletedQuizzes = [...completedQuizzes, quizId];
    setCompletedQuizzes(updatedCompletedQuizzes);
    localStorage.setItem(`${user?.id}_completedQuizzes`, JSON.stringify(updatedCompletedQuizzes));
    
    const updatedQuests = quizDailyQuests.map(quest => {
      if (quest.description.includes(selectedQuiz?.title || '') && !quest.completed) {
        return { ...quest, completed: true };
      }
      
      if (quest.title === 'Perfect Score' && score === 100 && !quest.completed) {
        return { ...quest, completed: true };
      }
      
      return quest;
    });
    
    setQuizDailyQuests(updatedQuests);
    
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
    
    const updatedQuests = quizDailyQuests.map(quest => 
      quest.id === questId ? { ...quest, completed: true } : quest
    );
    
    setQuizDailyQuests(updatedQuests);
    
    const updatedCompletedQuests = [...completedQuests, questId];
    setCompletedQuests(updatedCompletedQuests);
    localStorage.setItem(`${user?.id}_completedQuests`, JSON.stringify(updatedCompletedQuests));
  };

  const resetDailyQuests = () => {
    if (!isAuthenticated) return;
    
    const resetQuests = quizDailyQuests.map(quest => ({ ...quest, completed: false }));
    setQuizDailyQuests(resetQuests);
    
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
      resetDailyQuests,
      loading
    }}>
      {children}
    </QuizContext.Provider>
  );
}