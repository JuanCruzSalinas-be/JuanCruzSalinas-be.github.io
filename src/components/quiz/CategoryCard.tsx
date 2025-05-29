import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Category } from '../../types';
import { getIconComponent } from '../../data/quizzes';
import { useQuiz } from '../../context/QuizContext';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useQuiz();
  const Icon = getIconComponent(category.icon);

  const handleStartQuiz = () => {
    setSelectedCategory(category);
    navigate(`/categories/${category.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <div className={`${category.backgroundColor} p-8 flex justify-center`}>
        <Icon size={48} className="text-white" />
      </div>
      <CardContent className="flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-center mb-2">{category.title}</h3>
        <p className="text-gray-600 text-center mb-6 flex-1">
          {category.description}
        </p>
        <div className="flex justify-center">
          <Button onClick={handleStartQuiz}>
            Start Quiz
          </Button>
          <button
            className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Refresh"
            onClick={(e) => {
              e.stopPropagation();
              // In a real app, this would refresh the category
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;