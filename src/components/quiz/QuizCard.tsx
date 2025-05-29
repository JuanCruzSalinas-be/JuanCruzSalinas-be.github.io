import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Quiz } from '../../types';
import { getIconComponent } from '../../data/quizzes';
import { useQuiz } from '../../context/QuizContext';

interface QuizCardProps {
  quiz: Quiz;
  completed?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, completed = false }) => {
  const navigate = useNavigate();
  const { setSelectedQuiz } = useQuiz();
  const Icon = getIconComponent(quiz.icon);

  const handleStartQuiz = () => {
    setSelectedQuiz(quiz);
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="flex items-start">
        <div className="mr-4 bg-blue-100 p-3 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{quiz.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm bg-blue-100 text-blue-600 py-1 px-2 rounded">
                +{quiz.xpReward} XP
              </span>
              
              {completed && (
                <span className="ml-2 text-sm bg-green-100 text-green-600 py-1 px-2 rounded">
                  Completed
                </span>
              )}
            </div>
            
            <Button 
              onClick={handleStartQuiz}
              variant={completed ? "secondary" : "primary"}
              size="sm"
            >
              {completed ? "Retry Quiz" : "Start Quiz"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCard;