import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const EmailConfirm = () => {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 EmailConfirm - Starting confirmation process');
        console.log('🔍 Current URL:', window.location.href);
        
        // Check if user is already authenticated (happens with ConfirmationURL)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Failed to check authentication status');
        }

        if (session && session.user) {
          console.log('✅ User is already authenticated:', session.user.email);
          setUserEmail(session.user.email);
          setMessage(`Welcome ${session.user.email}! Your email has been confirmed and you are now logged in.`);
          setStatus('success');
          
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile check error:', profileError);
          }

          if (!profile) {
            console.log('No profile found, creating one...');
            // Create basic profile
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.email.split('@')[0],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }])
              .select()
              .single();

            if (createError) {
              console.error('Profile creation error:', createError);
            } else {
              console.log('✅ Profile created:', newProfile);
            }
          }

          // Force refresh the auth context to recognize the new session
          try {
            await refreshUser();
            console.log('✅ Auth context refreshed');
          } catch (refreshError) {
            console.error('Auth context refresh error:', refreshError);
          }

          // Start countdown for redirect to home page
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                // Redirect to home page where they'll be logged in
                navigate('/', { replace: true });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

        } else {
          // No session found, this might be an error or the URL was already processed
          console.log('❌ No active session found');
          setStatus('error');
          setMessage('Email confirmation failed or link has already been used. Please try logging in.');
        }

      } catch (error) {
        console.error('❌ Email confirmation error:', error);
        setStatus('error');
        setMessage(`Confirmation failed: ${error.message}`);
      }
    };

    // Add a small delay to ensure the page has loaded
    const timer = setTimeout(handleEmailConfirmation, 500);
    return () => clearTimeout(timer);
  }, [navigate, refreshUser]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-6"></div>
            <h2 className="text-3xl font-bold text-white mb-4">Confirming Your Email</h2>
            <p className="text-gray-300">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-emerald-500 text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-white mb-4">Email Confirmed Successfully!</h2>
            <div className="bg-emerald-900/50 border border-emerald-500 rounded-lg p-6 mb-6">
              <p className="text-emerald-100 text-lg mb-2">Welcome to EcoTech!</p>
              <p className="text-gray-300">{message}</p>
              <div className="mt-4 text-emerald-200">
                <p className="text-sm">🎉 You are now logged in and ready to start recycling!</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-2">
                  Redirecting to home page in <span className="font-bold text-blue-100">{countdown}</span> seconds...
                </p>
                <p className="text-gray-400 text-xs">You'll be logged in and can start using all features!</p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleGoHome}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>🏠</span>
                  Go to Home Now
                </button>
                <button
                  onClick={handleGoDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-6">❌</div>
            <h2 className="text-3xl font-bold text-white mb-4">Confirmation Failed</h2>
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-6">
              <p className="text-red-100 mb-2">Something went wrong</p>
              <p className="text-gray-300">{message}</p>
            </div>
            <div className="space-y-4">
              <p className="text-gray-400">Don't worry, you can try these options:</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Register Again
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-lg shadow-xl p-8 border border-slate-700">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailConfirm; 