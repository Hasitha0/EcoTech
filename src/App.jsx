import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import CareerPage from './pages/CareerPage';
import FindRecyclingCentersPage from './pages/FindRecyclingCentersPage';
import LearnPage from './pages/LearnPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuthCallback from './pages/AuthCallback';
import EmailConfirm from './pages/EmailConfirm';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import React, { useEffect } from 'react';
import { supabase } from './lib/supabase';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

// Email confirmation handler component
function EmailConfirmationHandler() {
  const { user, loading, triggerProfileCreation } = useAuth();
  const { isDarkMode } = useTheme();
  const [countdown, setCountdown] = React.useState(3);
  const [hasRedirected, setHasRedirected] = React.useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = React.useState(false);
  const [isProcessingTokens, setIsProcessingTokens] = React.useState(true);

  // Process URL tokens on component mount
  React.useEffect(() => {
    const processEmailConfirmation = async () => {
      try {
        console.log('Processing email confirmation...');
        console.log('Current URL:', window.location.href);
        
        // Check if we have tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('URL tokens found:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });

        if (accessToken && refreshToken) {
          console.log('Setting session with tokens from URL...');
          
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Session set successfully:', data.user?.id);
            
            // Clear the URL hash to clean up the URL
            window.history.replaceState(null, null, window.location.pathname);
          }
        } else {
          console.log('No tokens in URL, checking existing session...');
          
          // Check if there's already a session
          const { data: { session } } = await supabase.auth.getSession();
          console.log('Existing session:', session?.user?.id);
        }
        
      } catch (error) {
        console.error('Error processing email confirmation:', error);
      } finally {
        setIsProcessingTokens(false);
      }
    };

    processEmailConfirmation();
  }, []);

  // Manual profile creation function
  const handleManualProfileCreation = async () => {
    try {
      setIsCreatingProfile(true);
      console.log('Manual profile creation triggered');
      
      // First, try to get the current auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('Current auth user:', authUser);
      
      if (!authUser) {
        throw new Error('No authenticated user found. Please try refreshing the page or signing in again.');
      }

      // Check if we have registration data for this user or any user
      let userData = null;
      const storedData = localStorage.getItem(`registration_data_${authUser.id}`);
      
      if (storedData) {
        console.log('Found registration data for current user');
        userData = JSON.parse(storedData);
      } else {
        // Check for any registration data in localStorage
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('registration_data_'));
        if (allKeys.length > 0) {
          console.log('Found registration data for different user ID, checking if email matches...');
          for (const key of allKeys) {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.email === authUser.email) {
              console.log('Found matching registration data by email');
              userData = data;
              // Clean up this key since we'll use it
              localStorage.removeItem(key);
              break;
            }
          }
        }
      }

      if (userData) {
        console.log('Creating profile with stored registration data:', userData);
      } else {
        console.log('No registration data found, creating basic profile');
        // Create basic profile data
        userData = {
          name: authUser.email.split('@')[0], // Use email username as name
          email: authUser.email,
          role: 'PUBLIC',
          phone: null,
          address: null,
          city: null
        };
      }
      
      const result = await triggerProfileCreation(userData);
      console.log('Profile creation result:', result);
      
      // Clean up any remaining registration data for this user
      localStorage.removeItem(`registration_data_${authUser.id}`);
      
      // Wait a moment for the auth state to update
      setTimeout(() => {
        if (result.user?.role === 'PUBLIC') {
          console.log('Redirecting PUBLIC user to home page');
          window.location.href = '/';
        } else {
          console.log('Redirecting', result.user?.role, 'user to dashboard');
          window.location.href = '/dashboard';
        }
      }, 1000);
      
    } catch (error) {
      console.error('Manual profile creation failed:', error);
      alert(`Profile creation failed: ${error.message}`);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  useEffect(() => {
    // Countdown timer for user feedback
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  useEffect(() => {
    // Handle redirection with shorter timeout and better fallback
    const timer = setTimeout(() => {
      if (hasRedirected || isProcessingTokens) return; // Prevent multiple redirects or redirect while processing tokens
      
      console.log('EmailConfirmationHandler - Redirect check:', { user, loading, hasRedirected, isProcessingTokens });
      console.log('EmailConfirmationHandler - User details:', { 
        userId: user?.id, 
        userEmail: user?.email, 
        userRole: user?.role,
        userProfile: user?.profile 
      });
      
      if (!loading) {
        if (user && user.role) {
          // Role-based redirection after email confirmation
          console.log('Email confirmed - redirecting user based on role:', user.role);
          setHasRedirected(true);
          
          if (user.role === 'PUBLIC') {
            // Public users go to homepage as logged-in users
            console.log('Redirecting PUBLIC user to home page (/)');
            console.log('User object before redirect:', JSON.stringify(user, null, 2));
            window.location.href = '/';
          } else {
            // Other roles (COLLECTOR, RECYCLING_CENTER, ADMIN) go to dashboard
            console.log('Redirecting', user.role, 'user to dashboard (/dashboard)');
            console.log('User object before redirect:', JSON.stringify(user, null, 2));
            window.location.href = '/dashboard';
          }
        } else if (user && !user.role) {
          console.log('User found but no role yet - waiting for profile to load...');
          // User exists but role not loaded yet - don't redirect yet
        } else {
          // No user found after loading - might be an error or session issue
          console.log('No user found after email confirmation - staying on confirmation page');
          // Don't redirect automatically if no user - let them use manual options
        }
      }
    }, 4000); // Reduced to 4000ms since automatic profile creation should be faster

    return () => clearTimeout(timer);
  }, [user, loading, hasRedirected, isProcessingTokens]);

  // Emergency fallback - if we're still here after 15 seconds, something went wrong
  useEffect(() => {
    const emergencyTimer = setTimeout(() => {
      if (!hasRedirected && !user && !isProcessingTokens) {
        console.log('Emergency fallback - no user found, staying on page for manual intervention');
        // Don't auto-redirect if no user - let them troubleshoot
      }
    }, 15000);

    return () => clearTimeout(emergencyTimer);
  }, [hasRedirected, user, isProcessingTokens]);

  if (loading || isProcessingTokens) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 bg-slate-950">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-emerald-500 mb-4">
            {isProcessingTokens ? 'Processing Email Confirmation' : 'Confirming Your Email'}
          </h2>
          <p className="mb-4 transition-all duration-500 text-gray-300">
            {isProcessingTokens 
              ? 'Please wait while we process your email confirmation and set up your account...'
              : 'Please wait while we confirm your email address and set up your account...'
            }
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
            <span className="text-sm">This may take a few moments...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 bg-slate-950">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          {user ? (
            <div className="relative">
              <svg className="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ) : (
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
        
        {user ? (
          <>
            <h2 className="text-4xl font-bold text-emerald-500 mb-4">Email Confirmed!</h2>
            <p className="mb-6 transition-all duration-500 text-gray-300 text-lg">
              Welcome to EcoTech! Your email has been confirmed successfully.
            </p>
            <div className="flex items-center justify-center space-x-2 text-emerald-400 mb-6">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
              <span className="text-sm">Redirecting you to the home page in {countdown} seconds...</span>
            </div>
            
            {/* Manual redirect button as backup */}
            <div className="mt-8">
              <button
                onClick={() => {
                  setHasRedirected(true);
                  if (user?.role === 'PUBLIC') {
                    window.location.href = '/';
                  } else {
                    window.location.href = '/dashboard';
                  }
                }}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 transform hover:scale-105"
              >
                Continue to Home
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mt-4">
              You can now start using all EcoTech features!
            </p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-yellow-500 mb-4">Setting Up Your Account</h2>
            <p className="mb-6 transition-all duration-500 text-gray-300">
              Your email has been confirmed! We're setting up your account now.
            </p>
            
            {/* Manual profile creation button */}
            <div className="space-y-4">
              <button
                onClick={handleManualProfileCreation}
                disabled={isCreatingProfile}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                {isCreatingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up your account...
                  </>
                ) : (
                  'Complete Account Setup'
                )}
              </button>
              
              <div className="text-sm">
                <a
                  href="/login"
                  className="text-emerald-400 hover:text-emerald-300 transition-all duration-200"
                >
                  Or sign in to existing account
                </a>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mt-4">
              This usually happens automatically, but you can complete it manually if needed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// Debug Auth Page Component
function DebugAuthPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [authUser, setAuthUser] = React.useState(null);
  const [sessionData, setSessionData] = React.useState(null);
  const [profileData, setProfileData] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        setSessionData(session);
        
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          return;
        }

        // Check current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        setAuthUser(user);
        
        if (userError) {
          setError(`User error: ${userError.message}`);
          return;
        }

        // Check profile if user exists
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            setError(`Profile error: ${profileError.message}`);
          } else {
            setProfileData(profile);
          }
        }
      } catch (err) {
        setError(`General error: ${err.message}`);
      }
    };

    checkAuthState();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-emerald-400">Authentication Debug Page</h1>
        
        {/* AuthContext State */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-emerald-300">AuthContext State</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Loading:</span> {loading ? 'true' : 'false'}</p>
            <p><span className="font-semibold">Is Authenticated:</span> {isAuthenticated ? 'true' : 'false'}</p>
            <p><span className="font-semibold">User:</span></p>
            <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'null'}
            </pre>
          </div>
        </div>

        {/* Supabase Auth User */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-emerald-300">Supabase Auth User</h2>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
            {authUser ? JSON.stringify(authUser, null, 2) : 'null'}
          </pre>
        </div>

        {/* Session Data */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-emerald-300">Session Data</h2>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
            {sessionData ? JSON.stringify(sessionData, null, 2) : 'null'}
          </pre>
        </div>

        {/* Profile Data */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-emerald-300">Profile Data</h2>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
            {profileData ? JSON.stringify(profileData, null, 2) : 'null'}
          </pre>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-6 bg-red-900 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-red-300">Error</h2>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Reload Page
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-4"
          >
            Go to Home
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  
  // Debug logging for routing issues
  useEffect(() => {
    console.log('🔍 AppContent - Current location:', location.pathname);
    console.log('🔍 AppContent - Full location:', location);
    console.log('🔍 AppContent - Search params:', location.search);
    console.log('🔍 AppContent - Available routes: /, /about, /confirm, /auth/confirm, /dashboard, etc.');
  }, [location]);
  
  // Special handling for /confirm route
  if (location.pathname === '/confirm') {
    console.log('🎯 Direct /confirm route detected - rendering EmailConfirm component');
    return (
      <div className="min-h-screen bg-slate-950">
        <EmailConfirm />
      </div>
    );
  }
  
  // Hide navbar for all authenticated users on dashboard routes and registration-pending page
  const shouldHideNavbar = (user && location.pathname.startsWith('/dashboard')) || 
                          location.pathname === '/registration-pending' ||
                          location.pathname === '/email-confirmed' ||
                          location.pathname === '/confirm' ||
                          location.pathname === '/auth/confirm';
  
  // Hide footer for all authenticated users on dashboard routes, registration-pending page, register page, and login page
  const shouldHideFooter = (user && location.pathname.startsWith('/dashboard')) || 
                          location.pathname === '/registration-pending' ||
                          location.pathname === '/register' ||
                          location.pathname.startsWith('/register/') ||
                          location.pathname === '/login' ||
                          location.pathname === '/email-confirmed' ||
                          location.pathname === '/confirm' ||
                          location.pathname === '/auth/confirm';

  return (
      <div className="min-h-screen flex flex-col transition-all duration-500 bg-slate-950">
      {!shouldHideNavbar && <Navbar />}
        
        <main className="flex-grow">
          <Routes>
            {/* Simple test route to verify routing works */}
            <Route path="/simple-test" element={
              <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-emerald-500 mb-4">Simple Test Route Works! ✅</h1>
                  <p className="text-gray-300 mb-4">If you can see this, routing is working correctly.</p>
                  <p className="text-gray-300 mb-4">Current path: {location.pathname}</p>
                  <p className="text-gray-300 mb-4">Search params: {location.search}</p>
                </div>
              </div>
            } />
            
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/recycling-center" element={<div className="container mx-auto px-4 py-24 text-white">Recycling Center Staff Page</div>} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/find-centers" element={<FindRecyclingCentersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/collector" element={<RegisterPage />} />
            <Route path="/register/recycling-center" element={<RegisterPage />} />
            <Route path="/email-confirmed" element={<EmailConfirmationHandler />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/confirm" element={<EmailConfirm />} />
            <Route path="/confirm" element={<EmailConfirm />} />
            {/* Debug route to test routing */}
            <Route path="/test-route" element={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><h1>Test Route Works!</h1></div>} />
            <Route path="/registration-pending" element={
              <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 bg-slate-950">
                <div className="max-w-md w-full text-center">
                  <h2 className="text-4xl font-bold text-emerald-500 mb-4">Registration Pending</h2>
                  <p className="mb-8 transition-all duration-500 text-gray-300">
                    Thank you for registering! Your application is being reviewed by our team.
                    We will notify you by email once your account has been approved.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
                  >
                    Return to Home
                  </a>
                </div>
              </div>
            } />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* Temporary debug route */}
            <Route path="/debug-auth" element={<DebugAuthPage />} />
            
            {/* Comprehensive debug route for URL testing */}
            <Route path="/url-debug" element={
              <div className="min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold mb-8 text-emerald-400">URL Debug Information</h1>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h2 className="text-xl font-bold mb-4 text-emerald-300">Current URL Information</h2>
                      <div className="space-y-2 text-sm">
                        <p><strong>Full URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                        <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
                        <p><strong>Pathname:</strong> {location.pathname}</p>
                        <p><strong>Search:</strong> {location.search}</p>
                        <p><strong>Hash:</strong> {typeof window !== 'undefined' ? window.location.hash : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h2 className="text-xl font-bold mb-4 text-emerald-300">URL Parameters</h2>
                      <div className="space-y-2 text-sm">
                        {location.search ? (
                          Object.entries(Object.fromEntries(new URLSearchParams(location.search))).map(([key, value]) => (
                            <p key={key}><strong>{key}:</strong> {value}</p>
                          ))
                        ) : (
                          <p>No search parameters found</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h2 className="text-xl font-bold mb-4 text-emerald-300">Hash Parameters</h2>
                      <div className="space-y-2 text-sm">
                        {typeof window !== 'undefined' && window.location.hash ? (
                          Object.entries(Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)))).map(([key, value]) => (
                            <p key={key}><strong>{key}:</strong> {value}</p>
                          ))
                        ) : (
                          <p>No hash parameters found</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h2 className="text-xl font-bold mb-4 text-emerald-300">Test Links</h2>
                      <div className="space-y-2">
                        <a href="/confirm?code=test123" className="block text-emerald-400 hover:text-emerald-300">Test /confirm with code parameter</a>
                        <a href="/auth/confirm?token=test456" className="block text-emerald-400 hover:text-emerald-300">Test /auth/confirm with token parameter</a>
                        <a href="/confirm#access_token=test&refresh_token=test" className="block text-emerald-400 hover:text-emerald-300">Test /confirm with hash parameters</a>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              </div>
            } />
            
            {/* Catch-all route for debugging */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-500 mb-4">Route Not Found</h1>
                  <p className="text-gray-300 mb-4">Current path: {location.pathname}</p>
                  <p className="text-gray-300 mb-4">Search params: {location.search}</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
      {!shouldHideFooter && <Footer />}
      </div>
  );
}

function App() {
  // Critical fix: Handle /confirm route at the top level before any context issues
  console.log('🔍 App component - Current pathname:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
  console.log('🔍 App component - Full URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

  // Emergency route handling for /confirm - bypass all context and routing issues
  if (typeof window !== 'undefined' && window.location.pathname === '/confirm') {
    console.log('🚨 EMERGENCY: /confirm route detected at App level - rendering EmailConfirm directly');
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="fixed top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">
          Emergency Route Handler Active 🚨
        </div>
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50">
          EmailConfirm Emergency Mode ✅
        </div>
        <EmailConfirm />
      </div>
    );
  }

  // Test emergency route handler
  if (typeof window !== 'undefined' && window.location.pathname === '/test-emergency') {
    console.log('🧪 TEST: Emergency route handler is working!');
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="fixed top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50">
            Emergency Handler Works! ✅
          </div>
          <h1 className="text-4xl font-bold text-green-500 mb-4">Emergency Route Handler Test</h1>
          <p className="text-gray-300 mb-4">✅ Emergency route handler is working correctly!</p>
          <p className="text-gray-300 mb-4">Current URL: {window.location.href}</p>
          <p className="text-gray-300 mb-4">This means /confirm should also work</p>
          <button 
            onClick={() => window.location.href = '/confirm?code=test123'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            Test /confirm Route
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
