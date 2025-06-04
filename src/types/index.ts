export interface User {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  personalInfo?: PersonalInfo;
}

export interface PersonalInfo {
  age: number;
  interests: string[];
  familyMembers: FamilyMember[];
  dailyRoutine: string[];
  importantDates: ImportantDate[];
  favoriteLocations: string[];
}

export interface FamilyMember {
  name: string;
  relation: string;
  birthDate?: string;
}

export interface ImportantDate {
  date: string;
  description: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'other';
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