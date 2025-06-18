import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, triggerProfileCreation } = useAuth();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing email confirmation...');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 AuthCallback: Starting email confirmation process...');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 URL Hash:', window.location.hash);
        console.log('🔍 URL Search:', window.location.search);
        
        // Parse URL for tokens (both hash and search params)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const tokenType = urlParams.get('token_type') || hashParams.get('token_type');
        const type = urlParams.get('type') || hashParams.get('type');
        
        console.log('🔍 Tokens found:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          type
        });

        setDebugInfo({
          url: window.location.href,
          hasTokens: !!(accessToken && refreshToken),
          type,
          tokenType
        });

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          console.log('✅ Setting session with URL tokens...');
          setMessage('Confirming your email...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('❌ Error setting session:', error);
            throw error;
          }

          console.log('✅ Session set successfully:', data.user?.id);
          
          // Clean up URL
          window.history.replaceState(null, null, window.location.pathname);
          
          // Wait a moment for auth context to update
          setMessage('Email confirmed! Setting up your account...');
          
          // Check if user has a profile
          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (profileError && profileError.code === 'PGRST116') {
                // No profile exists, try to create one
                console.log('🔧 No profile found, checking registration data...');
                
                const registrationData = localStorage.getItem(`registration_data_${data.user.id}`);
                if (registrationData) {
                  console.log('✅ Found registration data, creating profile...');
                  const userData = JSON.parse(registrationData);
                  await triggerProfileCreation(userData);
                  localStorage.removeItem(`registration_data_${data.user.id}`);
                }
              }

              setStatus('success');
              setMessage('Email confirmed successfully! Redirecting to your dashboard...');
              
              setTimeout(() => {
                // Force a page refresh to ensure auth state is properly updated
                window.location.href = '/dashboard';
              }, 2000);

            } catch (profileError) {
              console.error('❌ Profile creation error:', profileError);
              setStatus('success'); // Still consider email confirmation successful
              setMessage('Email confirmed! Please complete your profile setup...');
              setTimeout(() => window.location.href = '/', 2500);
            }
          }, 1000);

        } else {
          // No tokens in URL, check existing session
          console.log('🔍 No tokens in URL, checking existing session...');
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Session check error:', error);
            throw error;
          }

          if (session?.user) {
            console.log('✅ Found existing session:', session.user.id);
            setStatus('success');
            setMessage('Already authenticated! Redirecting...');
            setTimeout(() => {
              if (user?.role === 'PUBLIC') {
                window.location.href = '/';
              } else {
                window.location.href = '/dashboard';
              }
            }, 1500);
          } else {
            console.log('❌ No session found');
            setStatus('error');
            setMessage('Email confirmation link may have expired or is invalid.');
            setTimeout(() => navigate('/login?message=confirmation-failed'), 3000);
          }
        }
        
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        setStatus('error');
        setMessage(`Confirmation failed: ${error.message}`);
        setTimeout(() => navigate('/login?message=confirmation-error'), 4000);
      }
    };

    // Small delay to ensure page is loaded
    const timer = setTimeout(handleAuthCallback, 500);
    return () => clearTimeout(timer);
  }, [navigate, location, user, triggerProfileCreation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {status === 'processing' && 'Processing Email Confirmation'}
            {status === 'success' && 'Email Confirmed Successfully!'}
            {status === 'error' && 'Email Confirmation Failed'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
          
          {/* Debug information in development */}
          {process.env.NODE_ENV === 'development' && debugInfo.url && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-700 rounded text-xs text-left">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <p><strong>Has Tokens:</strong> {debugInfo.hasTokens ? 'Yes' : 'No'}</p>
              <p><strong>Type:</strong> {debugInfo.type || 'N/A'}</p>
              <p><strong>Token Type:</strong> {debugInfo.tokenType || 'N/A'}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Return to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 