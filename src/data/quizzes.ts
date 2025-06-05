import { Category, DailyQuest, Question, PersonalInfo } from '../types';
import { Clock, Home, Brain, Users, BookOpen, Calendar } from 'lucide-react';

// Helper function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate default questions for fallback
const generateDefaultQuestions = (category: string, difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
  const defaultQuestions: Question[] = [
    {
      id: `${category}-1`,
      text: 'What is the first thing you typically do in the morning?',
      options: ['Wake up and stretch', 'Check phone', 'Brush teeth', 'Make coffee'],
      correctAnswer: 'Wake up and stretch',
      difficulty,
      xpReward: { easy: 10, medium: 20, hard: 30 }[difficulty]
    },
    {
      id: `${category}-2`,
      text: 'Which activity is important for daily routine?',
      options: ['Taking medication', 'Playing video games', 'Watching TV', 'Social media'],
      correctAnswer: 'Taking medication',
      difficulty,
      xpReward: { easy: 10, medium: 20, hard: 30 }[difficulty]
    }
  ];

  return shuffleArray(defaultQuestions);
};

// Generate questions using AI
export const generatePersonalizedQuestions = async (
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  personalInfo?: PersonalInfo
): Promise<Question[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        difficulty,
        personalInfo
      })
    });

    if (!response.ok) {
      console.warn('Using fallback questions due to API error');
      return generateDefaultQuestions(category, difficulty);
    }

    const questions = await response.json();
    return Array.isArray(questions) && questions.length > 0 
      ? shuffleArray(questions)
      : generateDefaultQuestions(category, difficulty);
  } catch (error) {
    console.warn('Error generating questions, using fallback:', error);
    return generateDefaultQuestions(category, difficulty);
  }
};

// Categories with empty question arrays initially
export const categories: Category[] = [
  {
    id: 'dailyTasks',
    title: 'Daily Tasks',
    description: 'Practice remembering everyday activities and their steps.',
    icon: 'Home',
    backgroundColor: 'bg-green-500',
    quizzes: [
      {
        id: 'dailyTasks-easy',
        title: 'Basic Daily Activities',
        description: 'Simple questions about common daily activities',
        icon: 'Home',
        questions: [], // Empty initially
        xpReward: 50
      },
      {
        id: 'dailyTasks-medium',
        title: 'Intermediate Daily Activities',
        description: 'Moderate questions about daily routines',
        icon: 'Home',
        questions: [], // Empty initially
        xpReward: 100
      },
      {
        id: 'dailyTasks-hard',
        title: 'Advanced Daily Activities',
        description: 'Challenging questions about complex daily tasks',
        icon: 'Home',
        questions: [], // Empty initially
        xpReward: 150
      }
    ]
  }
  // ... other categories with empty question arrays
];

// Daily quests remain unchanged
export const dailyQuests: DailyQuest[] = [
  {
    id: 'quest1',
    title: 'Daily Tasks Master',
    description: 'Complete the Daily Tasks quiz',
    completed: false,
    xpReward: 50
  },
  {
    id: 'quest2',
    title: 'Family Recognition',
    description: 'Complete the Family Members quiz',
    completed: false,
    xpReward: 50
  },
  {
    id: 'quest3',
    title: 'Simple Tasks Expert',
    description: 'Complete the Simple Tasks quiz',
    completed: false,
    xpReward: 50
  },
  {
    id: 'quest4',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz today',
    completed: false,
    xpReward: 100
  }
];

// Helper function to get icon component remains unchanged
export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Home':
      return Home;
    case 'Clock':
      return Clock;
    case 'Brain':
      return Brain;
    case 'Users':
      return Users;
    case 'BookOpen':
      return BookOpen;
    case 'Calendar':
      return Calendar;
    default:
      return Brain;
  }
};