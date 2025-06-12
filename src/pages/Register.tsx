import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { Brain } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const { error: signUpError } = await signUp(name, email, password);
      
      if (signUpError) {
        console.error('Registration error:', signUpError);
        
        // Handle different types of registration errors
        if (signUpError.message?.includes('User already registered')) {
          setError('An account with this email already exists. Please try signing in instead.');
        } else if (signUpError.message?.includes('Password should be at least')) {
          setError('Password should be at least 6 characters long.');
        } else if (signUpError.message?.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else if (signUpError.message?.includes('Network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError('Failed to create an account. Please try again or contact support if the problem persists.');
        }
        return;
      }
      
      // Only navigate if registration was successful
      navigate('/survey');
    } catch (err) {
      setError('Failed to create an account');
      console.error(err);
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
            <p className="text-gray-600 mt-1">Create your account</p>
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
              label="Name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;