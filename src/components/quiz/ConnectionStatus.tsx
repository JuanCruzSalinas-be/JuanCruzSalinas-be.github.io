import React, { useState, useEffect } from 'react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { isSupabaseAvailable } from '../../lib/supabase';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [details, setDetails] = useState<string>('');

  const checkConnection = async () => {
    setStatus('checking');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Checking Supabase connection...');
    console.log('URL exists:', !!supabaseUrl);
    console.log('Key exists:', !!supabaseKey);
    console.log('Supabase available:', isSupabaseAvailable());
    
    if (!isSupabaseAvailable()) {
      setStatus('disconnected');
      setDetails('Supabase credentials not properly configured');
      return;
    }
    
    try {
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
        setStatus('connected');
        setDetails('Edge function is accessible');
      } else {
        setStatus('error');
        setDetails(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setStatus('error');
      setDetails(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return '✅ Supabase Connected - AI questions available';
      case 'disconnected':
        return '❌ Supabase Not Connected - Using fallback questions';
      case 'error':
        return '⚠️ Connection Error - Using fallback questions';
      default:
        return '🔄 Checking connection...';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getIcon()}
            <div className="ml-3">
              <p className="font-medium">{getStatusText()}</p>
              {details && <p className="text-sm text-gray-600">{details}</p>}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnection}
            disabled={status === 'checking'}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${status === 'checking' ? 'animate-spin' : ''}`} />
            Check
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;