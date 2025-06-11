import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import Header from '../components/layout/Header';
import CategoryCard from '../components/quiz/CategoryCard';
import QuizDebugInfo from '../components/quiz/QuizDebugInfo';

const Categories: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { categories } = useQuiz();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Categories
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Choose a category to begin practicing. Each category contains different quizzes to help exercise your memory.
          </p>
        </div>
        
        <QuizDebugInfo />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Categories;