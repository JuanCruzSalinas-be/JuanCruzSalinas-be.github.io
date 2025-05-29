export interface User {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
  xpReward: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xpReward: number;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  backgroundColor: string;
  quizzes: Quiz[];
}