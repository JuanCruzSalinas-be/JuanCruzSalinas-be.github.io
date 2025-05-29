import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import Header from '../components/layout/Header';
import QuizCard from '../components/quiz/QuizCard';
import Button from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { getIconComponent } from '../data/quizzes';

const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { categories, completedQuizzes } = useQuiz();
  const navigate = useNavigate();
  
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <Button onClick={() => navigate('/categories')}>
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }
  
  const Icon = getIconComponent(category.icon);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/categories')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Categories
        </Button>
        
        <div className="flex items-center mb-8">
          <div className={`${category.backgroundColor} p-4 rounded-full mr-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.title}</h1>
            <p className="text-gray-600">{category.description}</p>
          </div>
        </div>
        
        <div className="grid gap-6">
          {category.quizzes.map(quiz => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              completed={completedQuizzes.includes(quiz.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoryDetail;