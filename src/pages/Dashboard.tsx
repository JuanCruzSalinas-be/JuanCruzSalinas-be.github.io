import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import Header from '../components/layout/Header';
import LevelProgress from '../components/quiz/LevelProgress';
import DailyQuestCard from '../components/quiz/DailyQuestCard';
import CategoryCard from '../components/quiz/CategoryCard';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { Trophy, Settings, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dailyQuests, completedQuests, categories } = useQuiz();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null;
  }

  // Show featured categories (first 3)
  const featuredCategories = categories.slice(0, 3);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to MemoryLane, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your personalized memory training journey awaits.
          </p>
          
          {!user.personalInfo && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Get Personalized Quizzes!</span>
              </div>
              <p className="text-blue-700 mb-3">
                Complete your personal survey to unlock AI-generated quizzes tailored specifically for you.
              </p>
              <Button 
                variant="primary"
                onClick={() => navigate('/survey')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Complete Survey Now
              </Button>
            </div>
          )}
          
          {user.personalInfo && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">
                  Your quizzes are personalized based on your survey responses!
                </span>
                <Button 
                  variant="outline"
                  size="sm"
                  className="ml-3"
                  onClick={() => navigate('/survey')}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          )}
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
                {dailyQuests.slice(0, 4).map(quest => (
                  <DailyQuestCard 
                    key={quest.id} 
                    quest={{
                      ...quest,
                      completed: completedQuests.includes(quest.id)
                    }}
                  />
                ))}
                {dailyQuests.length > 4 && (
                  <div className="text-center mt-4">
                    <button 
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => {/* Could expand to show all quests */}}
                    >
                      View {dailyQuests.length - 4} more quests
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Featured Quiz Categories
            </h2>
            <button 
              className="text-blue-600 hover:underline font-medium"
              onClick={() => navigate('/categories')}
            >
              View All Categories →
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How MemoryLane Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🎯 Personalized Experience</h3>
              <p className="text-gray-700 text-sm">
                Complete your personal survey to get AI-generated quizzes tailored to your interests, family, and daily routine.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🧠 Memory Training</h3>
              <p className="text-gray-700 text-sm">
                Practice with scientifically-designed exercises that adapt to your cognitive needs and preferences.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🏆 Daily Challenges</h3>
              <p className="text-gray-700 text-sm">
                Complete daily quests to earn XP, level up, and track your progress over time.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📈 Progress Tracking</h3>
              <p className="text-gray-700 text-sm">
                Monitor your improvement with detailed statistics and celebrate your achievements.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;