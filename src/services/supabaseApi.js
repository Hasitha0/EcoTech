import { supabase } from '../lib/supabase.js';

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export const authService = {
  // Sign up a new user
  async signUp(email, password, userData) {
    try {
      console.log('AuthContext: Signing up user...', email);
      
      // Sign up with Supabase Auth
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
        console.error('AuthContext: Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('AuthContext: Auth signup successful:', authData.user.id);

      // Create profile using the database function
      const { data: profileData, error: profileError } = await supabase
        .rpc('create_user_profile', {
          user_id: authData.user.id,
          user_name: userData.name,
          user_email: email,
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

      if (profileError) {
        console.error('AuthContext: Profile creation error:', profileError);
        throw profileError;
      }

      console.log('AuthContext: Profile created successfully');

      return { user: authData.user, profile: profileData };
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      console.log('AuthContext: Starting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthContext: Auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      console.log('AuthContext: Auth successful, fetching profile...');

      // Fetch user profile
      const profile = await this.getProfile(data.user.id);
      
      return { user: data.user, profile };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('AuthContext: Profile fetch error:', error);
      throw error;
    }

    return data;
  },

  // Update profile
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Change password
  async changePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  // Upload profile picture
  async uploadProfilePicture(userId, file) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const profilePictureUrl = urlData.publicUrl;

      // Update user profile with new picture URL
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: profilePictureUrl })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        profilePictureUrl,
        profile: profileData
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  // Delete profile picture
  async deleteProfilePicture(userId) {
    try {
      // Get current profile to find existing picture
      const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('id', userId)
        .single();

      if (getError) throw getError;

      // Delete from storage if exists
      if (profile.profile_picture_url) {
        const filePath = profile.profile_picture_url.split('/').pop();
        const { error: deleteError } = await supabase.storage
          .from('profiles')
          .remove([`profile-pictures/${filePath}`]);

        if (deleteError) {
          console.warn('Error deleting file from storage:', deleteError);
        }
      }

      // Update profile to remove picture URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  },

  // Check authentication state
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================================================
// COLLECTION REQUEST SERVICES
// ============================================================================

export const collectionService = {
  // Create a new collection request
  async createRequest(requestData) {
    const { data, error } = await supabase
      .from('collection_requests')
      .insert([requestData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get collection requests for a user
  async getUserRequests(userId) {
    const { data, error } = await supabase
      .from('collection_requests')
      .select(`
        *,
        collector:profiles!fk_collection_requests_collector_id(*),
        recycling_center:recycling_centers!collection_requests_recycling_center_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user requests:', error);
      // If the complex query fails, try a simpler one
      const { data: simpleData, error: simpleError } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (simpleError) throw simpleError;
      return simpleData;
    }
    return data;
  },

  // Get collection requests for a collector
  async getCollectorRequests(collectorId) {
    const { data, error } = await supabase
      .from('collection_requests')
      .select(`
        *,
        user:profiles!fk_collection_requests_user_id(*),
        recycling_center:recycling_centers!collection_requests_recycling_center_id_fkey(*)
      `)
      .eq('collector_id', collectorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all collection requests (admin)
  async getAllRequests() {
    const { data, error } = await supabase
      .from('collection_requests')
      .select(`
        *,
        user:profiles!collection_requests_user_id_fkey(*),
        collector:profiles!collection_requests_collector_id_fkey(*),
        recycling_center:recycling_centers(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update collection request
  async updateRequest(requestId, updates) {
    const { data, error } = await supabase
      .from('collection_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Assign collector to request
  async assignCollector(requestId, collectorId) {
    return this.updateRequest(requestId, { 
      collector_id: collectorId,
      status: 'assigned'
    });
  }
};

// ============================================================================
// RECYCLING CENTER SERVICES
// ============================================================================

export const recyclingCenterService = {
  // Get all recycling centers
  async getAllCenters() {
    const { data, error } = await supabase
      .from('recycling_centers')
      .select('*')
      .eq('status', 'approved')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get recycling center by ID
  async getCenterById(centerId) {
    const { data, error } = await supabase
      .from('recycling_centers')
      .select('*')
      .eq('id', centerId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create recycling center
  async createCenter(centerData) {
    const { data, error } = await supabase
      .from('recycling_centers')
      .insert([centerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update recycling center
  async updateCenter(centerId, updates) {
    const { data, error } = await supabase
      .from('recycling_centers')
      .update(updates)
      .eq('id', centerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// USER MANAGEMENT SERVICES
// ============================================================================

export const userService = {
  // Get all users (admin)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get users by role
  async getUsersByRole(role) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get collectors
  async getCollectors() {
    return this.getUsersByRole('collector');
  },

  // Get active collectors
  async getActiveCollectors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'collector')
      .eq('status', 'active')
      .eq('collector_status', 'active')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Update user status
  async updateUserStatus(userId, status) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deactivate account
  async deactivateAccount(userId) {
    return this.updateUserStatus(userId, 'deactivated');
  },

  // Reactivate account
  async reactivateAccount(userId) {
    return this.updateUserStatus(userId, 'active');
  },

  // Get deactivated accounts
  async getDeactivatedAccounts() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('account_status', 'deactivated')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Delete account permanently
  async deleteAccount(userId) {
    try {
      // First, mark account as deleted
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ 
          account_status: 'deleted',
          status: 'deleted',
          email: `deleted_${userId}@deleted.local`, // Anonymize email
          name: 'Deleted User',
          phone: null,
          address: null,
          profile_picture_url: null
        })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) throw profileError;

      // Delete profile picture from storage if exists
      if (profileData.profile_picture_url) {
        try {
          const filePath = profileData.profile_picture_url.split('/').pop();
          await supabase.storage
            .from('profiles')
            .remove([`profile-pictures/${filePath}`]);
        } catch (storageError) {
          console.warn('Error deleting profile picture from storage:', storageError);
        }
      }

      // Cancel any pending collection requests
      await supabase
        .from('collection_requests')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed']);

      // Note: We don't actually delete the user record for data integrity
      // and audit purposes. Instead, we mark it as deleted and anonymize sensitive data.

      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
};

// ============================================================================
// DELIVERY SERVICES
// ============================================================================

export const deliveryService = {
  // Create delivery
  async createDelivery(deliveryData) {
    const { data, error } = await supabase
      .from('deliveries')
      .insert([deliveryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get deliveries for collector
  async getCollectorDeliveries(collectorId) {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        collection_request:collection_requests(*),
        recycling_center:recycling_centers(*)
      `)
      .eq('collector_id', collectorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update delivery status
  async updateDeliveryStatus(deliveryId, status, additionalData = {}) {
    const updates = { status, ...additionalData };
    
    // Add timestamp based on status
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    } else if (status === 'received') {
      updates.received_at = new Date().toISOString();
    } else if (status === 'processed') {
      updates.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SUPPORT SERVICES
// ============================================================================

export const supportService = {
  // Submit support request
  async submitSupportRequest(requestData) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([requestData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get support requests
  async getSupportRequests() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update support ticket
  async updateSupportTicket(ticketId, updates) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Respond to support ticket
  async respondToTicket(ticketId, response) {
    return this.updateSupportTicket(ticketId, {
      admin_response: response,
      status: 'resolved',
      responded_at: new Date().toISOString()
    });
  }
};

// ============================================================================
// FEEDBACK SERVICES
// ============================================================================

export const feedbackService = {
  // Submit feedback
  async submitFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all feedback (admin)
  async getAllFeedback() {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        user:profiles(*),
        collection_request:collection_requests(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update feedback status
  async updateFeedbackStatus(feedbackId, status, adminResponse = null) {
    const updates = { status };
    if (adminResponse) {
      updates.admin_response = adminResponse;
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updates)
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// ANALYTICS SERVICES
// ============================================================================

export const analyticsService = {
  // Get collection statistics
  async getCollectionStats() {
    const { data, error } = await supabase
      .from('collection_requests')
      .select('status, created_at, item_types, estimated_weight');

    if (error) throw error;

    // Process the data to create statistics
    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      completed: data.filter(r => r.status === 'completed').length,
      in_progress: data.filter(r => ['assigned', 'collected', 'delivered'].includes(r.status)).length,
      monthly: {}
    };

    // Group by month
    data.forEach(request => {
      const month = new Date(request.created_at).toISOString().slice(0, 7);
      if (!stats.monthly[month]) {
        stats.monthly[month] = 0;
      }
      stats.monthly[month]++;
    });

    return stats;
  },

  // Get user statistics
  async getUserStats() {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, status, created_at');

    if (error) throw error;

    return {
      total: data.length,
      users: data.filter(u => u.role === 'user').length,
      collectors: data.filter(u => u.role === 'collector').length,
      recycling_centers: data.filter(u => u.role === 'recycling_center').length,
      admins: data.filter(u => u.role === 'admin').length,
      active: data.filter(u => u.status === 'active').length,
      inactive: data.filter(u => u.status !== 'active').length
    };
  },

  // Get center statistics
  async getCenterStats(centerId = null) {
    let query = supabase
      .from('center_stats')
      .select('*');

    if (centerId) {
      query = query.eq('center_id', centerId);
    }

    const { data, error } = await query.order('month', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// MATERIAL TYPES SERVICES
// ============================================================================

export const materialService = {
  // Get all material types
  async getAllMaterials() {
    const { data, error } = await supabase
      .from('material_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Create material type
  async createMaterial(materialData) {
    const { data, error } = await supabase
      .from('material_types')
      .insert([materialData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update material type
  async updateMaterial(materialId, updates) {
    const { data, error } = await supabase
      .from('material_types')
      .update(updates)
      .eq('id', materialId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// ACHIEVEMENTS SERVICES
// ============================================================================

export const achievementService = {
  // Get all achievements
  async getAllAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user achievements
  async getUserAchievements(userId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Award achievement to user
  async awardAchievement(userId, achievementId, progress = null) {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId,
        progress
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export default {
  auth: authService,
  collection: collectionService,
  recyclingCenter: recyclingCenterService,
  user: userService,
  delivery: deliveryService,
  support: supportService,
  feedback: feedbackService,
  analytics: analyticsService,
  material: materialService,
  achievement: achievementService
}; 