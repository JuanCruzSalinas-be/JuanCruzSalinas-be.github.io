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

// Generate comprehensive default questions for fallback
const generateDefaultQuestions = (category: string, difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
  const questionSets: Record<string, any[]> = {
    dailyTasks: [
      {
        text: 'What is typically the first thing you do after waking up?',
        options: ['Brush teeth', 'Make coffee', 'Check phone', 'Take a shower'],
        correctAnswer: 'Brush teeth'
      },
      {
        text: 'Which appliance would you use to heat up leftovers quickly?',
        options: ['Oven', 'Microwave', 'Stovetop', 'Toaster'],
        correctAnswer: 'Microwave'
      },
      {
        text: 'What should you do before going to bed?',
        options: ['Brush teeth', 'Watch TV', 'Drink coffee', 'Exercise'],
        correctAnswer: 'Brush teeth'
      },
      {
        text: 'Which is a healthy morning habit?',
        options: ['Drink water', 'Skip breakfast', 'Check social media', 'Stay in bed'],
        correctAnswer: 'Drink water'
      },
      {
        text: 'What do you typically use to wash dishes?',
        options: ['Dish soap and water', 'Just water', 'Paper towels', 'Hand sanitizer'],
        correctAnswer: 'Dish soap and water'
      }
    ],
    familyRecognition: [
      {
        text: 'Who is typically the person you call when you need help?',
        options: ['Family member', 'Stranger', 'Nobody', 'Emergency services only'],
        correctAnswer: 'Family member'
      },
      {
        text: 'What information should you remember about family members?',
        options: ['Their names and relationships', 'Only their faces', 'Just their phone numbers', 'Nothing important'],
        correctAnswer: 'Their names and relationships'
      },
      {
        text: 'How often should you contact close family members?',
        options: ['Regularly', 'Never', 'Only in emergencies', 'Once a year'],
        correctAnswer: 'Regularly'
      },
      {
        text: 'What is important to remember about family birthdays?',
        options: ['The date and person', 'Only the month', 'Nothing', 'Just the year'],
        correctAnswer: 'The date and person'
      }
    ],
    simpleTasks: [
      {
        text: 'How do you safely cross a street?',
        options: ['Look both ways first', 'Run across quickly', 'Close your eyes', 'Walk backwards'],
        correctAnswer: 'Look both ways first'
      },
      {
        text: 'What should you do if you smell gas in your home?',
        options: ['Leave immediately and call for help', 'Light a match to see better', 'Ignore it', 'Open all windows and stay inside'],
        correctAnswer: 'Leave immediately and call for help'
      },
      {
        text: 'How do you properly wash your hands?',
        options: ['Soap and water for 20 seconds', 'Just rinse with water', 'Wipe on clothes', 'Use only hand sanitizer'],
        correctAnswer: 'Soap and water for 20 seconds'
      },
      {
        text: 'What should you do before taking medication?',
        options: ['Read the label and follow instructions', 'Take as many as you want', 'Mix with other medicines', 'Take on an empty stomach always'],
        correctAnswer: 'Read the label and follow instructions'
      }
    ],
    memoryExercises: [
      {
        text: 'What is a good way to remember important information?',
        options: ['Write it down', 'Hope you remember', 'Tell someone else to remember', 'Ignore it'],
        correctAnswer: 'Write it down'
      },
      {
        text: 'How can you improve your memory?',
        options: ['Practice and repetition', 'Sleep all day', 'Avoid thinking', 'Watch TV constantly'],
        correctAnswer: 'Practice and repetition'
      },
      {
        text: 'What helps you remember where you put things?',
        options: ['Put them in the same place each time', 'Put them anywhere', 'Hide them', 'Throw them away'],
        correctAnswer: 'Put them in the same place each time'
      }
    ],
    timeOrientation: [
      {
        text: 'How many days are in a week?',
        options: ['7', '5', '10', '14'],
        correctAnswer: '7'
      },
      {
        text: 'What comes after Wednesday?',
        options: ['Thursday', 'Tuesday', 'Friday', 'Monday'],
        correctAnswer: 'Thursday'
      },
      {
        text: 'How many months are in a year?',
        options: ['12', '10', '24', '6'],
        correctAnswer: '12'
      },
      {
        text: 'What season comes after summer?',
        options: ['Fall/Autumn', 'Winter', 'Spring', 'Summer again'],
        correctAnswer: 'Fall/Autumn'
      }
    ]
  };

  const categoryQuestions = questionSets[category] || questionSets.dailyTasks;
  const xpReward = { easy: 10, medium: 20, hard: 30 }[difficulty];

  return shuffleArray(categoryQuestions).slice(0, 8).map((q, index) => ({
    id: `${category}-${difficulty}-${index}`,
    text: q.text,
    options: shuffleArray(q.options),
    correctAnswer: q.correctAnswer,
    difficulty,
    xpReward
  }));
};

// Helper function to check if Supabase is properly configured
const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseKey !== 'your-anon-key' &&
    supabaseUrl.includes('supabase.co') &&
    supabaseKey.length > 20
  );
};

// Enhanced AI question generation with better personalization
export const generatePersonalizedQuestions = async (
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  personalInfo?: PersonalInfo
): Promise<Question[]> => {
  // First check if Supabase is properly configured
  if (!isSupabaseConfigured()) {
    console.log('Supabase not properly configured, using default questions');
    return generateDefaultQuestions(category, difficulty);
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        difficulty,
        personalInfo
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API error (${response.status}), using fallback questions`);
      return generateDefaultQuestions(category, difficulty);
    }

    const questions = await response.json();
    return Array.isArray(questions) && questions.length > 0 
      ? shuffleArray(questions)
      : generateDefaultQuestions(category, difficulty);
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Request timeout, using fallback questions');
      } else if (error.message.includes('Failed to fetch')) {
        console.warn('Network error or invalid Supabase configuration, using fallback questions');
      } else {
        console.warn('Error generating questions, using fallback:', error.message);
      }
    } else {
      console.warn('Unknown error generating questions, using fallback:', error);
    }
    
    return generateDefaultQuestions(category, difficulty);
  }
};

// Expanded categories with more variety
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
        questions: [],
        xpReward: 50
      },
      {
        id: 'dailyTasks-medium',
        title: 'Intermediate Daily Activities',
        description: 'Moderate questions about daily routines',
        icon: 'Home',
        questions: [],
        xpReward: 100
      },
      {
        id: 'dailyTasks-hard',
        title: 'Advanced Daily Activities',
        description: 'Challenging questions about complex daily tasks',
        icon: 'Home',
        questions: [],
        xpReward: 150
      }
    ]
  },
  {
    id: 'familyRecognition',
    title: 'Family & Friends',
    description: 'Remember important people in your life and their relationships.',
    icon: 'Users',
    backgroundColor: 'bg-blue-500',
    quizzes: [
      {
        id: 'familyRecognition-easy',
        title: 'Close Family Members',
        description: 'Questions about immediate family and close relationships',
        icon: 'Users',
        questions: [],
        xpReward: 50
      },
      {
        id: 'familyRecognition-medium',
        title: 'Extended Family & Friends',
        description: 'Questions about extended family and friend relationships',
        icon: 'Users',
        questions: [],
        xpReward: 100
      },
      {
        id: 'familyRecognition-hard',
        title: 'Complex Relationships',
        description: 'Advanced questions about family history and connections',
        icon: 'Users',
        questions: [],
        xpReward: 150
      }
    ]
  },
  {
    id: 'simpleTasks',
    title: 'Simple Tasks',
    description: 'Practice basic cognitive tasks and problem-solving.',
    icon: 'Brain',
    backgroundColor: 'bg-purple-500',
    quizzes: [
      {
        id: 'simpleTasks-easy',
        title: 'Basic Problem Solving',
        description: 'Simple cognitive exercises and basic tasks',
        icon: 'Brain',
        questions: [],
        xpReward: 50
      },
      {
        id: 'simpleTasks-medium',
        title: 'Intermediate Challenges',
        description: 'Moderate problem-solving and reasoning tasks',
        icon: 'Brain',
        questions: [],
        xpReward: 100
      },
      {
        id: 'simpleTasks-hard',
        title: 'Complex Problem Solving',
        description: 'Advanced cognitive challenges and multi-step tasks',
        icon: 'Brain',
        questions: [],
        xpReward: 150
      }
    ]
  },
  {
    id: 'memoryExercises',
    title: 'Memory Exercises',
    description: 'Strengthen your memory with targeted exercises.',
    icon: 'BookOpen',
    backgroundColor: 'bg-orange-500',
    quizzes: [
      {
        id: 'memoryExercises-easy',
        title: 'Basic Memory Training',
        description: 'Simple memory exercises and recall tasks',
        icon: 'BookOpen',
        questions: [],
        xpReward: 50
      },
      {
        id: 'memoryExercises-medium',
        title: 'Memory Challenges',
        description: 'Intermediate memory strengthening exercises',
        icon: 'BookOpen',
        questions: [],
        xpReward: 100
      },
      {
        id: 'memoryExercises-hard',
        title: 'Advanced Memory Training',
        description: 'Complex memory exercises and pattern recognition',
        icon: 'BookOpen',
        questions: [],
        xpReward: 150
      }
    ]
  },
  {
    id: 'timeOrientation',
    title: 'Time & Dates',
    description: 'Practice remembering dates, times, and schedules.',
    icon: 'Calendar',
    backgroundColor: 'bg-red-500',
    quizzes: [
      {
        id: 'timeOrientation-easy',
        title: 'Basic Time Concepts',
        description: 'Simple questions about days, months, and seasons',
        icon: 'Calendar',
        questions: [],
        xpReward: 50
      },
      {
        id: 'timeOrientation-medium',
        title: 'Dates & Schedules',
        description: 'Questions about important dates and time management',
        icon: 'Calendar',
        questions: [],
        xpReward: 100
      },
      {
        id: 'timeOrientation-hard',
        title: 'Complex Time Relationships',
        description: 'Advanced questions about time sequences and planning',
        icon: 'Calendar',
        questions: [],
        xpReward: 150
      }
    ]
  }
];

// Updated daily quests to match new categories
export const dailyQuests: DailyQuest[] = [
  {
    id: 'quest1',
    title: 'Daily Tasks Master',
    description: 'Complete any Daily Tasks quiz',
    completed: false,
    xpReward: 50
  },
  {
    id: 'quest2',
    title: 'Family Connection',
    description: 'Complete any Family & Friends quiz',
    completed: false,
    xpReward: 50
  },
  {
    id: 'quest3',
    title: 'Problem Solver',
    description: 'Complete any Simple Tasks quiz',
    completed: false,
    xpReward: 50
  },
  {
    id: 'quest4',
    title: 'Memory Champion',
    description: 'Complete any Memory Exercises quiz',
    completed: false,
    xpReward: 75
  },
  {
    id: 'quest5',
    title: 'Time Master',
    description: 'Complete any Time & Dates quiz',
    completed: false,
    xpReward: 50
  },
  {
    id: 'quest6',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz today',
    completed: false,
    xpReward: 100
  },
  {
    id: 'quest7',
    title: 'Quiz Streak',
    description: 'Complete 3 different quizzes today',
    completed: false,
    xpReward: 150
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