import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { UserProvider } from './context/UserContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import QuizPage from './pages/QuizPage';
import Survey from './pages/Survey';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('memoryLaneUser') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <QuizProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/survey" element={<Survey />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/categories" 
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/categories/:categoryId" 
                element={
                  <ProtectedRoute>
                    <CategoryDetail />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/quiz/:quizId" 
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </QuizProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;