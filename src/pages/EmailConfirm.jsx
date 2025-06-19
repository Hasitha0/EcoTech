import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createSupabaseClient, getAuthConfig } from '../lib/supabase-config';
import { displayAuthConfiguration } from '../utils/supabase-auth-config';

const EmailConfirm = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
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
          type
        };
        setDebugInfo(debug);
        
        console.log('Email confirmation debug info:', debug);
        
        // Display required Supabase configuration
        if (authConfig.domain.includes('localhost')) {
          console.warn('Running on localhost - this might cause redirect issues in production');
          displayAuthConfiguration();
        }

        if (!code && !token) {
          throw new Error('No confirmation code or token found in URL');
        }

        let result;
        
        if (code) {
          // Handle email confirmation with code (recommended format)
          console.log('Confirming email with code...');
          result = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'email'
          });
        } else if (token) {
          // Handle email confirmation with token (fallback)
          console.log('Confirming email with token...');
          result = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          });
        }

        console.log('Confirmation result:', result);

        if (result.error) {
          throw result.error;
        }

        if (result.data?.user) {
          setMessage('Email confirmed successfully! You are now logged in.');
          
          // Wait a moment then redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error('Email confirmation completed but no user data received');
        }

      } catch (error) {
        console.error('Email confirmation error:', error);
        setError(`Failed to confirm email: ${error.message}`);
        
        // Provide helpful error messages
        if (error.message.includes('Invalid token') || error.message.includes('expired')) {
          setError('The confirmation link has expired or is invalid. Please request a new confirmation email.');
        } else if (error.message.includes('already confirmed')) {
          setError('This email is already confirmed. You can now log in.');
          setTimeout(() => navigate('/login'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [location, navigate, supabase.auth]);

  const handleResendConfirmation = async () => {
    try {
      const urlParams = new URLSearchParams(location.search);
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
  };

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
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go to Login
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
            </>
          )}
          
          {/* Debug information in development */}
          {(debugInfo.authConfig?.domain?.includes('localhost') || process.env.NODE_ENV === 'development') && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Information:</h3>
              <pre className="text-xs text-gray-600 overflow-auto">
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