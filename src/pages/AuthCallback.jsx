import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have an auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login?message=auth-failed'), 3000);
          return;
        }

        if (session) {
          console.log('Auth callback successful:', session.user.id);
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect based on user role after a short delay
          setTimeout(() => {
            if (user?.role === 'PUBLIC') {
              navigate('/');
            } else {
              navigate('/dashboard');
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No authentication session found.');
          setTimeout(() => navigate('/login?message=no-session'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        setTimeout(() => navigate('/login?message=unexpected-error'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'processing' && 'Processing Authentication'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Return to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 