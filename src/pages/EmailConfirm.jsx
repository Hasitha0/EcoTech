import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createSupabaseClient, getAuthConfig } from '../lib/supabase-config';
import { displayAuthConfiguration } from '../utils/supabase-auth-config';

const EmailConfirm = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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

  // Main confirmation logic - memoized to prevent infinite loops
  const confirmEmail = useCallback(async () => {
    // Prevent multiple executions
    if (hasProcessed) {
      console.log('🔄 Email confirmation already processed, skipping...');
      return;
    }

    try {
      console.log('🔍 EmailConfirm component mounted');
      console.log('🔍 Current location:', location);
      console.log('🔍 Current URL:', window.location.href);
      
      // Add a visual indicator that the component is loaded
      document.title = 'Email Confirmation - EcoTech';
      
      // Mark as processing to prevent re-execution
      setHasProcessed(true);
      
      // Get URL parameters from both location.search and window.location.search as fallback
      const searchParams = location.search || window.location.search;
      const urlParams = new URLSearchParams(searchParams);
      const code = urlParams.get('code');
      const token = urlParams.get('token');
      const type = urlParams.get('type');
      
      // Get auth configuration for debugging
      const authConfig = getAuthConfig();
      
      // Set debug information
      const debug = {
        currentUrl: window.location.href,
        authConfig,
        urlParams: Object.fromEntries(urlParams.entries()),
        hasCode: !!code,
        hasToken: !!token,
        type,
        locationSearch: location.search,
        locationPathname: location.pathname,
        windowLocationSearch: window.location.search,
        windowLocationPathname: window.location.pathname,
        componentMounted: true,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(debug);
      
      console.log('🔍 Email confirmation debug info:', debug);
      
      // Display required Supabase configuration
      if (authConfig.domain.includes('localhost')) {
        console.warn('⚠️ Running on localhost - this might cause redirect issues in production');
        displayAuthConfiguration();
      }

      if (!code && !token) {
        throw new Error('No confirmation code or token found in URL. Please check the confirmation link.');
      }

      let result;
      
      if (code) {
        // Handle email confirmation with code (recommended format)
        console.log('✅ Confirming email with code...');
        setMessage('Processing your email confirmation...');
        
        result = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'email'
        });
      } else if (token) {
        // Handle email confirmation with token (fallback)
        console.log('✅ Confirming email with token...');
        setMessage('Processing your email confirmation...');
        
        result = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });
      }

      console.log('✅ Confirmation result:', result);

      if (result.error) {
        console.error('❌ Confirmation error:', result.error);
        throw result.error;
      }

      if (result.data?.user) {
        console.log('✅ Email confirmed successfully for user:', result.data.user.id);
        setMessage('Email confirmed successfully! You are now logged in.');
        
        // Wait a moment then redirect to dashboard
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard...');
          if (navigate) {
            navigate('/dashboard');
          } else {
            // Fallback if navigate is not available
            window.location.href = '/dashboard';
          }
        }, 2000);
      } else {
        throw new Error('Email confirmation completed but no user data received');
      }

    } catch (error) {
      console.error('❌ Email confirmation error:', error);
      setError(`Failed to confirm email: ${error.message}`);
      
      // Provide helpful error messages
      if (error.message.includes('Invalid token') || error.message.includes('expired')) {
        setError('The confirmation link has expired or is invalid. Please request a new confirmation email.');
      } else if (error.message.includes('already confirmed')) {
        setError('This email is already confirmed. You can now log in.');
        setTimeout(() => {
          if (navigate) {
            navigate('/login');
          } else {
            window.location.href = '/login';
          }
        }, 2000);
      } else if (error.message.includes('No confirmation code')) {
        setError('Invalid confirmation link format. Please check your email and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [hasProcessed, location.search, location.pathname, navigate, supabase.auth]);

  // Single useEffect with proper dependencies
  useEffect(() => {
    confirmEmail();
  }, [confirmEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Visible indicator that EmailConfirm component is loaded */}
      <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50">
        EmailConfirm Component Loaded ✅
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-emerald-500 mb-4">
            Email Confirmation
          </h2>
          
          {loading && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-gray-300">Processing your email confirmation...</p>
            </div>
          )}
          
          {message && !error && (
            <div className="bg-emerald-900 border border-emerald-700 text-emerald-100 px-4 py-3 rounded mb-4">
              <p>{message}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <div className="mt-4 space-x-4">
                <button
                  onClick={handleResendConfirmation}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Resend Confirmation
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={handleGoToRegister}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Register Again
                </button>
              </div>
            </div>
          )}
          
          {!loading && !error && !message && (
            <div className="space-y-4">
              <p className="text-gray-300">Ready to confirm your email.</p>
              <div className="space-x-4">
                <button
                  onClick={handleGoToLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Debug information */}
          {Object.keys(debugInfo).length > 0 && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300">
                Debug Information (Click to expand)
              </summary>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirm; 