import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import Header from '../components/layout/Header';
import LevelProgress from '../components/quiz/LevelProgress';
import DailyQuestCard from '../components/quiz/DailyQuestCard';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { Trophy } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dailyQuests, completedQuests } = useQuiz();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to MemoryLane, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Choose a quiz category to begin your memory journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <LevelProgress />
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex items-center justify-between border-b">
                <div className="flex items-center">
                  <Trophy className="h-6 w-6 text-amber-500 mr-2" />
                  <h2 className="text-xl font-semibold">Daily Quests</h2>
                </div>
                <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
                  {completedQuests.length}/{dailyQuests.length} Completed
                </span>
              </CardHeader>
              
              <CardContent>
                {dailyQuests.map(quest => (
                  <DailyQuestCard 
                    key={quest.id} 
                    quest={{
                      ...quest,
                      completed: completedQuests.includes(quest.id)
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Quiz Categories
            </h2>
            <button 
              className="text-blue-600 hover:underline"
              onClick={() => navigate('/categories')}
            >
              View All Categories
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Here we'd show a few featured categories */}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How to Use MemoryLane
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">
                1
              </span>
              <span>Choose a quiz category that interests you</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">
                2
              </span>
              <span>Complete daily quests to earn XP and track your progress</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">
                3
              </span>
              <span>Practice regularly to strengthen your memory</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">
                4
              </span>
              <span>Level up as you gain experience and unlock new challenges</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;