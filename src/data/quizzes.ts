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

// Generate questions based on personal info
const generatePersonalizedQuestions = (category: string, difficulty: 'easy' | 'medium' | 'hard', personalInfo?: PersonalInfo): Question[] => {
  const questions: Question[] = [];
  const xpRewards = { easy: 10, medium: 20, hard: 30 };
  
  if (personalInfo) {
    switch(category) {
      case 'dailyTasks':
        questions.push(
          ...personalInfo.dailyRoutine.map((routine, index) => ({
            id: `personal-daily-${index}`,
            text: `What is your usual ${routine.toLowerCase()}?`,
            options: shuffleArray([routine, ...personalInfo.dailyRoutine.filter(r => r !== routine).slice(0, 3)]),
            correctAnswer: routine,
            difficulty,
            xpReward: xpRewards[difficulty]
          }))
        );
        break;
        
      case 'familyRecognition':
        questions.push(
          ...personalInfo.familyMembers.map((member, index) => ({
            id: `personal-family-${index}`,
            text: `Who is ${member.name} to you?`,
            options: shuffleArray([member.relation, ...personalInfo.familyMembers.filter(m => m.relation !== member.relation).map(m => m.relation).slice(0, 3)]),
            correctAnswer: member.relation,
            difficulty,
            xpReward: xpRewards[difficulty]
          }))
        );
        break;
        
      case 'importantDates':
        questions.push(
          ...personalInfo.importantDates.map((date, index) => ({
            id: `personal-date-${index}`,
            text: `What happens on ${date.date}?`,
            options: shuffleArray([date.description, ...personalInfo.importantDates.filter(d => d.description !== date.description).map(d => d.description).slice(0, 3)]),
            correctAnswer: date.description,
            difficulty,
            xpReward: xpRewards[difficulty]
          }))
        );
        break;
        
      case 'placesRecognition':
        questions.push(
          ...personalInfo.favoriteLocations.map((location, index) => ({
            id: `personal-place-${index}`,
            text: `Which of these places is important to you?`,
            options: shuffleArray([location, ...personalInfo.favoriteLocations.filter(l => l !== location).slice(0, 3)]),
            correctAnswer: location,
            difficulty,
            xpReward: xpRewards[difficulty]
          }))
        );
        break;
    }
  }
  
  // Fill remaining questions with default ones if needed
  while (questions.length < 10) {
    questions.push({
      id: `default-${questions.length}`,
      text: `Default Question ${questions.length + 1}`,
      options: [`Option A`, `Option B`, `Option C`, `Option D`],
      correctAnswer: 'Option A',
      difficulty,
      xpReward: xpRewards[difficulty]
    });
  }
  
  return shuffleArray(questions).slice(0, 10);
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