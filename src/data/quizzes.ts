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

// Generate questions using AI
const generatePersonalizedQuestions = async (
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
      throw new Error('Failed to generate questions');
    }

    const questions = await response.json();
    return shuffleArray(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    // Return default questions if AI generation fails
    return Array(10).fill(null).map((_, index) => ({
      id: `${category}-${index}`,
      text: `Default Question ${index + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      difficulty,
      xpReward: { easy: 10, medium: 20, hard: 30 }[difficulty]
    }));
  }
};

// Categories with quizzes
export const generateCategories = async (personalInfo?: PersonalInfo): Promise<Category[]> => {
  const categories: Category[] = [
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
          questions: await generatePersonalizedQuestions('dailyTasks', 'easy', personalInfo),
          xpReward: 50
        },
        {
          id: 'dailyTasks-medium',
          title: 'Intermediate Daily Activities',
          description: 'Moderate questions about daily routines',
          icon: 'Home',
          questions: await generatePersonalizedQuestions('dailyTasks', 'medium', personalInfo),
          xpReward: 100
        },
        {
          id: 'dailyTasks-hard',
          title: 'Advanced Daily Activities',
          description: 'Challenging questions about complex daily tasks',
          icon: 'Home',
          questions: await generatePersonalizedQuestions('dailyTasks', 'hard', personalInfo),
          xpReward: 150
        }
      ]
    },
    // ... other categories with their quizzes
  ];

  return categories;
};

// Daily quests
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

// Helper function to get icon component
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