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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Confirming Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          {error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Email Confirmation Failed
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={handleResendConfirmation}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Resend Confirmation Email
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={handleGoToRegister}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Register Again
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-green-500 mb-4">
                <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Email Confirmed!
              </h2>
              <p className="text-green-600 mb-4">{message}</p>
              <p className="text-gray-500 text-sm">
                Redirecting to your dashboard...
              </p>
              <button
                onClick={handleGoToDashboard}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continue to Dashboard
              </button>
            </>
          )}
          
          {/* Debug information in development or when there are issues */}
          {(debugInfo.authConfig?.domain?.includes('localhost') || process.env.NODE_ENV === 'development' || error) && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Information:</h3>
              <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirm; 