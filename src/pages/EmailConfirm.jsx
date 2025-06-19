import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createSupabaseClient, getAuthConfig } from '../lib/supabase-config';
import { displayAuthConfiguration } from '../utils/supabase-auth-config';
import { supabase } from '../lib/supabase-config';
import { errorHandler } from '../utils/errorHandler';

// Emergency standalone EmailConfirm component
const StandaloneEmailConfirm = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  console.log('🚨 StandaloneEmailConfirm component loaded in emergency mode');

  useEffect(() => {
    const confirmEmailStandalone = async () => {
      try {
        console.log('🚨 Emergency email confirmation starting...');
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const token = urlParams.get('token');
        
        console.log('🚨 Emergency mode - URL params:', { hasCode: !!code, hasToken: !!token });
        
        if (!code && !token) {
          throw new Error('No confirmation code or token found in URL');
        }

        // Create Supabase client
        const supabase = createSupabaseClient();
        
        setMessage('Processing your email confirmation...');
        
        let result;
        
        if (code) {
          console.log('🚨 Emergency mode - Confirming with code...');
          result = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'email'
          });
        } else if (token) {
          console.log('🚨 Emergency mode - Confirming with token...');
          result = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          });
        }

        console.log('🚨 Emergency mode - Confirmation result:', result);

        if (result.error) {
          throw result.error;
        }

        if (result.data?.user) {
          console.log('🚨 Emergency mode - Email confirmed for user:', result.data.user.id);
          setMessage('Email confirmed successfully! Creating your profile...');
          
          // Try to create a basic profile
          try {
            const profileData = {
              id: result.data.user.id,
              name: result.data.user.email.split('@')[0],
              email: result.data.user.email,
              role: 'PUBLIC',
              status: 'active',
              district: 'Gampaha',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .insert([profileData])
              .select()
              .single();

            if (profileError) {
              console.log('🚨 Emergency mode - Profile creation failed:', profileError);
              setMessage('Email confirmed! Please log in to complete your profile setup.');
            } else {
              console.log('🚨 Emergency mode - Profile created:', profile);
              setMessage('Email confirmed and profile created successfully! Redirecting...');
            }
          } catch (profileError) {
            console.log('🚨 Emergency mode - Profile creation error:', profileError);
            setMessage('Email confirmed! Please log in to complete your profile setup.');
          }
          
          // Redirect after 3 seconds
          setTimeout(() => {
            console.log('🚨 Emergency mode - Redirecting to home...');
            window.location.href = '/';
          }, 3000);
        } else {
          throw new Error('Email confirmation completed but no user data received');
        }

      } catch (error) {
        console.error('🚨 Emergency mode - Error:', error);
        setError(`Failed to confirm email: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    confirmEmailStandalone();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-red-500 mb-4">
            Emergency Email Confirmation
          </h2>
          
          {loading && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-300">Processing your email confirmation...</p>
            </div>
          )}
          
          {message && !error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
              <p>{message}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <div className="mt-4">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mr-4"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmailConfirm = () => {
  // Check if we're in emergency mode (no router context available)
  try {
    // Try to use router hooks - if they fail, we're in emergency mode
    const navigate = useNavigate();
    const location = useLocation();
    
    // If we get here, router context is available, use the full component
    console.log('🔍 EmailConfirm - Router context available, using full component');
  } catch (error) {
    // Router context not available, use standalone component
    console.log('🚨 EmailConfirm - No router context, using emergency standalone component');
    return <StandaloneEmailConfirm />;
  }
  
  const [confirmationStatus, setConfirmationStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [hasProcessed, setHasProcessed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Create supabase client once and memoize it
  const supabase = createSupabaseClient();

  // Add immediate console log to verify component is rendering
  console.log('🎯 EmailConfirm component is rendering!', { pathname: location.pathname, search: location.search });

  // Add alert to make sure component is loading (temporary debugging)
  useEffect(() => {
    console.log('🚨 EmailConfirm useEffect triggered - Component is definitely loading!');
    // Temporary visual confirmation
    const timer = setTimeout(() => {
      if (!hasProcessed) {
        console.log('🚨 Component loaded but confirmation not processed yet');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Memoize navigation functions to prevent re-renders
  const handleGoToLogin = useCallback(() => {
    console.log('🔄 Navigating to login...');
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
  }, [navigate]);

  const handleGoToRegister = useCallback(() => {
    console.log('🔄 Navigating to register...');
    if (navigate) {
      navigate('/register');
    } else {
      window.location.href = '/register';
    }
  }, [navigate]);

  const handleGoToDashboard = useCallback(() => {
    console.log('🔄 Navigating to dashboard...');
    if (navigate) {
      navigate('/dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  }, [navigate]);

  const handleResendConfirmation = useCallback(async () => {
    try {
      const searchParams = location.search || window.location.search;
      const urlParams = new URLSearchParams(searchParams);
      const email = urlParams.get('email');
      
      if (!email) {
        setError('No email address found. Please try registering again.');
        return;
      }

      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${getAuthConfig().domain}/confirm`
        }
      });

      if (error) throw error;
      
      setMessage('New confirmation email sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend confirmation error:', error);
      setError(`Failed to resend confirmation: ${error.message}`);
    }
  }, [location.search, supabase.auth]);

  // Enhanced logging for new tab debugging
  const logInfo = useCallback((message, data = {}) => {
    console.log(`🔍 EmailConfirm: ${message}`, data);
    setDebugInfo(prev => ({
      ...prev,
      [`${Date.now()}`]: { message, data, timestamp: new Date().toISOString() }
    }));
  }, []);

  // Check if we're in a new tab and handle cross-tab communication
  const checkNewTabContext = useCallback(() => {
    const isNewTab = !window.opener && window.history.length === 1;
    const referrer = document.referrer;
    const hasSessionStorage = sessionStorage.getItem('eco-tech-session');
    
    logInfo('New tab context check', {
      isNewTab,
      referrer,
      hasSessionStorage: !!hasSessionStorage,
      windowOpener: !!window.opener,
      historyLength: window.history.length,
      url: window.location.href
    });

    // If we're in a new tab, try to communicate with parent window
    if (isNewTab && !hasSessionStorage) {
      logInfo('Detected new tab without session context - setting up cross-tab communication');
      
      // Set a flag that we're processing email confirmation
      sessionStorage.setItem('email-confirmation-processing', 'true');
      localStorage.setItem('email-confirmation-processing', JSON.stringify({
        url: window.location.href,
        timestamp: Date.now()
      }));
    }

    return { isNewTab, referrer, hasSessionStorage };
  }, [logInfo]);

  // Enhanced token extraction
  const extractTokenFromURL = useCallback(() => {
    logInfo('Extracting token from URL');
    const urlParams = new URLSearchParams(window.location.search);
    const fragment = window.location.hash.substring(1);
    const fragmentParams = new URLSearchParams(fragment);
    
    // Multiple ways to get the confirmation code/token
    const code = urlParams.get('code') || fragmentParams.get('access_token');
    const token = urlParams.get('token') || urlParams.get('token_hash');
    const type = urlParams.get('type') || 'email';
    
    const tokenInfo = {
      code,
      token,
      type,
      fullURL: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      allParams: Object.fromEntries(urlParams.entries()),
      allFragments: Object.fromEntries(fragmentParams.entries())
    };
    
    logInfo('Token extraction complete', tokenInfo);
    return tokenInfo;
  }, [logInfo]);

  // Enhanced profile creation with better error handling
  const createUserProfile = useCallback(async (user) => {
    logInfo('Creating user profile', { userId: user.id, email: user.email });
    
    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProfile) {
        logInfo('Profile already exists', existingProfile);
        return existingProfile;
      }

      // Get registration data from localStorage/sessionStorage
      let registrationData = {};
      try {
        const storedData = localStorage.getItem('registration-data') || 
                          sessionStorage.getItem('registration-data');
        if (storedData) {
          registrationData = JSON.parse(storedData);
          logInfo('Found registration data', registrationData);
        }
      } catch (e) {
        logInfo('No registration data found or parse error', e.message);
      }

      // Create profile with available data
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: registrationData.fullName || user.user_metadata?.full_name || '',
        username: registrationData.username || user.email?.split('@')[0] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      logInfo('Creating profile with data', profileData);

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      logInfo('Profile created successfully', newProfile);

      // Clean up registration data
      localStorage.removeItem('registration-data');
      sessionStorage.removeItem('registration-data');

      return newProfile;
    } catch (error) {
      logInfo('Profile creation error', { error: error.message, code: error.code });
      throw error;
    }
  }, [logInfo]);

  // Enhanced confirmation process
  const handleEmailConfirmation = useCallback(async () => {
    if (hasProcessed) {
      logInfo('Already processed, skipping');
      return;
    }

    setHasProcessed(true);
    logInfo('Starting email confirmation process');

    try {
      setConfirmationStatus('processing');
      
      // Check new tab context
      const tabContext = checkNewTabContext();
      
      // Extract token information
      const tokenInfo = extractTokenFromURL();
      
      if (!tokenInfo.code && !tokenInfo.token) {
        throw new Error('No confirmation code or token found in URL');
      }

      logInfo('Attempting confirmation with Supabase');

      let result;
      
      // Try different confirmation methods
      if (tokenInfo.code) {
        logInfo('Using code-based confirmation');
        result = await supabase.auth.verifyOtp({
          token_hash: tokenInfo.code,
          type: tokenInfo.type
        });
      } else if (tokenInfo.token) {
        logInfo('Using token-based confirmation');
        result = await supabase.auth.verifyOtp({
          token_hash: tokenInfo.token,
          type: tokenInfo.type
        });
      }

      logInfo('Supabase confirmation result', {
        hasSession: !!result?.data?.session,
        hasUser: !!result?.data?.user,
        error: result?.error?.message
      });

      if (result?.error) {
        throw result.error;
      }

      if (!result?.data?.session) {
        throw new Error('No session returned from confirmation');
      }

      const { session, user } = result.data;
      setUserInfo(user);

      logInfo('Email confirmed successfully', { userId: user.id, email: user.email });

      // Create user profile
      await createUserProfile(user);

      setConfirmationStatus('success');

      // Handle new tab scenario
      if (tabContext.isNewTab) {
        logInfo('New tab detected - setting up redirect');
        
        // Notify other tabs about successful confirmation
        localStorage.setItem('email-confirmation-success', JSON.stringify({
          userId: user.id,
          email: user.email,
          timestamp: Date.now()
        }));
        
        // Clean up processing flags
        sessionStorage.removeItem('email-confirmation-processing');
        localStorage.removeItem('email-confirmation-processing');
        
        // Redirect to main app
        setTimeout(() => {
          logInfo('Redirecting to main app');
          window.location.href = '/';
        }, 3000);
      } else {
        // Regular tab - just redirect
        setTimeout(() => {
          logInfo('Redirecting to main app (regular tab)');
          window.location.href = '/';
        }, 2000);
      }

    } catch (error) {
      logInfo('Confirmation error', { error: error.message, code: error.code });
      setError(error.message);
      setConfirmationStatus('error');
      
      // Clean up processing flags on error
      sessionStorage.removeItem('email-confirmation-processing');
      localStorage.removeItem('email-confirmation-processing');
    }
  }, [hasProcessed, checkNewTabContext, extractTokenFromURL, createUserProfile, logInfo]);

  // Effect to handle confirmation
  useEffect(() => {
    if (!hasProcessed) {
      logInfo('EmailConfirm component mounted, starting confirmation');
      handleEmailConfirmation();
    }
  }, [handleEmailConfirmation, hasProcessed, logInfo]);

  // Cross-tab communication listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'email-confirmation-success') {
        logInfo('Received confirmation success from another tab');
        setConfirmationStatus('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logInfo]);

  const renderStatus = () => {
    switch (confirmationStatus) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirming Your Email</h2>
            <p className="text-gray-300">Please wait while we verify your email address...</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>URL: {window.location.href}</p>
              <p>Processing in: {window.opener ? 'Popup/New Tab' : 'Same Tab'}</p>
            </div>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <div className="text-emerald-500 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Confirmed!</h2>
            <p className="text-gray-300 mb-4">
              Welcome to EcoTech, {userInfo?.email}! Your account has been successfully verified.
            </p>
            <p className="text-sm text-gray-400">Redirecting you to the main app...</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirmation Failed</h2>
            <p className="text-gray-300 mb-4">
              We couldn't confirm your email address. This might be because:
            </p>
            <ul className="text-left text-gray-300 mb-4 space-y-1">
              <li>• The confirmation link has expired</li>
              <li>• The link has already been used</li>
              <li>• The link is invalid</li>
            </ul>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
            >
              Try Registering Again
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Emergency mode indicators */}
      <div className="fixed top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">
        Emergency Route Handler Active 🚨
      </div>
      <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50">
        EmailConfirm Emergency Mode ✅
      </div>
      
      <div className="max-w-md w-full bg-slate-900 rounded-lg shadow-xl p-8">
        {renderStatus()}
        
        {/* Debug information */}
        {Object.keys(debugInfo).length > 0 && (
          <details className="mt-8">
            <summary className="text-gray-400 cursor-pointer">Debug Information</summary>
            <div className="mt-2 text-xs text-gray-500 bg-slate-800 p-2 rounded max-h-40 overflow-y-auto">
              {Object.entries(debugInfo).map(([key, info]) => (
                <div key={key} className="mb-2">
                  <strong>{info.message}:</strong>
                  <pre>{JSON.stringify(info.data, null, 2)}</pre>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default EmailConfirm; 