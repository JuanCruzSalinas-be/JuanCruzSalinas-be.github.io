import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card, { CardContent, CardHeader } from '../ui/Card';
import { Info, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const QuizDebugInfo: React.FC = () => {
  const { user } = useAuth();
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const hasSupabase = supabaseUrl && supabaseKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseKey !== 'your-anon-key';
  
  const hasPersonalInfo = user?.personalInfo && (
    user.personalInfo.interests.length > 0 ||
    user.personalInfo.familyMembers.length > 0 ||
    user.personalInfo.dailyRoutine.length > 0
  );

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader className="border-b bg-blue-50">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-900">AI Quiz Generation Status</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          {hasSupabase ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
          )}
          <span className={hasSupabase ? 'text-green-800' : 'text-red-800'}>
            Supabase Connection: {hasSupabase ? 'Connected' : 'Not Configured'}
          </span>
        </div>
        
        <div className="flex items-center">
          {hasPersonalInfo ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          )}
          <span className={hasPersonalInfo ? 'text-green-800' : 'text-yellow-800'}>
            Personal Info: {hasPersonalInfo ? 'Available for Personalization' : 'Complete Survey for Personalization'}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Current Mode:</strong> {hasSupabase ? 'AI-Generated Questions (when available) + Enhanced Fallback' : 'Enhanced Personalized Fallback Questions'}
          {hasPersonalInfo && (
            <div className="mt-2">
              <strong>Personalization Active:</strong> Questions will reference your survey responses
            </div>
          )}
        </div>
        
        {!hasSupabase && (
          <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded">
            <strong>Note:</strong> To enable full AI generation, connect to Supabase using the "Connect to Supabase" button in the top right corner.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizDebugInfo;