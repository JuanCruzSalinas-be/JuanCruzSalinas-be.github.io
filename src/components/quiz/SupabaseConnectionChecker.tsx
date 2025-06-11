import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Database } from 'lucide-react';

const SupabaseConnectionChecker: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [envVarsPresent, setEnvVarsPresent] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Check if environment variables are present and valid
    const hasValidEnvVars = !!(
      supabaseUrl && 
      supabaseKey && 
      supabaseUrl !== 'https://your-project.supabase.co' && 
      supabaseKey !== 'your-anon-key' &&
      supabaseUrl.includes('supabase.co') &&
      supabaseKey.length > 20
    );
    
    setEnvVarsPresent(hasValidEnvVars);
    
    if (!hasValidEnvVars) {
      setConnectionStatus('disconnected');
      return;
    }

    try {
      // Test the connection by trying to call the edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'test',
          difficulty: 'easy'
        })
      });

      if (response.ok || response.status === 400) {
        // 400 is also OK - it means the function is reachable
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      setConnectionStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <Database className="h-6 w-6 text-gray-400 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Supabase is connected and working!';
      case 'disconnected':
        return 'Supabase is not configured';
      case 'error':
        return 'Supabase connection error';
      default:
        return 'Checking connection...';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'disconnected':
        return 'text-red-800 bg-red-50 border-red-200';
      case 'error':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`mb-6 border-2 ${getStatusColor()}`}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <h3 className="ml-3 text-lg font-semibold">Database Connection Status</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnection}
            disabled={connectionStatus === 'checking'}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            {envVarsPresent ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
            )}
            <span>Environment Variables: {envVarsPresent ? 'Configured' : 'Missing'}</span>
          </div>
          
          <div className="flex items-center">
            {connectionStatus === 'connected' ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
            )}
            <span>Edge Function: {connectionStatus === 'connected' ? 'Accessible' : 'Not accessible'}</span>
          </div>
        </div>

        {connectionStatus === 'disconnected' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to Connect Supabase:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Look for the "Connect to Supabase" button in the top-right corner of the page</li>
              <li>Click it to set up your Supabase project</li>
              <li>Follow the setup instructions</li>
              <li>Return here and click "Refresh" to test the connection</li>
            </ol>
            <div className="mt-3">
              <a 
                href="https://supabase.com/docs/guides/getting-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Supabase Documentation
              </a>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && envVarsPresent && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Connection Issues:</h4>
            <p className="text-sm text-yellow-800">
              Your Supabase credentials appear to be configured, but there's an issue connecting to the service. 
              This could be due to network issues or incorrect credentials.
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Current Behavior:</h4>
          <p className="text-sm text-gray-700">
            {connectionStatus === 'connected' 
              ? "✅ AI-generated personalized questions are available"
              : "⚠️ Using enhanced fallback questions (still personalized based on your survey)"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionChecker;