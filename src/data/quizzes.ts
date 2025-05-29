import { Category, DailyQuest, Question } from '../types';
import { Clock, Home, Brain, Users, BookOpen, Calendar } from 'lucide-react';

// Generate questions for each category
const generateQuestions = (category: string, difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
  const questions: Question[] = [];
  
  // Define base XP rewards by difficulty
  const xpRewards = {
    easy: 10,
    medium: 20,
    hard: 30
  };
  
  // Daily Tasks Questions
  const dailyTasksQuestions = [
    {
      text: "What is typically the first thing you do after waking up?",
      options: ["Brush teeth", "Make coffee", "Check phone", "Take a shower"],
      correctAnswer: "Brush teeth"
    },
    {
      text: "Which appliance would you use to heat up leftovers quickly?",
      options: ["Oven", "Microwave", "Stovetop", "Toaster"],
      correctAnswer: "Microwave"
    },
    {
      text: "What do you need to do before crossing a street?",
      options: ["Look both ways", "Run quickly", "Close your eyes", "Call someone"],
      correctAnswer: "Look both ways"
    },
    {
      text: "Which item would you use to write a shopping list?",
      options: ["Pen and paper", "Fork", "Remote control", "Soap"],
      correctAnswer: "Pen and paper"
    },
    {
      text: "What is the correct order for washing dishes?",
      options: ["Rinse, soap, dry", "Dry, soap, rinse", "Soap, rinse, dry", "Soap, dry, rinse"],
      correctAnswer: "Soap, rinse, dry"
    },
    {
      text: "Which of these would you use to pay at a grocery store?",
      options: ["Credit card", "Toothbrush", "Remote control", "Pillow"],
      correctAnswer: "Credit card"
    },
    {
      text: "What should you do with trash?",
      options: ["Put it in a trash bin", "Leave it on the floor", "Put it in the refrigerator", "Hide it"],
      correctAnswer: "Put it in a trash bin"
    },
    {
      text: "What should you do before going to bed?",
      options: ["Brush teeth", "Go for a run", "Cook breakfast", "Start cleaning"],
      correctAnswer: "Brush teeth"
    },
    {
      text: "How do you answer a ringing telephone?",
      options: ["Say hello", "Hang up immediately", "Stay silent", "Yell loudly"],
      correctAnswer: "Say hello"
    },
    {
      text: "What do you need to do when your hands are dirty?",
      options: ["Wash them", "Touch food", "Touch your face", "Wipe them on furniture"],
      correctAnswer: "Wash them"
    }
  ];
  
  // Simple Tasks Questions
  const simpleTasksQuestions = [
    {
      text: "Which tool would you use to hammer a nail?",
      options: ["Hammer", "Screwdriver", "Wrench", "Pliers"],
      correctAnswer: "Hammer"
    },
    {
      text: "What comes after Thursday in the days of the week?",
      options: ["Friday", "Monday", "Saturday", "Wednesday"],
      correctAnswer: "Friday"
    },
    {
      text: "Which season comes after winter?",
      options: ["Spring", "Summer", "Fall", "Winter again"],
      correctAnswer: "Spring"
    },
    {
      text: "Which of these is a color?",
      options: ["Blue", "Water", "Dog", "Telephone"],
      correctAnswer: "Blue"
    },
    {
      text: "What do you use to tell time?",
      options: ["Clock", "Fork", "Pillow", "Shoe"],
      correctAnswer: "Clock"
    },
    {
      text: "Which of these is a fruit?",
      options: ["Apple", "Carrot", "Potato", "Broccoli"],
      correctAnswer: "Apple"
    },
    {
      text: "What number comes after 9?",
      options: ["10", "8", "11", "5"],
      correctAnswer: "10"
    },
    {
      text: "Which month has Christmas?",
      options: ["December", "July", "March", "September"],
      correctAnswer: "December"
    },
    {
      text: "Which of these animals has wings?",
      options: ["Bird", "Cat", "Fish", "Dog"],
      correctAnswer: "Bird"
    },
    {
      text: "What do you wear on your feet?",
      options: ["Shoes", "Hat", "Gloves", "Scarf"],
      correctAnswer: "Shoes"
    }
  ];

  // Family Recognition Questions
  const familyRecognitionQuestions = [
    {
      text: "Who is typically the child of your sister or brother?",
      options: ["Niece or nephew", "Cousin", "Grandchild", "Parent"],
      correctAnswer: "Niece or nephew"
    },
    {
      text: "What relation is your father's father to you?",
      options: ["Grandfather", "Uncle", "Cousin", "Brother"],
      correctAnswer: "Grandfather"
    },
    {
      text: "What do you call your mother's sister?",
      options: ["Aunt", "Grandmother", "Cousin", "Niece"],
      correctAnswer: "Aunt"
    },
    {
      text: "Who is the daughter of your son or daughter?",
      options: ["Granddaughter", "Niece", "Cousin", "Sister"],
      correctAnswer: "Granddaughter"
    },
    {
      text: "What relation is your spouse's father to you?",
      options: ["Father-in-law", "Uncle", "Grandfather", "Brother"],
      correctAnswer: "Father-in-law"
    },
    {
      text: "What do you call your parent's brother?",
      options: ["Uncle", "Cousin", "Grandfather", "Nephew"],
      correctAnswer: "Uncle"
    },
    {
      text: "What relation is your brother's wife to you?",
      options: ["Sister-in-law", "Aunt", "Niece", "Cousin"],
      correctAnswer: "Sister-in-law"
    },
    {
      text: "What relation is your mother's mother to you?",
      options: ["Grandmother", "Aunt", "Sister", "Cousin"],
      correctAnswer: "Grandmother"
    },
    {
      text: "What do you call the children of your aunt or uncle?",
      options: ["Cousins", "Siblings", "Nieces/Nephews", "Grandchildren"],
      correctAnswer: "Cousins"
    },
    {
      text: "What relation is your child's spouse to you?",
      options: ["Son/Daughter-in-law", "Niece/Nephew", "Cousin", "Grandchild"],
      correctAnswer: "Son/Daughter-in-law"
    }
  ];

  // Important Dates Questions
  const importantDatesQuestions = [
    {
      text: "When is New Year's Day?",
      options: ["January 1st", "December 25th", "July 4th", "October 31st"],
      correctAnswer: "January 1st"
    },
    {
      text: "What holiday is celebrated on December 25th?",
      options: ["Christmas", "Thanksgiving", "Easter", "Valentine's Day"],
      correctAnswer: "Christmas"
    },
    {
      text: "Which holiday involves giving thanks and eating turkey?",
      options: ["Thanksgiving", "Christmas", "Easter", "Halloween"],
      correctAnswer: "Thanksgiving"
    },
    {
      text: "When is Independence Day in the United States?",
      options: ["July 4th", "January 1st", "December 25th", "October 31st"],
      correctAnswer: "July 4th"
    },
    {
      text: "Which holiday involves costumes and trick-or-treating?",
      options: ["Halloween", "Easter", "Valentine's Day", "Thanksgiving"],
      correctAnswer: "Halloween"
    },
    {
      text: "When is Valentine's Day?",
      options: ["February 14th", "March 17th", "April 1st", "May 5th"],
      correctAnswer: "February 14th"
    },
    {
      text: "What do we celebrate on Easter?",
      options: ["Resurrection of Jesus", "Independence", "New Year", "Labor Day"],
      correctAnswer: "Resurrection of Jesus"
    },
    {
      text: "Which month has 28 days (or 29 in leap years)?",
      options: ["February", "April", "June", "September"],
      correctAnswer: "February"
    },
    {
      text: "What season comes after summer?",
      options: ["Fall", "Winter", "Spring", "Another summer"],
      correctAnswer: "Fall"
    },
    {
      text: "How many months are in a year?",
      options: ["12", "10", "6", "24"],
      correctAnswer: "12"
    }
  ];

  // Places Recognition Questions
  const placesRecognitionQuestions = [
    {
      text: "Where would you go to borrow books?",
      options: ["Library", "Grocery store", "Bank", "Restaurant"],
      correctAnswer: "Library"
    },
    {
      text: "Where would you go to deposit money?",
      options: ["Bank", "Hospital", "School", "Post Office"],
      correctAnswer: "Bank"
    },
    {
      text: "Where would you go to buy groceries?",
      options: ["Supermarket", "Library", "Movie theater", "Gas station"],
      correctAnswer: "Supermarket"
    },
    {
      text: "Where would you go if you were sick?",
      options: ["Hospital", "Restaurant", "School", "Mall"],
      correctAnswer: "Hospital"
    },
    {
      text: "Where would you go to watch a movie?",
      options: ["Movie theater", "Library", "Church", "Gym"],
      correctAnswer: "Movie theater"
    },
    {
      text: "Where would you go to mail a letter?",
      options: ["Post Office", "Bank", "Restaurant", "Pharmacy"],
      correctAnswer: "Post Office"
    },
    {
      text: "Where would you go to buy medicine?",
      options: ["Pharmacy", "Library", "Grocery store", "Movie theater"],
      correctAnswer: "Pharmacy"
    },
    {
      text: "Where would you go to worship?",
      options: ["Church/Temple/Mosque", "Restaurant", "Bank", "School"],
      correctAnswer: "Church/Temple/Mosque"
    },
    {
      text: "Where would you go to exercise?",
      options: ["Gym", "Library", "Restaurant", "Post Office"],
      correctAnswer: "Gym"
    },
    {
      text: "Where would you go to have a meal prepared for you?",
      options: ["Restaurant", "Bank", "Library", "Gas station"],
      correctAnswer: "Restaurant"
    }
  ];

  let questionsToUse: any[] = [];
  
  switch(category) {
    case 'dailyTasks':
      questionsToUse = dailyTasksQuestions;
      break;
    case 'simpleTasks':
      questionsToUse = simpleTasksQuestions;
      break;
    case 'familyRecognition':
      questionsToUse = familyRecognitionQuestions;
      break;
    case 'importantDates':
      questionsToUse = importantDatesQuestions;
      break;
    case 'placesRecognition':
      questionsToUse = placesRecognitionQuestions;
      break;
    default:
      questionsToUse = dailyTasksQuestions;
  }
  
  // Generate 10 questions for the category
  for (let i = 0; i < 10; i++) {
    questions.push({
      id: `${category}-${i}`,
      text: questionsToUse[i].text,
      options: questionsToUse[i].options,
      correctAnswer: questionsToUse[i].correctAnswer,
      difficulty,
      xpReward: xpRewards[difficulty]
    });
  }
  
  return questions;
};

