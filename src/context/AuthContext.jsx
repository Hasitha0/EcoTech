import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          if (mounted) {
            setError(error.message);
            setLoading(false);
          }
          return;
        }

        console.log('AuthContext: Initial session:', session?.user?.id);

        if (session?.user) {
          await handleUserSession(session.user);
        } else {
          console.log('AuthContext: No initial session found');
          if (mounted) {
            setLoading(false);
          }
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('AuthContext: Auth state changed:', event, session?.user?.id);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user && mounted) {
              await handleUserSession(session.user);
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              console.log('AuthContext: User signed out');
              setUser(null);
              setLoading(false);
              // Clear any incomplete registration data
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('registration_data_')) {
                  localStorage.removeItem(key);
                }
              });
            }
          }
        });

        // Fallback timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.log('AuthContext: Timeout reached, stopping loading');
            setLoading(false);
          }
        }, 15000); // Increased to 15 seconds for email confirmation flow

        return () => {
          subscription.unsubscribe();
          if (timeoutId) clearTimeout(timeoutId);
        };

      } catch (error) {
        console.error('AuthContext: Error in initializeAuth:', error);
        if (mounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, check if this is a newly confirmed user with registration data
        if (error.code === 'PGRST116') { // No rows returned
          console.log('No profile found for user:', userId);
          console.log('Checking for stored registration data...');
          
          // Check for registration data in localStorage
          const storedData = localStorage.getItem(`registration_data_${userId}`);
          
          if (storedData) {
            console.log('Found registration data, automatically creating profile...');
            try {
              const userData = JSON.parse(storedData);
              console.log('Registration data:', userData);
              
              // Get the current auth user to ensure they're confirmed
              const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
              
              if (authError) {
                console.error('Error getting auth user:', authError);
                setUser(null);
                setLoading(false);
                return;
              }
              
              if (authUser && authUser.email_confirmed_at) {
                console.log('User is confirmed, creating profile automatically...');
                
                // Create the profile using stored registration data
                const result = await createUserProfile(authUser, userData);
                
                if (result.user) {
                  console.log('Profile created automatically:', result.user);
                  
                  // Clean up the registration data
                  localStorage.removeItem(`registration_data_${userId}`);
                  
                  // Set the user in context
                  const userObject = { 
                    id: userId, 
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                    phone: result.user.phone,
                    address: result.user.address,
                    city: result.user.city,
                    status: result.user.status,
                    profile_picture_url: result.user.profile_picture_url,
                    profile: result.user 
                  };
                  
                  console.log('Setting automatically created user in context:', userObject);
                  setUser(userObject);
                  setLoading(false);
                  return;
                } else {
                  console.error('Profile creation returned no user');
                }
              } else {
                console.log('User email not confirmed yet, cannot create profile');
              }
            } catch (profileCreationError) {
              console.error('Error creating profile automatically:', profileCreationError);
              // Don't throw here, fall back to manual creation
            }
          } else {
            console.log('No registration data found for user:', userId);
            
            // Check if there are any registration data keys in localStorage
            const allKeys = Object.keys(localStorage).filter(key => key.startsWith('registration_data_'));
            console.log('Available registration data keys:', allKeys);
            
            // If we have registration data but not for this specific user,
            // it might be from a different session. Try to use the first available one.
            if (allKeys.length > 0) {
              console.log('Found registration data for different user ID, attempting to use it...');
              try {
                const firstKey = allKeys[0];
                const storedData = localStorage.getItem(firstKey);
                const userData = JSON.parse(storedData);
                
                // Verify the email matches
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser && userData.email === authUser.email && authUser.email_confirmed_at) {
                  console.log('Email matches, creating profile with cross-session data...');
                  
                  const result = await createUserProfile(authUser, userData);
                  
                  if (result.user) {
                    console.log('Profile created with cross-session data:', result.user);
                    
                    // Clean up all registration data
                    allKeys.forEach(key => localStorage.removeItem(key));
                    
                    // Set the user in context
                    const userObject = { 
                      id: userId, 
                      email: result.user.email,
                      name: result.user.name,
                      role: result.user.role,
                      phone: result.user.phone,
                      address: result.user.address,
                      city: result.user.city,
                      status: result.user.status,
                      profile_picture_url: result.user.profile_picture_url,
                      profile: result.user 
                    };
                    
                    console.log('Setting cross-session created user in context:', userObject);
                    setUser(userObject);
                    setLoading(false);
                    return;
                  }
                }
              } catch (crossSessionError) {
                console.error('Error with cross-session profile creation:', crossSessionError);
              }
            }
          }
        }
        
        // If we get here, profile doesn't exist and we couldn't create it automatically
        console.log('No profile found and automatic creation failed - setting user to null');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Profile fetched successfully:', profile);
      
      // Check account status before allowing login
      console.log('AuthContext: Account status:', profile.account_status);
      
      if (profile.account_status === 'deactivated') {
        // Sign out the user immediately
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated. Please contact support to reactivate your account.');
      }

      if (profile.account_status === 'deleted') {
        // Sign out the user immediately
        await supabase.auth.signOut();
        throw new Error('This account has been deleted and cannot be accessed.');
      }

      // Check user status before allowing login (temporarily disabled for debugging)
      console.log('AuthContext: User status:', profile.status);
      
      // For now, let's allow login regardless of status to test the basic flow
      // if (profile.status === 'pending_approval') {
      //   // Sign out the user immediately
      //   await supabase.auth.signOut();
      //   throw new Error('Your account is pending approval. Please wait for admin approval before logging in.');
      // }

      // if (profile.status === 'rejected') {
      //   // Sign out the user immediately
      //   await supabase.auth.signOut();
      //   throw new Error('Your account has been rejected. Please contact support for more information.');
      // }

      // if (profile.status !== 'active') {
      //   // Sign out the user immediately
      //   await supabase.auth.signOut();
      //   throw new Error('Your account is not active. Please contact support.');
      // }

      // Create proper user object with all necessary fields
      const userObject = { 
        id: userId, 
        email: profile.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        status: profile.status,
        account_status: profile.account_status, // Include account status
        profile_picture_url: profile.profile_picture_url,
        profile 
      };
      
      console.log('Setting user object in context:', userObject);
      setUser(userObject);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setLoading(false);
    }
  };

  // New function to handle user session consistently
  const handleUserSession = async (authUser) => {
    try {
      console.log('AuthContext: Handling user session for:', authUser.id);
      console.log('AuthContext: User email confirmed:', !!authUser.email_confirmed_at);
      
      await fetchUserProfile(authUser.id);
    } catch (error) {
      console.error('AuthContext: Error in handleUserSession:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthContext: Auth error:', error);
        throw error;
      }
      
      console.log('AuthContext: Auth successful, user ID:', data.user.id);
      
      // Fetch the user profile to get role information
      console.log('AuthContext: Fetching profile for user:', data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('AuthContext: Profile fetch error:', profileError);
        console.error('AuthContext: Profile error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        throw new Error('Failed to fetch user profile');
      }
      
      console.log('AuthContext: Profile fetched successfully:', profile);

      // Check account status before allowing login
      console.log('AuthContext: Account status:', profile.account_status);
      
      if (profile.account_status === 'deactivated') {
        // Sign out the user immediately
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated. Please contact support to reactivate your account.');
      }

      if (profile.account_status === 'deleted') {
        // Sign out the user immediately
        await supabase.auth.signOut();
        throw new Error('This account has been deleted and cannot be accessed.');
      }

      // Check user status before allowing login (temporarily disabled for debugging)
      console.log('AuthContext: User status:', profile.status);
      
      // For now, let's allow login regardless of status to test the basic flow
      // if (profile.status === 'pending_approval') {
      //   // Sign out the user immediately
      //   await supabase.auth.signOut();
      //   throw new Error('Your account is pending approval. Please wait for admin approval before logging in.');
      // }

      // if (profile.status === 'rejected') {
      //   // Sign out the user immediately
      //   await supabase.auth.signOut();
      //   throw new Error('Your account has been rejected. Please contact support for more information.');
      // }

      // if (profile.status !== 'active') {
      //   // Sign out the user immediately
      //   await supabase.auth.signOut();
      //   throw new Error('Your account is not active. Please contact support.');
      // }

      // Set the user in context (this will also be done by onAuthStateChange, but we need it immediately)
      setUser(profile);
      
      // Return the profile data with role information
      return { user: profile };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Starting registration for:', userData.email);
      
      // First, create the auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          // This ensures email confirmation is required
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      // Check if user was created successfully
      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('Auth user created:', authData.user.id);
      console.log('Email confirmation required:', !authData.user.email_confirmed_at);

      // If email confirmation is required, store registration data for later profile creation
      if (!authData.user.email_confirmed_at) {
        console.log('Email confirmation required - storing registration data for later profile creation');
        
        // Store registration data in localStorage to create profile after email confirmation
        localStorage.setItem(`registration_data_${authData.user.id}`, JSON.stringify(userData));
        
        return { 
          user: null, 
          needsEmailConfirmation: true,
          email: userData.email
        };
      }

      // If user is already confirmed (shouldn't happen in normal flow), create profile
      return await createUserProfile(authData.user, userData);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Separate function to create user profile - called after email confirmation
  const createUserProfile = async (authUser, userData) => {
    try {
      console.log('Creating profile for confirmed user:', authUser.id);
      console.log('User data for profile:', userData);
      
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
        console.log('Profile already exists:', existingProfile);
        return { user: existingProfile };
      }

      // Prepare address fields from registration form
      const fullAddress = userData.address || 
        (userData.addressLine1 ? 
          `${userData.addressLine1}${userData.addressLine2 ? ', ' + userData.addressLine2 : ''}, ${userData.city}` 
          : null);

      // Create the profile data object with proper null handling
      const profileData = {
        id: authUser.id,
        name: userData.name || null,
        email: userData.email || authUser.email,
        role: userData.role || 'PUBLIC',
        phone: userData.phone || null,
        status: userData.role === 'PUBLIC' ? 'active' : 'pending_approval',
        // Address fields from registration form
        address: fullAddress,
        district: userData.district || 'Gampaha', // All cities in the form are from Gampaha district
        area: userData.city || userData.area || null, // The selected city becomes the area
        default_pickup_address: fullAddress, // Same as main address initially
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

      console.log('Profile data to insert:', profileData);

      // Try direct INSERT first
      const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        console.error('Profile error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        
        // If it's a constraint violation, try to provide more specific error
        if (profileError.code === '23505') {
          throw new Error('A profile with this email already exists. Please try logging in instead.');
        } else if (profileError.code === '23503') {
          throw new Error('Database constraint violation. Please check your input data.');
        } else {
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }
      }

      console.log('Profile created successfully:', insertedProfile);

      // For recycling centers, create center record as well
      if (userData.role === 'RECYCLING_CENTER' && userData.centerName) {
        console.log('Creating recycling center record...');
        const { error: centerError } = await supabase
          .from('recycling_centers')
          .insert([{
            name: userData.centerName,
            address: userData.address || fullAddress,
            phone: userData.phone,
            email: userData.email || authUser.email,
            hours: userData.operatingHours,
            materials: userData.acceptedMaterials,
            status: 'pending_approval',
            user_id: authUser.id
          }]);

        if (centerError) {
          console.error('Center creation error:', centerError);
          // Don't throw here - profile was created successfully, center creation is secondary
          console.warn('Profile created but recycling center creation failed:', centerError.message);
        } else {
          console.log('Recycling center created successfully');
        }
      }

      return { user: insertedProfile };
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  const refreshUser = async () => {
    try {
      console.log('RefreshUser called - checking current session...');
      
      // First check if there's a current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session in refreshUser:', error);
        return;
      }
      
      if (session?.user) {
        console.log('Found session in refreshUser, handling user session...');
        await handleUserSession(session.user);
      } else if (user?.id) {
        console.log('No session but user exists, fetching profile...');
        await fetchUserProfile(user.id);
      } else {
        console.log('No session and no user in refreshUser');
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
    }
  };

  // Function to manually trigger profile creation (useful for debugging or edge cases)
  const triggerProfileCreation = async (userData) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const result = await createUserProfile(authUser, userData);
        
        // Immediately update the user context with the created profile
        if (result.user) {
          console.log('Setting user in context after profile creation:', result.user);
          setUser(result.user);
          setLoading(false);
        }
        
        return result;
      }
      throw new Error('No authenticated user found');
    } catch (error) {
      console.error('Error in manual profile creation:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && !!user.role,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    triggerProfileCreation,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
