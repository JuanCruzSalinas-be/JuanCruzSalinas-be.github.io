import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { Brain } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different types of authentication errors
      if (err?.message?.includes('Invalid login credentials') || err?.message?.includes('invalid_credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before signing in.');
      } else if (err?.message?.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment before trying again.');
      } else if (err?.message?.includes('Network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Failed to sign in. Please try again or contact support if the problem persists.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center items-center pb-8 pt-6">
          <div className="flex flex-col items-center">
            <Brain size={40} className="text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">MemoryLane</h1>
            <p className="text-gray-600 mt-1">Sign in to your account</p>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;