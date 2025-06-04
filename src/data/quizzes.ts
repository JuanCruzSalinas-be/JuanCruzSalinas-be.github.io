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
export const generateCategories = (personalInfo?: PersonalInfo): Category[] => [
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
        questions: generatePersonalizedQuestions('dailyTasks', 'easy', personalInfo),
        xpReward: 50
      },
      {
        id: 'dailyTasks-medium',
        title: 'Intermediate Daily Activities',
        description: 'Moderate questions about daily routines',
        icon: 'Home',
        questions: generatePersonalizedQuestions('dailyTasks', 'medium', personalInfo),
        xpReward: 100
      },
      {
        id: 'dailyTasks-hard',
        title: 'Advanced Daily Activities',
        description: 'Challenging questions about complex daily tasks',
        icon: 'Home',
        questions: generatePersonalizedQuestions('dailyTasks', 'hard', personalInfo),
        xpReward: 150
      }
    ]
  },
  {
    id: 'simpleTasks',
    title: 'Simple Tasks',
    description: 'Learn and practice basic concepts and skills.',
    icon: 'BookOpen',
    backgroundColor: 'bg-amber-400',
    quizzes: [
      {
        id: 'simpleTasks-easy',
        title: 'Basic Concepts',
        description: 'Simple questions about basic concepts',
        icon: 'BookOpen',
        questions: generatePersonalizedQuestions('simpleTasks', 'easy', personalInfo),
        xpReward: 50
      },
      {
        id: 'simpleTasks-medium',
        title: 'Intermediate Concepts',
        description: 'Moderate questions about common concepts',
        icon: 'BookOpen',
        questions: generatePersonalizedQuestions('simpleTasks', 'medium', personalInfo),
        xpReward: 100
      },
      {
        id: 'simpleTasks-hard',
        title: 'Advanced Concepts',
        description: 'Challenging questions about various concepts',
        icon: 'BookOpen',
        questions: generatePersonalizedQuestions('simpleTasks', 'hard', personalInfo),
        xpReward: 150
      }
    ]
  },
  {
    id: 'familyRecognition',
    title: 'Family Recognition',
    description: 'Practice remembering family members and relationships.',
    icon: 'Users',
    backgroundColor: 'bg-blue-500',
    quizzes: [
      {
        id: 'familyRecognition-easy',
        title: 'Basic Family Relations',
        description: 'Simple questions about immediate family members',
        icon: 'Users',
        questions: generatePersonalizedQuestions('familyRecognition', 'easy', personalInfo),
        xpReward: 50
      },
      {
        id: 'familyRecognition-medium',
        title: 'Extended Family Relations',
        description: 'Moderate questions about extended family relationships',
        icon: 'Users',
        questions: generatePersonalizedQuestions('familyRecognition', 'medium', personalInfo),
        xpReward: 100
      },
      {
        id: 'familyRecognition-hard',
        title: 'Complex Family Relations',
        description: 'Challenging questions about complex family relationships',
        icon: 'Users',
        questions: generatePersonalizedQuestions('familyRecognition', 'hard', personalInfo),
        xpReward: 150
      }
    ]
  },
  {
    id: 'importantDates',
    title: 'Important Dates',
    description: 'Remember important dates, holidays, and occasions.',
    icon: 'Calendar',
    backgroundColor: 'bg-purple-500',
    quizzes: [
      {
        id: 'importantDates-easy',
        title: 'Major Holidays',
        description: 'Simple questions about major holidays and dates',
        icon: 'Calendar',
        questions: generatePersonalizedQuestions('importantDates', 'easy', personalInfo),
        xpReward: 50
      },
      {
        id: 'importantDates-medium',
        title: 'Seasonal Events',
        description: 'Moderate questions about seasonal events and dates',
        icon: 'Calendar',
        questions: generatePersonalizedQuestions('importantDates', 'medium', personalInfo),
        xpReward: 100
      },
      {
        id: 'importantDates-hard',
        title: 'Special Occasions',
        description: 'Challenging questions about special occasions and dates',
        icon: 'Calendar',
        questions: generatePersonalizedQuestions('importantDates', 'hard', personalInfo),
        xpReward: 150
      }
    ]
  },
  {
    id: 'placesRecognition',
    title: 'Places Recognition',
    description: 'Practice identifying different places and their purposes.',
    icon: 'Brain',
    backgroundColor: 'bg-rose-500',
    quizzes: [
      {
        id: 'placesRecognition-easy',
        title: 'Common Places',
        description: 'Simple questions about common places',
        icon: 'Brain',
        questions: generatePersonalizedQuestions('placesRecognition', 'easy', personalInfo),
        xpReward: 50
      },
      {
        id: 'placesRecognition-medium',
        title: 'Public Spaces',
        description: 'Moderate questions about public spaces and buildings',
        icon: 'Brain',
        questions: generatePersonalizedQuestions('placesRecognition', 'medium', personalInfo),
        xpReward: 100
      },
      {
        id: 'placesRecognition-hard',
        title: 'Specific Locations',
        description: 'Challenging questions about specific locations and their functions',
        icon: 'Brain',
        questions: generatePersonalizedQuestions('placesRecognition', 'hard', personalInfo),
        xpReward: 150
      }
    ]
  }
];

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