import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createSupabaseClient, getAuthConfig } from '../lib/supabase-config';
import { displayAuthConfiguration } from '../utils/supabase-auth-config';

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

  // Function to create user profile after email confirmation
  const createUserProfileAfterConfirmation = useCallback(async (authUser) => {
    try {
      console.log('🔧 Creating user profile after email confirmation for:', authUser.id);
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        throw new Error(`Failed to check existing profile: ${checkError.message}`);
      }

      if (existingProfile) {
        console.log('✅ Profile already exists:', existingProfile);
        return existingProfile;
      }

      // Check for registration data in localStorage
      const storedData = localStorage.getItem(`registration_data_${authUser.id}`);
      let userData = null;
      
      if (storedData) {
        console.log('📦 Found registration data in localStorage');
        userData = JSON.parse(storedData);
      } else {
        console.log('📦 No registration data found, checking all localStorage keys...');
        // Check for any registration data keys
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('registration_data_'));
        console.log('Available registration data keys:', allKeys);
        
        if (allKeys.length > 0) {
          const firstKey = allKeys[0];
          const firstData = localStorage.getItem(firstKey);
          const firstUserData = JSON.parse(firstData);
          
          // Check if email matches
          if (firstUserData.email === authUser.email) {
            console.log('📦 Found matching registration data by email');
            userData = firstUserData;
            // Clean up the old key and store with correct user ID
            localStorage.removeItem(firstKey);
            localStorage.setItem(`registration_data_${authUser.id}`, firstData);
          }
        }
      }

      // If no registration data found, create a basic profile
      if (!userData) {
        console.log('📦 No registration data found, creating basic profile');
        userData = {
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          email: authUser.email,
          role: 'PUBLIC',
          phone: null,
          address: null,
          city: null
        };
      }

      console.log('📦 User data for profile creation:', userData);

      // Prepare address fields
      const fullAddress = userData.address || 
        (userData.addressLine1 ? 
          `${userData.addressLine1}${userData.addressLine2 ? ', ' + userData.addressLine2 : ''}, ${userData.city}` 
          : null);

      // Create the profile data object
      const profileData = {
        id: authUser.id,
        name: userData.name || authUser.email.split('@')[0],
        email: authUser.email,
        role: userData.role || 'PUBLIC',
        phone: userData.phone || null,
        status: (userData.role === 'PUBLIC' || !userData.role) ? 'active' : 'pending_approval',
        address: fullAddress,
        district: userData.district || 'Gampaha',
        area: userData.city || userData.area || null,
        default_pickup_address: fullAddress,
        // COLLECTOR fields
        experience: userData.experience || null,
        vehicle_type: userData.vehicleType || null,
        license_number: userData.licenseNumber || null,
        coverage_area: userData.coverageArea || null,
        availability: userData.availability || null,
        preferred_schedule: userData.preferredSchedule || null,
        additional_info: userData.additionalInfo || null,
        // RECYCLING_CENTER fields
        center_name: userData.centerName || null,
        operating_hours: userData.operatingHours || null,
        accepted_materials: userData.acceptedMaterials || null,
        capacity: userData.capacity || null
      };

      console.log('📦 Profile data to insert:', profileData);

      // Insert the profile
      const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log('✅ Profile created successfully:', insertedProfile);

      // Clean up registration data
      if (storedData) {
        localStorage.removeItem(`registration_data_${authUser.id}`);
        console.log('🧹 Cleaned up registration data from localStorage');
      }

      return insertedProfile;
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      throw error;
    }
  }, [supabase]);

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
        setMessage('Email confirmed successfully! Setting up your profile...');
        
        // Create user profile after successful email confirmation
        try {
          const profile = await createUserProfileAfterConfirmation(result.data.user);
          console.log('✅ User profile created:', profile);
          setMessage('Email confirmed and profile created successfully! You are now logged in.');
          
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
        } catch (profileError) {
          console.error('❌ Profile creation failed:', profileError);
          setMessage('Email confirmed successfully, but there was an issue creating your profile. Please try logging in.');
          
          setTimeout(() => {
            console.log('🔄 Redirecting to login due to profile creation failure...');
            if (navigate) {
              navigate('/login');
            } else {
              window.location.href = '/login';
            }
          }, 3000);
        }
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
  }, [hasProcessed, location.search, location.pathname, navigate, supabase.auth, createUserProfileAfterConfirmation]);

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