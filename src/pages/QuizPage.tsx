import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useUser } from '../context/UserContext';
import Header from '../components/layout/Header';
import Card, { CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Check, X, Award } from 'lucide-react';
import useSound from 'use-sound';

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { categories, selectedQuiz, setSelectedQuiz, completeQuiz } = useQuiz();
  const { gainXP } = useUser();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Sound effects
  const [playCorrect] = useSound('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', { volume: 0.5 });
  const [playIncorrect] = useSound('https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3', { volume: 0.5 });
  
  // Find the quiz if not already selected
  useEffect(() => {
    if (!selectedQuiz && quizId) {
      for (const category of categories) {
        const quiz = category.quizzes.find(q => q.id === quizId);
        if (quiz) {
          setSelectedQuiz(quiz);
          break;
        }
      }
    }
  }, [quizId, categories, selectedQuiz, setSelectedQuiz]);
  
  // If no quiz found, show error
  if (!selectedQuiz) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
          <Button onClick={() => navigate('/categories')}>
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }
  
  const { questions } = selectedQuiz;
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      setScore(prev => prev + 1);
      setEarnedXp(prev => prev + currentQuestion.xpReward);
    } else {
      playIncorrect();
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Calculate final score
      const finalScore = Math.round((score / questions.length) * 100);
      
      // Complete the quiz
      completeQuiz(selectedQuiz.id, finalScore, earnedXp);
      
      // Award XP
      gainXP(earnedXp);
      
      // Show results
      setShowResults(true);
    }
  };
  
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center border-b">
              <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
            </CardHeader>
            
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-blue-100 p-6 rounded-full mb-6">
                  <Award className="h-16 w-16 text-blue-600" />
                </div>
                
                <h2 className="text-xl font-semibold mb-2">
                  Your Score: {Math.round((score / questions.length) * 100)}%
                </h2>
                
                <p className="text-gray-600 mb-6">
                  You answered {score} out of {questions.length} questions correctly
                </p>
                
                <div className="bg-green-100 text-green-800 rounded-full px-4 py-2 mb-8">
                  <span className="font-semibold">+{earnedXp} XP</span> earned!
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedQuiz(null);
                      navigate('/categories');
                    }}
                  >
                    Back to Categories
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setSelectedOption(null);
                      setIsAnswered(false);
                      setScore(0);
                      setEarnedXp(0);
                      setShowResults(false);
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex justify-between items-center border-b">
            <h1 className="text-xl font-semibold">{selectedQuiz.title}</h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="py-8">
            <h2 className="text-xl font-medium mb-6 text-center">
              {currentQuestion.text}
            </h2>
            
            <div className="grid gap-4 max-w-md mx-auto">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`
                    p-4 border rounded-lg text-left transition-colors
                    ${selectedOption === option
                      ? isCorrect
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : 'hover:bg-gray-50 border-gray-300'}
                    ${option === currentQuestion.correctAnswer && isAnswered
                      ? 'bg-green-100 border-green-500'
                      : ''}
                  `}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isAnswered && option === currentQuestion.correctAnswer && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {isAnswered && selectedOption === option && !isCorrect && (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t">
            <div>
              {isAnswered && (
                <div className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect. The correct answer is shown above.'}
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              {currentQuestionIndex > 0 && !isAnswered && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentQuestionIndex(prev => prev - 1);
                    setSelectedOption(null);
                    setIsAnswered(false);
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
              )}
              
              {isAnswered && (
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    'Finish Quiz'
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default QuizPage;