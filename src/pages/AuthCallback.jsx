import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, triggerProfileCreation, refreshUser } = useAuth();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing email confirmation...');
  const [debugInfo, setDebugInfo] = useState({});
  const [countdown, setCountdown] = useState(5);

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
          
          // Force refresh the auth context
          try {
            await refreshUser();
            console.log('✅ Auth context refreshed');
          } catch (refreshError) {
            console.error('Auth context refresh error:', refreshError);
          }
          
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
                } else {
                  // Create basic profile for PUBLIC user
                  console.log('No registration data, creating basic PUBLIC profile...');
                  const basicUserData = {
                    name: data.user.email.split('@')[0],
                    email: data.user.email,
                    role: 'PUBLIC',
                    phone: null,
                    address: null,
                    city: null
                  };
                  await triggerProfileCreation(basicUserData);
                }
              }

              setStatus('success');
              setMessage('🎉 Email confirmed successfully! You are now logged in and will be redirected to the home page.');
              
              // Start countdown for redirect to home page
              const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                  if (prev <= 1) {
                    clearInterval(countdownInterval);
                    // Redirect to home page where they'll be logged in
                    window.location.href = '/';
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);

            } catch (profileError) {
              console.error('❌ Profile creation error:', profileError);
              setStatus('success'); // Still consider email confirmation successful
              setMessage('Email confirmed! You are now logged in. Redirecting to home page...');
              
              // Start countdown for redirect to home page
              const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                  if (prev <= 1) {
                    clearInterval(countdownInterval);
                    // Redirect to home page where they'll be logged in
                    window.location.href = '/';
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
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
            setMessage('Already authenticated! You are logged in. Redirecting to home page...');
            
            // Start countdown for redirect to home page
            const countdownInterval = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  // Always redirect to home page for confirmed users
                  window.location.href = '/';
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            console.log('❌ No session found');
            setStatus('error');
            setMessage('Email confirmation link may have expired or is invalid. Please try registering again.');
            
            // Start countdown for redirect to home page instead of login
            const countdownInterval = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  // Redirect to home page instead of login
                  window.location.href = '/';
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
        
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        setStatus('error');
        setMessage(`Confirmation failed: ${error.message}. Redirecting to home page...`);
        
        // Start countdown for redirect to home page instead of login
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Redirect to home page instead of login
              window.location.href = '/';
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    // Small delay to ensure page is loaded
    const timer = setTimeout(handleAuthCallback, 500);
    return () => clearTimeout(timer);
  }, [navigate, location, user, triggerProfileCreation, refreshUser]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoRegister = () => {
    navigate('/register');
  };

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
            {status === 'success' && 'Email Confirmed Successfully! 🎉'}
            {status === 'error' && 'Email Confirmation Issue'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
          
          {(status === 'success' || status === 'error') && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                Redirecting to home page in <span className="font-bold">{countdown}</span> seconds...
              </p>
              {status === 'success' && (
                <p className="text-blue-600 dark:text-blue-400 text-xs">
                  You'll be logged in and can start using all features!
                </p>
              )}
            </div>
          )}
          
          {/* Debug information in development */}
          {process.env.NODE_ENV === 'development' && debugInfo.url && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-700 rounded text-xs text-left">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <p><strong>Has Tokens:</strong> {debugInfo.hasTokens ? 'Yes' : 'No'}</p>
              <p><strong>Type:</strong> {debugInfo.type || 'N/A'}</p>
              <p><strong>Token Type:</strong> {debugInfo.tokenType || 'N/A'}</p>
            </div>
          )}
          
          <div className="space-y-3 mt-6">
            <button
              onClick={handleGoHome}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>🏠</span>
              Go to Home Page Now
            </button>
            {status === 'error' && (
              <button
                onClick={handleGoRegister}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Registering Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 