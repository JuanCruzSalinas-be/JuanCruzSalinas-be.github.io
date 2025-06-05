import React, { createContext, useState, useContext, useEffect } from 'react';
import { DailyQuest, Quiz, Category, PersonalInfo } from '../types';
import { categories as initialCategories, dailyQuests, generatePersonalizedQuestions } from '../data/quizzes';
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
  completeQuiz: () => {},
  completeQuest: () => {},
  resetDailyQuests: () => {},
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
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeQuizzes = async () => {
      if (isAuthenticated && user?.id) {
        try {
          setLoading(true);
          
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
      
      // Generate questions if not already loaded
      if (foundQuiz.questions.length === 0) {
        const [category, difficulty] = quizId.split('-');
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
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
    } finally {
      setQuizLoading(false);
    }
  };

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
      loading,
      loadQuizQuestions,
      quizLoading
    }}>
      {children}
    </QuizContext.Provider>
  );
};