import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { DailyQuest } from '../../types';
import { Award, Clock } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';

interface DailyQuestProps {
  quest: DailyQuest;
}

const DailyQuestCard: React.FC<DailyQuestProps> = ({ quest }) => {
  const navigate = useNavigate();
  const { completeQuest } = useQuiz();

  // This would normally determine the appropriate quiz to start based on the quest
  const handleStartQuest = () => {
    if (quest.title.includes('Daily Tasks')) {
      navigate('/quiz/dailyTasks-easy');
    } else if (quest.title.includes('Family Recognition')) {
      navigate('/quiz/familyRecognition-easy');
    } else if (quest.title.includes('Simple Tasks')) {
      navigate('/quiz/simpleTasks-easy');
    } else {
      // For the "Perfect Score" quest or any other general quest
      navigate('/categories');
    }
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="w-6 h-6 text-orange-500 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">{quest.title}</h3>
            <p className="text-sm text-gray-600">{quest.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-blue-600 font-medium">
            <span className="text-sm bg-blue-100 py-1 px-2 rounded">+{quest.xpReward} XP</span>
          </div>
          
          {quest.completed ? (
            <div className="flex items-center text-green-600">
              <Award className="w-5 h-5 mr-1" />
              <span>Completed</span>
            </div>
          ) : (
            <Button onClick={handleStartQuest}>
              Start Quest
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuestCard;