import { supabase } from '../lib/supabase.js';

// Enhanced authentication service with fallbacks and better error handling
export class AuthService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Utility method to retry operations
  async retryOperation(operation, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        console.warn(`Operation attempt ${i + 1} failed:`, error.message);
        
        if (i === attempts - 1) {
          throw error; // Last attempt, throw the error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  // Test connection to Supabase
  async testConnection() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase connection test failed:', error);
        return { connected: false, error: error.message };
      }
      
      console.log('Supabase connection test successful');
      return { connected: true, session: data.session };
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return { connected: false, error: error.message };
    }
  }

  // Sign up with retry logic
  async signUp(email, password, userData) {
    return this.retryOperation(async () => {
      console.log('AuthService: Attempting signup for:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('AuthService: Signup error:', authError);
        throw new Error(`Signup failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('AuthService: Signup successful:', authData.user.id);
      return { user: authData.user, session: authData.session };
    });
  }

  // Sign in with retry logic
  async signIn(email, password) {
    return this.retryOperation(async () => {
      console.log('AuthService: Attempting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthService: Signin error:', error);
        throw new Error(`Signin failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('No user returned from signin');
      }

      console.log('AuthService: Signin successful:', data.user.id);
      return { user: data.user, session: data.session };
    });
  }

  // Sign out with retry logic
  async signOut() {
    return this.retryOperation(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(`Signout failed: ${error.message}`);
      }
      console.log('AuthService: Signout successful');
    });
  }

  // Get current user with retry logic
  async getCurrentUser() {
    return this.retryOperation(async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        throw new Error(`Get user failed: ${error.message}`);
      }
      return user;
    });
  }

  // Get current session with retry logic
  async getCurrentSession() {
    return this.retryOperation(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw new Error(`Get session failed: ${error.message}`);
      }
      return session;
    });
  }

  // Get user profile with retry logic
  async getUserProfile(userId) {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthService: Profile fetch error:', error);
        throw new Error(`Profile fetch failed: ${error.message}`);
      }

      return data;
    });
  }

  // Create user profile with retry logic
  async createUserProfile(userId, userData) {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .rpc('create_user_profile', {
          user_id: userId,
          user_name: userData.name,
          user_email: userData.email,
          user_role: userData.role,
          user_phone: userData.phone || null,
          address: userData.address || null,
          district: userData.district || null,
          area: userData.area || null,
          default_pickup_address: userData.defaultPickupAddress || null,
          experience: userData.experience || null,
          vehicle_type: userData.vehicleType || null,
          license_number: userData.licenseNumber || null,
          coverage_area: userData.coverageArea || null,
          availability: userData.availability || null,
          preferred_schedule: userData.preferredSchedule || null,
          additional_info: userData.additionalInfo || null,
          center_name: userData.centerName || null,
          operating_hours: userData.operatingHours || null,
          accepted_materials: userData.acceptedMaterials || null,
          capacity: userData.capacity || null
        });

      if (error) {
        console.error('AuthService: Profile creation error:', error);
        throw new Error(`Profile creation failed: ${error.message}`);
      }

      console.log('AuthService: Profile created successfully');
      return data;
    });
  }

  // Update user profile with retry logic
  async updateUserProfile(userId, updates) {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }

      return data;
    });
  }

  // Set up auth state change listener
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Health check method
  async healthCheck() {
    try {
      console.log('AuthService: Running health check...');
      
      // Test basic connectivity
      const connectionTest = await this.testConnection();
      if (!connectionTest.connected) {
        return {
          healthy: false,
          error: 'Connection failed',
          details: connectionTest.error
        };
      }

      // Test database access
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count(*)')
          .limit(1);

        if (error) {
          return {
            healthy: false,
            error: 'Database access failed',
            details: error.message
          };
        }

        return {
          healthy: true,
          message: 'All systems operational'
        };
      } catch (dbError) {
        return {
          healthy: false,
          error: 'Database query failed',
          details: dbError.message
        };
      }
    } catch (error) {
      return {
        healthy: false,
        error: 'Health check failed',
        details: error.message
      };
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export default
export default authService;

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.authService = authService;
} 