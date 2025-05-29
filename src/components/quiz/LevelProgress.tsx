import React from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card, { CardContent } from '../ui/Card';

const LevelProgress: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const { level, xp, xpToNextLevel } = user;
  const progressPercentage = Math.min((xp / xpToNextLevel) * 100, 100);
  
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col h-full justify-center">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Star className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold">Level {level}</h3>
            <p className="text-gray-600">Keep practicing to level up!</p>
          </div>
        </div>
        
        <div className="flex justify-between text-sm mb-1">
          <span>{xp} XP</span>
          <span>{xpToNextLevel} XP</span>
        </div>
        
        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <p className="text-center mt-4 text-gray-600">
          {xpToNextLevel - xp} XP until Level {level + 1}
        </p>
      </CardContent>
    </Card>
  );
};

export default LevelProgress;