// Categories with quizzes
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
        questions: generateQuestions('dailyTasks', 'easy'),
        xpReward: 50
      },
      {
        id: 'dailyTasks-medium',
        title: 'Intermediate Daily Activities',
        description: 'Moderate questions about daily routines',
        icon: 'Home',
        questions: generateQuestions('dailyTasks', 'medium'),
        xpReward: 100
      },
      {
        id: 'dailyTasks-hard',
        title: 'Advanced Daily Activities',
        description: 'Challenging questions about complex daily tasks',
        icon: 'Home',
        questions: generateQuestions('dailyTasks', 'hard'),
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
        questions: generateQuestions('simpleTasks', 'easy'),
        xpReward: 50
      },
      {
        id: 'simpleTasks-medium',
        title: 'Intermediate Concepts',
        description: 'Moderate questions about common concepts',
        icon: 'BookOpen',
        questions: generateQuestions('simpleTasks', 'medium'),
        xpReward: 100
      },
      {
        id: 'simpleTasks-hard',
        title: 'Advanced Concepts',
        description: 'Challenging questions about various concepts',
        icon: 'BookOpen',
        questions: generateQuestions('simpleTasks', 'hard'),
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
        questions: generateQuestions('familyRecognition', 'easy'),
        xpReward: 50
      },
      {
        id: 'familyRecognition-medium',
        title: 'Extended Family Relations',
        description: 'Moderate questions about extended family relationships',
        icon: 'Users',
        questions: generateQuestions('familyRecognition', 'medium'),
        xpReward: 100
      },
      {
        id: 'familyRecognition-hard',
        title: 'Complex Family Relations',
        description: 'Challenging questions about complex family relationships',
        icon: 'Users',
        questions: generateQuestions('familyRecognition', 'hard'),
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
        questions: generateQuestions('importantDates', 'easy'),
        xpReward: 50
      },
      {
        id: 'importantDates-medium',
        title: 'Seasonal Events',
        description: 'Moderate questions about seasonal events and dates',
        icon: 'Calendar',
        questions: generateQuestions('importantDates', 'medium'),
        xpReward: 100
      },
      {
        id: 'importantDates-hard',
        title: 'Special Occasions',
        description: 'Challenging questions about special occasions and dates',
        icon: 'Calendar',
        questions: generateQuestions('importantDates', 'hard'),
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
        questions: generateQuestions('placesRecognition', 'easy'),
        xpReward: 50
      },
      {
        id: 'placesRecognition-medium',
        title: 'Public Spaces',
        description: 'Moderate questions about public spaces and buildings',
        icon: 'Brain',
        questions: generateQuestions('placesRecognition', 'medium'),
        xpReward: 100
      },
      {
        id: 'placesRecognition-hard',
        title: 'Specific Locations',
        description: 'Challenging questions about specific locations and their functions',
        icon: 'Brain',
        questions: generateQuestions('placesRecognition', 'hard'),
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