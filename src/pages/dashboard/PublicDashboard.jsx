import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supabaseApi from '../../services/supabaseApi';
import { MagicCard } from '../../components/ui/magic-card';
import { ShimmerButton } from '../../components/ui/shimmer-button';
import { AnimatedGradientText } from '../../components/ui/animated-gradient-text';
import RequestPickupForm from '../../components/RequestPickupForm';
import { 
  Home, 
  User, 
  Package, 
  BarChart3, 
  Settings, 
  Bell, 
  MessageSquare,
  CheckCircle,
  Clock,
  Truck,
  Recycle,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit3
} from 'lucide-react';

const PublicDashboard = () => {
  const { user, logout, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    navigate('/');
  };

  const [activeTab, setActiveTab] = useState('profile');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [userStats, setUserStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    totalWeight: 0,
    co2Saved: 0
  });
  
  // New state for enhanced features
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    district: '',
    area: '',
    defaultPickupAddress: '',
    dateOfBirth: '',
    bio: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Additional state for missing database fetches
  const [notifications, setNotifications] = useState([]);
  const [userSupportTickets, setUserSupportTickets] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [userFeedbackHistory, setUserFeedbackHistory] = useState([]);
  const [recyclingCenters, setRecyclingCenters] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000); // Hide after 5 seconds
  };

  // Profile completion calculation
  const calculateProfileCompletion = () => {
    let completion = 0;
    const fields = [
      profileData.name || user?.name,
      user?.email,
      profileData.phone || user?.phone,
      profileData.defaultPickupAddress || user?.address,
      userStats.totalRequests > 0
    ];
    
    fields.forEach(field => {
      if (field) completion += 20;
    });
    
    return completion;
  };

    // Load user's collection requests
    const loadRequests = async () => {
      try {
        setLoading(true);
        const requests = await supabaseApi.collection.getUserRequests(user?.id);
        setRequests(requests || []);
        
        // Calculate user stats
        const completed = (requests || []).filter(req => req.status === 'completed');
        const totalWeight = completed.reduce((sum, req) => sum + (parseFloat(req.actualWeight) || parseFloat(req.estimatedWeight) || 0), 0);
        
        setUserStats({
          totalRequests: (requests || []).length,
          completedRequests: completed.length,
          totalWeight: totalWeight,
        co2Saved: totalWeight * 0.5
        });
      } catch (err) {
        setError('Failed to load your requests');
        console.error('Error loading requests:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user?.id) {
      loadRequests();
      loadAchievements();
      loadEnhancedProfile();
      loadUserSupportTickets();
      loadMaterialTypes();
      loadUserFeedbackHistory();
      loadRecyclingCenters();
    }
  }, [user?.id]);

  // Load notifications after requests are loaded
  useEffect(() => {
    if (user?.id && requests.length >= 0) {
      loadNotifications();
    }
  }, [user?.id, requests.length]);

    // Initialize empty arrays if data is not loaded yet
  const safeRequests = requests || [];
  const safeAchievements = achievements || [];
  const safeAllAchievements = allAchievements || [];

  // Show loading state while user data is being fetched
  if (!user && loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Load user achievements
  const loadAchievements = async () => {
    try {
      const [userAchievements, allAchievements] = await Promise.all([
          supabaseApi.achievement.getUserAchievements(user?.id),
          supabaseApi.achievement.getAllAchievements()
        ]);
      setAchievements(userAchievements || []);
      setAllAchievements(allAchievements || []);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setAchievements([]);
      setAllAchievements([]);
    }
  };

    // Load enhanced profile data
  const loadEnhancedProfile = async () => {
    try {
      const profile = await supabaseApi.auth.getProfile(user?.id);
      
      if (profile) {
        setProfileData({
          name: profile.name || '',
          phone: profile.phone || '',
          district: profile.district || '',
          area: profile.area || '',
          defaultPickupAddress: profile.default_pickup_address || '',
          dateOfBirth: profile.date_of_birth || '',
          bio: profile.bio || ''
        });
      } else {
        // Initialize with basic user data if no profile found
        setProfileData({
          name: user?.name || '',
          phone: user?.phone || '',
          district: '',
          area: '',
          defaultPickupAddress: user?.address || '',
          dateOfBirth: '',
          bio: ''
        });
      }
    } catch (err) {
      console.error('Error loading enhanced profile:', err);
      // Initialize with basic user data if enhanced profile fails
      setProfileData({
        name: user?.name || '',
        phone: user?.phone || '',
        district: '',
        area: '',
        defaultPickupAddress: user?.address || '',
        dateOfBirth: '',
        bio: ''
      });
    }
  };

  // Load user notifications from database
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      // Generate notifications based on user's collection requests
      const userRequests = requests || [];
      const generatedNotifications = [];
      
      // Add notifications for recent request status changes
      userRequests.slice(0, 5).forEach((request, index) => {
        if (request.status === 'completed') {
          generatedNotifications.push({
            id: `notif-${request.id}-completed`,
            type: 'success',
            icon: 'CheckCircle',
            title: 'Request Completed',
            message: `Your pickup request #${request.id.slice(0, 8)} has been successfully completed.`,
            timestamp: request.updated_at || request.created_at,
            read: false
          });
        } else if (request.status === 'scheduled') {
          generatedNotifications.push({
            id: `notif-${request.id}-scheduled`,
            type: 'info',
            icon: 'Truck',
            title: 'Pickup Scheduled',
            message: `Your collector will arrive ${request.scheduled_date ? `on ${request.scheduled_date}` : 'soon'} for request #${request.id.slice(0, 8)}.`,
            timestamp: request.updated_at || request.created_at,
            read: false
          });
        } else if (request.status === 'pending') {
          generatedNotifications.push({
            id: `notif-${request.id}-pending`,
            type: 'warning',
            icon: 'Bell',
            title: 'Request Pending',
            message: `Your pickup request #${request.id.slice(0, 8)} is awaiting collector assignment.`,
            timestamp: request.created_at,
            read: Math.random() > 0.5 // Randomly mark some as read
          });
        }
      });

      // Add profile completion notification if needed
      const profileCompletion = calculateProfileCompletion();
      if (profileCompletion < 80) {
        generatedNotifications.unshift({
          id: 'notif-profile-incomplete',
          type: 'warning',
          icon: 'Bell',
          title: 'Profile Incomplete',
          message: `Complete your profile to improve service quality. Currently ${profileCompletion}% complete.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      // Sort by timestamp (newest first)
      generatedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setNotifications(generatedNotifications.slice(0, 10)); // Keep only 10 most recent
    } catch (err) {
      console.error('Error loading notifications:', err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Load user's support tickets
  const loadUserSupportTickets = async () => {
    try {
      const tickets = await supabaseApi.support.getSupportRequests();
      // Filter tickets for current user
      const userTickets = (tickets || []).filter(ticket => 
        ticket.email === user?.email || ticket.user_id === user?.id
      );
      setUserSupportTickets(userTickets);
    } catch (err) {
      console.error('Error loading user support tickets:', err);
      setUserSupportTickets([]);
    }
  };

  // Load material types for better display
  const loadMaterialTypes = async () => {
    try {
      const materials = await supabaseApi.material.getAllMaterials();
      setMaterialTypes(materials || []);
    } catch (err) {
      console.error('Error loading material types:', err);
      setMaterialTypes([]);
    }
  };

  // Load user's feedback history
  const loadUserFeedbackHistory = async () => {
    try {
      const feedback = await supabaseApi.feedback.getAllFeedback();
      // Filter feedback for current user
      const userFeedback = (feedback || []).filter(fb => fb.user_id === user?.id);
      setUserFeedbackHistory(userFeedback);
    } catch (err) {
      console.error('Error loading user feedback history:', err);
      setUserFeedbackHistory([]);
    }
  };

  // Load recycling centers for analytics
  const loadRecyclingCenters = async () => {
    try {
      const centers = await supabaseApi.recyclingCenter.getAllCenters();
      setRecyclingCenters(centers || []);
    } catch (err) {
      console.error('Error loading recycling centers:', err);
      setRecyclingCenters([]);
    }
  };

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      section: 'General'
    },
    {
      id: 'requests',
      label: 'My Requests',
      icon: Package,
      section: 'General',
      badge: safeRequests.length
    },
    {
      id: 'analytics',
      label: 'Impact Analytics',
      icon: BarChart3,
      section: 'General'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      section: 'General',
      badge: safeAchievements.length
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      section: 'Support',
      badge: notifications.filter(n => !n.read).length || 0
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      section: 'Support'
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: Settings,
      section: 'Support'
    }
  ];

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      'assigned': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      'scheduled': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      'in_progress': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      'collected': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
      'delivered': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      'completed': 'text-green-400 bg-green-400/10 border-green-400/20',
      'cancelled': 'text-red-400 bg-red-400/10 border-red-400/20',
      'failed': 'text-red-400 bg-red-400/10 border-red-400/20'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending Assignment',
      'assigned': 'Assigned to Collector',
      'scheduled': 'Pickup Scheduled',
      'in_progress': 'Collection in Progress',
      'collected': 'Items Collected',
      'delivered': 'Delivered to Center',
      'completed': 'Processing Complete',
      'cancelled': 'Cancelled',
      'failed': 'Pickup Failed'
    };
    return statusMap[status] || status;
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (requestId) => {
    try {
      const feedbackData = {
        userId: user?.id,
        rating: feedback[requestId]?.rating || 5,
        comment: feedback[requestId]?.comment || '',
        feedbackType: 'collection',
        subject: 'Collection Request Feedback',
        message: feedback[requestId]?.comment || '',
        collectionRequestId: requestId
      };

              await supabaseApi.feedback.submitFeedback(feedbackData);
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, feedbackSubmitted: true }
          : req
      ));
      
      setShowFeedbackForm(false);
      setSelectedRequest(null);
      setFeedback(prev => ({ ...prev, [requestId]: {} }));
      
      // Show success message
      showToast('Feedback submitted successfully!');
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(`Failed to submit feedback: ${err.message}`);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (file) => {
    try {
      setUploading(true);
      setError(''); // Clear any previous errors
      
      console.log('Starting profile picture upload for user:', user?.id);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      const response = await supabaseApi.auth.uploadProfilePicture(user?.id, file);
      
      console.log('Upload response:', response);
      
      // Update the user context with new profile picture URL
      updateUser({ profile_picture_url: response.profilePictureUrl });
      
      // Refresh profile data
      await loadEnhancedProfile();
      setProfilePictureFile(null);
      
      // Show success message
      showToast('Profile picture updated successfully!');
      
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        userId: user?.id,
        fileName: file?.name
      });
      setError(`Failed to upload profile picture: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedData) => {
    try {
      setError(''); // Clear any previous errors
      
              await supabaseApi.auth.updateProfile(user?.id, updatedData);
      setProfileData(updatedData);
      
      // Update user context with new data
      updateUser({
        name: updatedData.name,
        phone: updatedData.phone,
        district: updatedData.district,
        area: updatedData.area,
        default_pickup_address: updatedData.defaultPickupAddress,
        date_of_birth: updatedData.dateOfBirth,
        bio: updatedData.bio
      });
      
      // Check for new achievements
              // Note: Achievement checking functionality needs to be implemented
        console.log('Achievement checking not yet implemented');
      if (result?.newAchievements?.length > 0) {
        await loadAchievements();
        console.log('New achievements earned!', result.newAchievements);
      }
      
      // Show success feedback
      console.log('Profile updated successfully');
      
      // Optionally show a success message
      showToast('Profile updated successfully!');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message}`);
    }
  };

  // Handle password change
  const handlePasswordChange = async (newPassword) => {
    try {
      setError(''); // Clear any previous errors
      
      await supabaseApi.auth.changePassword(newPassword);
      setShowChangePassword(false);
      
      // Show success message
      showToast('Password changed successfully!');
      
    } catch (err) {
      console.error('Error changing password:', err);
      setError(`Failed to change password: ${err.message}`);
    }
  };

  // Handle account deactivation
  const handleDeactivateAccount = async () => {
    // Enhanced confirmation dialog
    const confirmed = window.confirm(
      '⚠️ Deactivate Account\n\n' +
      'Are you sure you want to deactivate your account?\n\n' +
      '• Your account will be temporarily disabled\n' +
      '• You can reactivate it by contacting support\n' +
      '• Your data will be preserved\n' +
      '• Pending collection requests will remain active\n\n' +
      'Click OK to proceed or Cancel to abort.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');
      
      console.log('Deactivating account for user:', user?.id);
              const result = await supabaseApi.user.deactivateAccount(user?.id);
      
      if (result.success) {
        // Show success message
        showToast('Account deactivated successfully!');

        // Logout and redirect after a short delay
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Error deactivating account:', err);
      setError(`Failed to deactivate account: ${err.message}`);
      
      // Show error notification
      showToast('Failed to deactivate account. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Enhanced confirmation dialog with double confirmation
    const firstConfirm = window.confirm(
      '🚨 PERMANENT ACCOUNT DELETION\n\n' +
      'This action CANNOT be undone!\n\n' +
      '• Your account will be permanently deleted\n' +
      '• All personal data will be removed\n' +
      '• Pending requests will be cancelled\n' +
      '• You cannot recover your account\n\n' +
      'Are you absolutely sure you want to continue?'
    );

    if (!firstConfirm) return;

    // Second confirmation for critical action
    const secondConfirm = window.confirm(
      '⚠️ FINAL CONFIRMATION\n\n' +
      'Type your email to confirm deletion:\n' +
      'Expected: ' + user?.email + '\n\n' +
      'This is your last chance to cancel.\n' +
      'Click OK only if you are 100% certain.'
    );

    if (!secondConfirm) return;

    // Optional: Ask for email confirmation (simplified for now)
    const emailConfirm = prompt(
      'Please type your email address to confirm account deletion:\n\n' +
      'Expected: ' + user?.email
    );

    if (emailConfirm !== user?.email) {
      alert('Email confirmation failed. Account deletion cancelled for your security.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Deleting account for user:', user?.id);
      const result = await supabaseApi.user.deleteAccount(user?.id);
      
      if (result.success) {
        // Show success message
        showToast('Account deleted successfully!');

        // Logout and redirect after a short delay
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(`Failed to delete account: ${err.message}`);
      
      // Show error notification
      showToast('Failed to delete account. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Profile Tab Component
  const ProfileTab = () => {
    const profileCompletion = calculateProfileCompletion();
    
    return (
    <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Form */}
          <div className="lg:col-span-2">
        <MagicCard className="p-6">
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-700">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {user?.profile_picture_url ? (
                      <img 
                        src={user.profile_picture_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex items-center justify-center ${user?.profile_picture_url ? 'hidden' : 'flex'}`}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <label className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                    <Edit3 className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setError('File size must be less than 5MB');
                            return;
                          }
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            setError('Please select a valid image file');
                            return;
                          }
                          handleProfilePictureUpload(file);
                        }
                      }}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
                  <p className="text-emerald-400">{user?.email}</p>
                  <p className="text-gray-400 text-sm">
                    {achievements.length} achievements • {userStats.totalRequests} requests
                  </p>
                  {uploading && (
                    <p className="text-yellow-400 text-sm mt-1">Uploading profile picture...</p>
                  )}
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleProfileUpdate(profileData);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 placeholder-gray-400 cursor-not-allowed"
                      placeholder="Enter email"
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed from this form</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Contact number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-gray-700/50 border border-r-0 border-gray-600 rounded-l-lg text-gray-300 text-sm">
                        🇱🇰
                      </span>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-r-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="071 234 5678"
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">District</label>
                    <select
                      value={profileData.district}
                      onChange={(e) => setProfileData(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select District</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Matale">Matale</option>
                      <option value="Nuwara Eliya">Nuwara Eliya</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Hambantota">Hambantota</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kilinochchi">Kilinochchi</option>
                      <option value="Mannar">Mannar</option>
                      <option value="Vavuniya">Vavuniya</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Batticaloa">Batticaloa</option>
                      <option value="Ampara">Ampara</option>
                      <option value="Trincomalee">Trincomalee</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Puttalam">Puttalam</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Badulla">Badulla</option>
                      <option value="Moneragala">Moneragala</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Kegalle">Kegalle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Area/City</label>
                    <input
                      type="text"
                      value={profileData.area}
                      onChange={(e) => setProfileData(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Enter your area or city"
                    />
                  </div>

                  {/* Address Section - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Pickup Address</label>
                    <textarea
                      rows={2}
                      value={profileData.defaultPickupAddress}
                      onChange={(e) => setProfileData(prev => ({ ...prev, defaultPickupAddress: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Enter your default pickup address for e-waste collection..."
                    />
                  </div>

                  {/* About Section - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio (Optional)</label>
                    <textarea
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Tell us about your interest in e-waste recycling and environmental sustainability..."
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
                  </div>

                  {/* Save Button - Full Width */}
                  <div className="md:col-span-2 flex justify-end mt-6">
                    <ShimmerButton type="submit" className="px-8" disabled={uploading}>
                      {uploading ? 'Saving...' : 'Save Profile'}
          </ShimmerButton>
                  </div>
                </div>
              </form>
        </MagicCard>
          </div>

          {/* Profile Completion Sidebar */}
          <div className="space-y-6">
        <MagicCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Completed</h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-emerald-400 mb-2">{profileCompletion}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
          </div>
      </div>

              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${user?.name ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-800/50 border border-gray-600/50'}`}>
                  <span className="text-sm text-gray-300">Upload profile info</span>
                  {user?.name ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
          </div>

                <div className={`flex items-center justify-between p-3 rounded-lg ${user?.email ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-800/50 border border-gray-600/50'}`}>
                  <span className="text-sm text-gray-300">Verify email address</span>
                  {user?.email ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
          </div>

                <div className={`flex items-center justify-between p-3 rounded-lg ${user?.phone ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-800/50 border border-gray-600/50'}`}>
                  <span className="text-sm text-gray-300">Add phone number</span>
                  {user?.phone ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg ${userStats.totalRequests > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-800/50 border border-gray-600/50'}`}>
                  <span className="text-sm text-gray-300">Complete first request</span>
                  {userStats.totalRequests > 0 ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
              </div>
              </div>
            </MagicCard>

            {/* Quick Actions */}
            <MagicCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <ShimmerButton 
                  onClick={() => setShowRequestForm(true)}
                  className="w-full"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Schedule Pickup
                </ShimmerButton>
                
              <button 
                onClick={() => setActiveTab('requests')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300"
              >
                  <Truck className="h-4 w-4 mr-2" />
                  Track Requests
              </button>

                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </button>
          </div>
      </MagicCard>
          </div>
        </div>
    </div>
  );
  };

  // Requests Tab Component (simplified for space)
  const RequestsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">My Collection Requests</h2>
        <ShimmerButton onClick={() => setShowRequestForm(true)}>
          <Package className="h-4 w-4 mr-2" />
          New Request
        </ShimmerButton>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <MagicCard className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No requests yet</h3>
          <p className="text-gray-400 mb-6">Start your e-waste recycling journey by creating your first pickup request.</p>
          <ShimmerButton onClick={() => setShowRequestForm(true)}>
            Create Your First Request
          </ShimmerButton>
        </MagicCard>
      ) : (
        <div className="grid gap-6">
          {requests.map(request => (
            <MagicCard key={request.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Request #{request.id}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                    {formatStatus(request.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="text-white">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Items
                  </h5>
                  <div className="space-y-1">
                    {request.itemTypes?.length > 0 ? request.itemTypes.map(item => (
                      <span key={item} className="inline-block bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs mr-2 mb-1 border border-emerald-500/30">
                        {item}
                      </span>
                    )) : (
                      <span className="text-gray-400 text-sm">No items specified</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mt-2">{request.quantities}</p>
                </div>

                <div>
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Pickup Details
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300 flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      {request.preferredDate || 'Not specified'}
                    </p>
                    <p className="text-gray-300 flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      {request.preferredTime || 'Not specified'}
                    </p>
                    <p className="text-gray-300 flex items-center">
                      <MapPin className="h-3 w-3 mr-2" />
                      {request.address || 'Not specified'}
                    </p>
                  </div>
                  {request.specialInstructions && (
                    <p className="text-gray-400 text-xs mt-2 p-2 bg-gray-800/50 rounded border border-gray-700">
                      Note: {request.specialInstructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-400">
                    {request.status === 'completed' ? '100%' : 
                     request.status === 'delivered' ? '85%' :
                     request.status === 'collected' ? '70%' :
                     request.status === 'in_progress' ? '50%' :
                     request.status === 'assigned' ? '30%' : '10%'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: request.status === 'completed' ? '100%' : 
                             request.status === 'delivered' ? '85%' :
                             request.status === 'collected' ? '70%' :
                             request.status === 'in_progress' ? '50%' :
                             request.status === 'assigned' ? '30%' : '10%'
                    }}
                  ></div>
                </div>
              </div>

              {/* Feedback Section for Completed Requests */}
              {request.status === 'completed' && !request.feedbackSubmitted && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <p className="text-white text-sm">How was your experience?</p>
                    <button
                      onClick={() => {
                        setSelectedRequest(request.id);
                        setShowFeedbackForm(true);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Leave Feedback
                    </button>
                  </div>
                </div>
              )}

              {request.feedbackSubmitted && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-green-400 text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Thank you for your feedback!
                  </p>
                </div>
              )}
            </MagicCard>
          ))}
        </div>
      )}
    </div>
  );

  // Analytics Tab Component
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Impact Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MagicCard className="p-6 text-center">
          <Package className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{userStats.totalRequests}</div>
          <div className="text-gray-400 text-sm">Total Requests</div>
        </MagicCard>

        <MagicCard className="p-6 text-center">
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{userStats.completedRequests}</div>
          <div className="text-gray-400 text-sm">Completed</div>
        </MagicCard>

        <MagicCard className="p-6 text-center">
          <Recycle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{userStats.totalWeight.toFixed(1)} kg</div>
          <div className="text-gray-400 text-sm">E-waste Recycled</div>
        </MagicCard>

        <MagicCard className="p-6 text-center">
          <Award className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{userStats.co2Saved.toFixed(1)} kg</div>
          <div className="text-gray-400 text-sm">CO₂ Saved</div>
        </MagicCard>
      </div>

      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Environmental Impact</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div>
              <p className="text-white font-medium">Carbon Footprint Reduction</p>
              <p className="text-emerald-400 text-sm">Equivalent to planting {Math.floor(userStats.co2Saved / 0.02)} trees</p>
            </div>
            <div className="text-2xl">🌱</div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div>
              <p className="text-white font-medium">E-waste Diverted from Landfills</p>
              <p className="text-blue-400 text-sm">{userStats.totalWeight.toFixed(1)} kg of electronic waste properly recycled</p>
            </div>
            <div className="text-2xl">♻️</div>
          </div>
        </div>
      </MagicCard>
    </div>
  );

  // Achievements Tab Component
  const AchievementsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Achievements & Badges</h2>
      
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MagicCard className="p-6 text-center">
          <Award className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{achievements.length}</div>
          <div className="text-gray-400 text-sm">Achievements Earned</div>
        </MagicCard>

        <MagicCard className="p-6 text-center">
          <Globe className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            {achievements.reduce((sum, a) => sum + (a.achievements?.points || 0), 0)}
          </div>
          <div className="text-gray-400 text-sm">Total Points</div>
        </MagicCard>

        <MagicCard className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round((achievements.length / allAchievements.length) * 100)}%
          </div>
          <div className="text-gray-400 text-sm">Completion Rate</div>
        </MagicCard>
      </div>

      {/* Earned Achievements */}
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Achievements</h3>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600/50"
              >
                <div 
                  className="text-3xl p-3 rounded-full"
                  style={{ backgroundColor: `${achievement.achievements.badge_color}20`, border: `1px solid ${achievement.achievements.badge_color}40` }}
                >
                  {achievement.achievements.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{achievement.achievements.name}</h4>
                  <p className="text-gray-400 text-sm">{achievement.achievements.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-yellow-400 text-sm">+{achievement.achievements.points} points</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">No achievements yet</h4>
            <p className="text-gray-400">Complete your profile and start recycling to earn your first achievement!</p>
          </div>
        )}
      </MagicCard>

      {/* Available Achievements */}
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAchievements
            .filter(a => !achievements.find(ua => ua.achievement_id === a.id))
            .map(achievement => (
              <div 
                key={achievement.id}
                className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 opacity-75"
              >
                <div className="text-3xl p-3 rounded-full bg-gray-800 border border-gray-700">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-300 font-semibold">{achievement.name}</h4>
                  <p className="text-gray-500 text-sm">{achievement.description}</p>
                  <span className="text-gray-400 text-sm">+{achievement.points} points</span>
                </div>
              </div>
            ))}
        </div>
      </MagicCard>
    </div>
  );

  // Account Settings Tab Component
  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Account Settings</h2>
      
      {/* Security Settings */}
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
            <div>
              <h4 className="text-white font-medium">Change Password</h4>
              <p className="text-gray-400 text-sm">Update your account password for better security</p>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                loading 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {loading ? 'Processing...' : 'Change'}
            </button>
          </div>
        </div>
      </MagicCard>

      {/* Account Management */}
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Management</h3>
        <div className="space-y-4">
          {/* Deactivate Account */}
          <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Deactivate Account</h4>
                <p className="text-gray-400 text-sm">Temporarily disable your account (can be reactivated)</p>
                <ul className="text-gray-500 text-xs mt-1 space-y-1">
                  <li>• Account will be temporarily disabled</li>
                  <li>• Data will be preserved</li>
                  <li>• Can be reactivated by contacting support</li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleDeactivateAccount}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                loading 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {loading ? 'Processing...' : 'Deactivate'}
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 text-xl">🗑️</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Delete Account</h4>
                <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                <ul className="text-gray-500 text-xs mt-1 space-y-1">
                  <li>• <strong className="text-red-400">PERMANENT</strong> - Cannot be undone</li>
                  <li>• All personal data will be removed</li>
                  <li>• Pending requests will be cancelled</li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                loading 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {loading ? 'Processing...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-6 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center space-x-2">
            <span className="text-orange-400 text-lg">⚡</span>
            <div>
              <h5 className="text-orange-400 font-medium text-sm">Important Notice</h5>
              <p className="text-gray-400 text-xs mt-1">
                These actions affect your account permanently. Please ensure you understand the consequences before proceeding. 
                For assistance, contact our support team.
              </p>
            </div>
          </div>
        </div>
      </MagicCard>
    </div>
  );

  // Notifications Tab Component
  const NotificationsTab = () => {
    // Helper function to get icon component from string
    const getNotificationIcon = (iconName, type) => {
      const iconProps = { className: "h-5 w-5 mt-0.5" };
      
      switch (iconName) {
        case 'CheckCircle':
          return <CheckCircle {...iconProps} className="h-5 w-5 text-emerald-400 mt-0.5" />;
        case 'Truck':
          return <Truck {...iconProps} className="h-5 w-5 text-blue-400 mt-0.5" />;
        case 'Bell':
          return <Bell {...iconProps} className="h-5 w-5 text-yellow-400 mt-0.5" />;
        default:
          return <Bell {...iconProps} className="h-5 w-5 text-gray-400 mt-0.5" />;
      }
    };

    // Helper function to get notification background color
    const getNotificationBg = (type) => {
      switch (type) {
        case 'success':
          return 'bg-emerald-500/10 border-emerald-500/20';
        case 'info':
          return 'bg-blue-500/10 border-blue-500/20';
        case 'warning':
          return 'bg-yellow-500/10 border-yellow-500/20';
        case 'error':
          return 'bg-red-500/10 border-red-500/20';
        default:
          return 'bg-gray-500/10 border-gray-500/20';
      }
    };

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins < 1 ? 'Just now' : `${diffMins} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Notifications</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">
              {notifications.filter(n => !n.read).length} unread
            </span>
            <button
              onClick={loadNotifications}
              disabled={notificationsLoading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {notificationsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Notifications</h3>
          
          {notificationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">No notifications yet</h4>
              <p className="text-gray-400">We'll notify you about important updates and activities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border ${getNotificationBg(notification.type)} ${
                    !notification.read ? 'border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  {getNotificationIcon(notification.icon, notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatTimestamp(notification.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </MagicCard>

        {/* Notification Settings */}
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Request Status Updates</p>
                <p className="text-gray-400 text-sm">Get notified when your request status changes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Achievement Notifications</p>
                <p className="text-gray-400 text-sm">Get notified when you earn new achievements</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">Receive important updates via email</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </MagicCard>
      </div>
    );
  };

  // Feedback Form Modal
  const FeedbackModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <MagicCard className="w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Rate Your Experience</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setFeedback(prev => ({
                    ...prev,
                    [selectedRequest]: { ...prev[selectedRequest], rating: star }
                  }))}
                  className={`text-2xl ${
                    (feedback[selectedRequest]?.rating || 0) >= star 
                      ? 'text-yellow-400' 
                      : 'text-gray-600'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Comments (Optional)</label>
            <textarea
              value={feedback[selectedRequest]?.comment || ''}
              onChange={(e) => setFeedback(prev => ({
                ...prev,
                [selectedRequest]: { ...prev[selectedRequest], comment: e.target.value }
              }))}
              rows={3}
              className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 px-3 py-2"
              placeholder="Tell us about your experience..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowFeedbackForm(false);
                setSelectedRequest(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleFeedbackSubmit(selectedRequest)}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </MagicCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-slate-900/50 border-r border-gray-800 min-h-screen">
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center text-white font-bold overflow-hidden">
                {user?.profile_picture_url ? (
                  <img 
                    src={user.profile_picture_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full flex items-center justify-center ${user?.profile_picture_url ? 'hidden' : 'flex'}`}
                >
                  {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
              <div>
                <h3 className="text-white font-semibold">{user?.name || 'User'}</h3>
                <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-6">
              {/* General Section */}
              <div>
                <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">General</h4>
                <div className="space-y-1">
                  {sidebarItems.filter(item => item.section === 'General').map(item => {
                    const Icon = item.icon;
                    return (
            <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeTab === item.id
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
            </button>
                    );
                  })}
                </div>
              </div>

              {/* Support Section */}
              <div>
                <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Support</h4>
                <div className="space-y-1">
                  {sidebarItems.filter(item => item.section === 'Support').map(item => {
                    const Icon = item.icon;
                    return (
            <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeTab === item.id
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
            </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Tab Content */}
          {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'achievements' && <AchievementsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Feedback & Support</h2>
              
              {/* Support Tickets Section */}
              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">My Support Tickets</h3>
                {userSupportTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-white font-semibold mb-2">No support tickets</h4>
                    <p className="text-gray-400 mb-4">You haven't submitted any support requests yet.</p>
                    <button
                      onClick={() => navigate('/contact')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                      Contact Support
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userSupportTickets.slice(0, 5).map(ticket => (
                      <div key={ticket.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{ticket.subject}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                            ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{ticket.message}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Category: {ticket.category.replace('_', ' ')}</span>
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        {ticket.admin_response && (
                          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            <p className="text-emerald-400 text-sm font-medium">Admin Response:</p>
                            <p className="text-gray-300 text-sm">{ticket.admin_response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </MagicCard>

              {/* Feedback History Section */}
              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">My Feedback History</h3>
                {userFeedbackHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-white font-semibold mb-2">No feedback submitted</h4>
                    <p className="text-gray-400">Your feedback helps us improve our service quality.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userFeedbackHistory.slice(0, 5).map(feedback => (
                      <div key={feedback.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{feedback.subject}</h4>
                          <div className="flex items-center space-x-2">
                            {feedback.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-sm ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(feedback.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{feedback.message}</p>
                        <div className="mt-2 text-xs text-gray-400">
                          Type: {feedback.feedback_type || 'General'} • 
                          {feedback.collection_request_id && ` Request #${feedback.collection_request_id.slice(0, 8)}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </MagicCard>

              {/* Quick Actions */}
              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/contact')}
                    className="flex items-center justify-center px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Support
                  </button>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="h-5 w-5 mr-2" />
                    Submit Feedback
                  </button>
                </div>
              </MagicCard>
            </div>
          )}

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-4xl my-8">
              <div className="bg-slate-900 rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10 bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  ×
                </button>
                <RequestPickupForm onSuccess={async () => {
                  setShowRequestForm(false);
                  await loadRequests();
                  setActiveTab('requests');
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackForm && <FeedbackModal />}

        {/* Password Change Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <MagicCard className="w-full max-w-md p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newPassword = formData.get('newPassword');
                const confirmPassword = formData.get('confirmPassword');
                
                if (newPassword !== confirmPassword) {
                  setError('Passwords do not match');
                  return;
                }
                
                handlePasswordChange(newPassword);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={6}
                      className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 px-3 py-2"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={6}
                      className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 px-3 py-2"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            </MagicCard>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 max-w-md transform transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-xl">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              <div>
                <div className="font-semibold">
                  {toast.type === 'success' ? 'Success' : 'Error'}
                </div>
                <div className="text-sm opacity-90">{toast.message}</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
