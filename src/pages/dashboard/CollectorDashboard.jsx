import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supabaseApi from '../../services/supabaseApi';
import { supabase } from '../../lib/supabase';
import { MagicCard } from '../../components/ui/magic-card';
import { ShimmerButton } from '../../components/ui/shimmer-button';
import { AnimatedGradientText } from '../../components/ui/animated-gradient-text';
import DeliveryWorkflowStatus from '../../components/ui/DeliveryWorkflowStatus';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Package, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Truck,
  Calendar,
  Weight,
  Star,
  Navigation,
  FileText,
  Upload,
  Home,
  Bell,
  Settings
} from 'lucide-react';

const CollectorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    navigate('/');
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [collectorStatus, setCollectorStatus] = useState('inactive');
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);

  // Form states
  const [issueForm, setIssueForm] = useState({
    type: '',
    description: '',
    severity: 'medium'
  });
  const [deliveryForm, setDeliveryForm] = useState({
    actualWeight: '',
    condition: 'good',
    notes: ''
  });
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Helper function to transform task data for display
  const transformTaskData = (task) => {
    if (!task) return null;
    
    return {
      ...task,
      // Ensure we have the required display fields
      customerName: task.user?.name || task.customer_name || 'Unknown Customer',
      customerPhone: task.user?.phone || task.customer_phone || task.phone || 'No phone',
      address: task.pickup_address || task.address || 'No address provided',
      scheduledDate: task.scheduled_date || task.preferred_date || new Date().toISOString().split('T')[0],
      scheduledTime: task.scheduled_time || task.preferred_time || '10:00',
      estimatedWeight: task.estimated_weight || 'Unknown',
      items: task.item_types || task.items || [],
      specialInstructions: task.special_instructions || task.notes || '',
      priority: task.priority || 'medium'
    };
  };

  // Generate sample data for testing (when database is empty)
  const generateSampleData = () => {
    const sampleTasks = [
      {
        id: 'sample-1',
        customerName: 'John Smith',
        customerPhone: '+1234567890',
        address: '123 Main St, Downtown',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '10:00',
        estimatedWeight: '25 kg',
        items: ['Plastic Bottles', 'Newspapers', 'Cardboard'],
        specialInstructions: 'Ring doorbell twice',
        priority: 'high',
        status: 'assigned'
      },
      {
        id: 'sample-2',
        customerName: 'Sarah Johnson',
        customerPhone: '+1234567891',
        address: '456 Oak Ave, Uptown',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '14:00',
        estimatedWeight: '15 kg',
        items: ['Electronics', 'Batteries'],
        specialInstructions: 'Call before arrival',
        priority: 'medium',
        status: 'in_progress'
      }
    ];

    const samplePending = [
      {
        id: 'pending-1',
        customerName: 'Mike Wilson',
        customerPhone: '+1234567892',
        address: '789 Pine St, Westside',
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: '16:00',
        estimatedWeight: '30 kg',
        items: ['Metal Cans', 'Glass Bottles'],
        specialInstructions: 'Heavy items, bring extra help',
        priority: 'high',
        status: 'pending'
      }
    ];

    return { sampleTasks, samplePending };
  };

  useEffect(() => {
    if (user?.id) {
      loadCollectorData();
    }
  }, [user]);

  const loadCollectorData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load collector profile to get status
      try {
        const profile = await supabaseApi.auth.getProfile(user.id);
        setCollectorStatus(profile?.collector_status || 'inactive');
      } catch (profileError) {
        console.log('Could not fetch collector status, using default');
        setCollectorStatus('active');
      }
      
      // Load assigned tasks for this collector
      try {
        const tasksResponse = await supabaseApi.collection.getCollectorRequests(user.id);
        console.log('Loaded collector tasks:', tasksResponse);
        // Transform the tasks to ensure proper display fields
        const transformedTasks = (tasksResponse || []).map(transformTaskData).filter(Boolean);
        setTasks(transformedTasks);
      } catch (tasksError) {
        console.error('Error loading collector tasks:', tasksError);
        // If complex query fails, try simple query
        try {
          const { data: simpleTasks, error: simpleError } = await supabase
            .from('collection_requests')
            .select('*')
            .eq('collector_id', user.id)
            .order('created_at', { ascending: false });
          
          if (simpleError) throw simpleError;
          const transformedTasks = (simpleTasks || []).map(transformTaskData).filter(Boolean);
          setTasks(transformedTasks);
        } catch (simpleError) {
          console.error('Even simple tasks query failed:', simpleError);
          console.log('Using sample task data for demonstration');
          const { sampleTasks } = generateSampleData();
          setTasks(sampleTasks);
        }
      }
      
      // Load pending requests (not assigned to anyone yet)
      try {
        const pendingResponse = await supabaseApi.collection.getAllRequests();
        // Filter for requests that are not assigned yet
        const pendingRequests = (pendingResponse || []).filter(req => 
          req.status === 'pending' && !req.collector_id
        );
        console.log('Loaded pending requests:', pendingRequests);
        // Transform the pending requests
        const transformedPending = pendingRequests.map(transformTaskData).filter(Boolean);
        setPendingRequests(transformedPending);
      } catch (pendingError) {
        console.error('Error loading pending requests:', pendingError);
        // Try simple query for pending requests
        try {
          const { data: simplePending, error: simpleError } = await supabase
            .from('collection_requests')
            .select('*')
            .eq('status', 'pending')
            .is('collector_id', null)
            .order('created_at', { ascending: false });
          
          if (simpleError) throw simpleError;
          const transformedPending = (simplePending || []).map(transformTaskData).filter(Boolean);
          setPendingRequests(transformedPending);
        } catch (simpleError) {
          console.error('Even simple pending query failed:', simpleError);  
          console.log('Using sample pending data for demonstration');
          const { samplePending } = generateSampleData();
          setPendingRequests(samplePending);
        }
      }
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error('Error loading collector data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollectorStatus = async () => {
    try {
      const newStatus = collectorStatus === 'active' ? 'inactive' : 'active';
      
      // Update collector status in database
      await supabaseApi.auth.updateProfile(user.id, {
        collector_status: newStatus
      });
      
      setCollectorStatus(newStatus);
      setSuccessMessage(`Status updated to ${newStatus}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Reload data to update pending requests visibility
      await loadCollectorData();
    } catch (err) {
      setError('Failed to update status: ' + err.message);
      console.error('Error updating collector status:', err);
    }
  };

  const claimRequest = async (requestId) => {
    try {
      // Check if collector already has active tasks
      if (hasActiveTasks()) {
        const blockingTask = getBlockingTask();
        throw new Error(`You cannot claim new requests while you have an active task (#${blockingTask.id}). Please complete and deliver your current task first.`);
      }
      
      // Handle sample data
      if (requestId.toString().startsWith('pending')) {
        // Mock functionality for sample data
        const claimedRequest = pendingRequests.find(req => req.id === requestId);
        if (claimedRequest) {
          const newTask = {
            ...claimedRequest,
            id: `task-${Date.now()}`,
            status: 'assigned',
            collector_id: user.id,
            scheduledDate: claimedRequest.preferredDate,
            scheduledTime: claimedRequest.preferredTime
          };
          
          setTasks(prevTasks => [...prevTasks, newTask]);
          setPendingRequests(prevPending => prevPending.filter(req => req.id !== requestId));
          setSuccessMessage('Request claimed successfully! (Demo Mode)');
        }
      } else {
        // Real database operation
        await supabaseApi.collection.assignCollector(requestId, user.id);
        // Reload data to update both pending requests and assigned tasks
        await loadCollectorData();
        setSuccessMessage('Request claimed successfully!');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to claim request');
      console.error('Error claiming request:', err);
    }
  };

  // Helper function to check if collector has active tasks that prevent claiming new ones
  const hasActiveTasks = () => {
    return tasks.some(task => ['assigned', 'in_progress', 'completed'].includes(task.status));
  };

  // Helper function to get the active task that's blocking new claims
  const getBlockingTask = () => {
    return tasks.find(task => ['assigned', 'in_progress', 'completed'].includes(task.status));
  };

  const updateTaskStatus = async (taskId, status, notes = '') => {
    try {
      // Handle sample data
      if (taskId.toString().startsWith('sample') || taskId.toString().startsWith('task-')) {
        // Mock functionality for sample data
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status, notes, updated_at: new Date().toISOString() }
              : task
          )
        );
        setSuccessMessage(`Task status updated to ${status} (Demo Mode)`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        // Real database operation
        await supabaseApi.collection.updateRequest(taskId, { status, notes });
        await loadCollectorData();
        setSuccessMessage(`Task status updated to ${status}`);
      }
      
      // Close modals if task is completed
      if (status === 'completed') {
        setShowTaskDetails(false);
        setSelectedTask(null);
      }
    } catch (err) {
      setError('Failed to update task status: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const handleIssueReport = async (e) => {
    e.preventDefault();
    try {
      // Mock issue reporting
      const issueData = {
        taskId: selectedTask.id,
        collectorId: user.id,
        type: issueForm.type,
        description: issueForm.description,
        severity: issueForm.severity,
        reportedAt: new Date().toISOString()
      };
      
      console.log('Issue reported:', issueData);
      
      // Update task with issue notes
      await updateTaskStatus(selectedTask.id, 'issue_reported', `Issue: ${issueForm.description}`);
      
      setShowIssueReport(false);
      setIssueForm({ type: '', description: '', severity: 'medium' });
    } catch (err) {
      setError('Failed to report issue');
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
  };

  const handleDeliveryDetailsUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingDelivery(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Updating delivery details for task:', selectedTask.id);
      
      // Create or update delivery record
      const deliveryData = {
        collection_request_id: selectedTask.id,
        collector_id: user.id,
        recycling_center_id: selectedTask.recycling_center_id,
        actual_weight: parseFloat(deliveryForm.actualWeight) || 0,
        condition: deliveryForm.condition,
        collector_notes: deliveryForm.notes,
        delivery_photos: uploadedPhotos.map(p => p.name),
        status: 'delivered',
        delivered_at: new Date().toISOString()
      };
      
      console.log('Creating delivery record:', deliveryData);
      
      // Try to create the delivery record
      let deliveryResponse;
      try {
        deliveryResponse = await supabaseApi.delivery.createDelivery(deliveryData);
        console.log('Delivery record created:', deliveryResponse);
      } catch (deliveryError) {
        console.log('Failed to create delivery record:', deliveryError.message);
        // Continue with task status update even if delivery record fails
      }
      
      // Update the collection request status to 'delivered'
      await supabaseApi.collection.updateRequest(selectedTask.id, {
        status: 'delivered',
        actual_weight: parseFloat(deliveryForm.actualWeight) || selectedTask.estimated_weight,
        collector_notes: deliveryForm.notes,
        completed_at: new Date().toISOString()
      });
      
      console.log('Task status updated to delivered');
      
      // Reload data to reflect changes
      await loadCollectorData();
      
      // Close modal and reset form
      setShowDeliveryConfirm(false);
      setDeliveryForm({ actualWeight: '', condition: 'good', notes: '' });
      setUploadedPhotos([]);
      setSelectedTask(null);
      
      // Show success message
      setSuccessMessage('Delivery details updated successfully! Task moved to history.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      console.error('Error updating delivery details:', err);
      setError('Failed to update delivery details: ' + err.message);
      
      // Clear error message after 10 seconds
      setTimeout(() => {
        setError('');
      }, 10000);
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      completed: 'bg-green-500',
      delivered: 'bg-purple-500',
      issue_reported: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      assigned: 'Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      delivered: 'Delivered',
      issue_reported: 'Issue Reported'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-400',
      medium: 'text-yellow-400',
      high: 'text-red-400',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
          <div>
                  <h1 className="text-xl font-bold text-gray-900">Collector Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
              </div>
            </div>

          <div className="flex items-center space-x-4">
            {/* Collector Status Toggle */}
            <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-sm">Status:</span>
              <button
                onClick={toggleCollectorStatus}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  collectorStatus === 'active'
                      ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                    collectorStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                  <span className="capitalize font-medium">{collectorStatus}</span>
              </button>
            </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {tasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length}
                </span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>

              {/* Back to Home */}
            <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
                <Home className="h-4 w-4" />
                <span className="hidden sm:block">Home</span>
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'overview'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Truck className="h-5 w-5" />
                <span className="font-medium">Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'pending'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Pending Requests</span>
                {pendingRequests.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">My Tasks</span>
                {tasks.filter(t => !['delivered', 'processed'].includes(t.status)).length > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {tasks.filter(t => !['delivered', 'processed'].includes(t.status)).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Schedule</span>
              </button>

              <button
                onClick={() => setActiveTab('route')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'route'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Navigation className="h-5 w-5" />
                <span className="font-medium">Route Planning</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'history'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">History</span>
              </button>

              <button
                onClick={() => setActiveTab('performance')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'performance'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Star className="h-5 w-5" />
                <span className="font-medium">Performance</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Profile & Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
      {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Database Connection Issue</p>
              <p className="text-sm">{error}</p>
              {(tasks.length > 0 || pendingRequests.length > 0) && (
                <p className="text-xs mt-1 text-red-600">
                  Using sample data for demonstration. Please check your database configuration.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Debug Info - only show when using sample data */}
      {(tasks.some(t => t.id?.toString().startsWith('sample')) || 
        pendingRequests.some(p => p.id?.toString().startsWith('pending'))) && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <p className="font-medium">Demo Mode Active</p>
              <p className="text-sm">
                Currently displaying sample data due to database connectivity issues. 
                The interface is fully functional for testing purposes.
              </p>
            </div>
          </div>
        </div>
      )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
      {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500 text-sm font-medium">Available</span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Pending Requests</h3>
                  <p className="text-2xl font-bold text-gray-900">
                {collectorStatus === 'active' ? pendingRequests.length : 0}
              </p>
                  <p className="text-gray-400 text-xs mt-1">ready to claim</p>
            </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <Package className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-emerald-500 text-sm font-medium">Active</span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">My Tasks</h3>
                  <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => ['assigned', 'in_progress', 'completed'].includes(t.status)).length}
              </p>
                  <p className="text-gray-400 text-xs mt-1">in progress</p>
            </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500 text-sm font-medium">Today</span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Delivered</h3>
                  <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => ['delivered', 'processed'].includes(t.status) && 
                  new Date(t.updatedAt || t.completedAt || '').toDateString() === new Date().toDateString()).length}
              </p>
                  <p className="text-gray-400 text-xs mt-1">completed today</p>
            </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      collectorStatus === 'active' ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        collectorStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <div className="h-3 w-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm font-medium ${
                        collectorStatus === 'active' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {collectorStatus === 'active' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Status</h3>
              <p className={`text-2xl font-bold ${
                    collectorStatus === 'active' ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {collectorStatus === 'active' ? 'ACTIVE' : 'INACTIVE'}
              </p>
                  <p className="text-gray-400 text-xs mt-1">current status</p>
            </div>
            </div>

              {/* Today's Tasks Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
                  <span className="text-sm text-gray-500">
                    {tasks.filter(task => task.scheduledDate === new Date().toISOString().split('T')[0]).length} scheduled
                  </span>
          </div>
                
                <div className="space-y-4">
                  {tasks
                    .filter(task => task.scheduledDate === new Date().toISOString().split('T')[0])
                    .slice(0, 3)
                    .map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-lg">{task.scheduledTime}</div>
                          <div>
                            <p className="text-gray-900 font-medium">{task.customerName}</p>
                            <p className="text-gray-500 text-sm">{task.address}</p>
      </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                      </div>
                    ))}
                  
                  {tasks.filter(task => task.scheduledDate === new Date().toISOString().split('T')[0]).length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Performance Metrics</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Track your collection performance</span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {tasks.filter(t => ['delivered', 'processed'].includes(t.status)).length}
                      </p>
                      <p className="text-sm text-gray-500">Total Completed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Star className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                      <p className="text-sm text-gray-500">Average Rating</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">95%</p>
                      <p className="text-sm text-gray-500">On-Time Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Chart Placeholder */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h4>
                <div className="h-64 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Performance chart coming soon</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile & Settings Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Profile & Settings</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Manage your account settings</span>
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Small Van</option>
                      <option>Large Van</option>
                      <option>Truck</option>
                      <option>Pickup</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                    Update Profile
            </button>
                </div>
      </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">New Task Notifications</p>
                      <p className="text-sm text-gray-500">Get notified when new tasks are assigned</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Active Task Warning */}
          {collectorStatus === 'active' && hasActiveTasks() && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 border-yellow-500 mb-6">
              <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Task in Progress</h3>
                      <p className="text-gray-600 mb-3">
                    You currently have an active task (#{getBlockingTask().id}) that must be completed and delivered 
                    before you can claim new requests.
                  </p>
                  <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Current Task Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(getBlockingTask().status)}`}>
                      {getStatusLabel(getBlockingTask().status)}
                    </span>
                  </div>
                </div>
              </div>
                </div>
          )}
          
          {collectorStatus === 'inactive' ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="p-4 bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">You're Currently Inactive</h3>
                  <p className="text-gray-600 mb-6">Set your status to "Active" to see and claim pending pickup requests.</p>
              <button
                onClick={toggleCollectorStatus}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                Go Active
              </button>
                </div>
          ) : pendingRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="p-4 bg-emerald-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600">All pickup requests have been claimed. Check back later for new requests.</p>
                </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingRequests.map(request => (
                    <div key={request.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div>
                            <h3 className="text-lg font-semibold text-gray-900">Request #{request.id}</h3>
                            <p className="text-sm text-gray-500">New Request</p>
                      </div>
                    </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.priority === 'high' ? 'bg-red-100 text-red-700' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                      {request.priority?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{request.address}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{request.preferredDate} • {request.preferredTime}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{request.customerPhone}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Weight className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">Est. {request.estimatedWeight || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.items?.map((item, index) => (
                            <span key={index} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {request.specialInstructions && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-900">{request.specialInstructions}</p>
                    </div>
                  )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                      onClick={() => claimRequest(request.id)}
                      disabled={hasActiveTasks()}
                          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                            hasActiveTasks() 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                    >
                      {hasActiveTasks() ? 'Cannot Claim' : 'Claim Request'}
                        </button>
                    
                    <button
                      onClick={() => {
                        setSelectedTask(request);
                        setShowTaskDetails(true);
                      }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                  
                  {hasActiveTasks() && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <p className="text-yellow-700 text-xs">
                        ⚠️ Complete your current task (#{getBlockingTask().id}) before claiming new requests
                      </p>
                    </div>
                  )}
                    </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {tasks.filter(task => !['delivered', 'processed'].includes(task.status)).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="p-4 bg-emerald-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Tasks</h3>
                  <p className="text-gray-600">You don't have any assigned tasks at the moment.</p>
                </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tasks.filter(task => !['delivered', 'processed'].includes(task.status)).map(task => (
                    <div key={task.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                      <div>
                            <h3 className="text-lg font-semibold text-gray-900">Task #{task.id}</h3>
                            <p className="text-sm text-gray-500">{getStatusLabel(task.status)}</p>
                      </div>
                    </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                      {task.priority?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{task.address}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{task.scheduledDate} • {task.scheduledTime}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{task.customerPhone}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Weight className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">Est. {task.estimatedWeight}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {task.items?.map((item, index) => (
                            <span key={index} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {task.specialInstructions && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-900">{task.specialInstructions}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                        <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetails(true);
                      }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                    >
                      View Details
                        </button>
                    
                    {task.status === 'assigned' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                      >
                        Start Task
                      </button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowIssueReport(true);
                          }}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                        >
                          Report Issue
                        </button>
                      </>
                    )}
                    
                    {task.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setDeliveryForm({
                            ...deliveryForm,
                            actualWeight: task.estimatedWeight?.replace(/[^\d.]/g, '') || ''
                          });
                          setShowDeliveryConfirm(true);
                        }}
                            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
                      >
                        Update Delivery Details
          </button>
                    )}
                  </div>
                    </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            {tasks
              .filter(task => task.scheduledDate === new Date().toISOString().split('T')[0])
              .map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                        <div className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-lg">{task.scheduledTime}</div>
                    <div>
                          <p className="text-gray-900 font-medium">{task.customerName}</p>
                          <p className="text-gray-500 text-sm">{task.address}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                </div>
              ))}
          </div>
            </div>
      )}

      {/* Route Planning Tab */}
      {activeTab === 'route' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Route Optimization</h3>
          <div className="text-center py-8">
                <div className="p-4 bg-blue-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Navigation className="h-10 w-10 text-blue-500" />
                </div>
                <p className="text-gray-600 mb-4">Route planning feature coming soon!</p>
            <p className="text-sm text-gray-500">This will help optimize your pickup routes for maximum efficiency.</p>
          </div>
            </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Task History</h3>
          <div className="space-y-4">
            {tasks
              .filter(task => ['delivered', 'processed', 'completed'].includes(task.status))
              .length === 0 ? (
              <div className="text-center py-8">
                    <div className="p-4 bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No completed tasks yet.</p>
              </div>
            ) : (
              tasks
                .filter(task => ['delivered', 'processed', 'completed'].includes(task.status))
              .map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                          <p className="text-gray-900 font-medium">Task #{task.id} - {task.customerName}</p>
                          <p className="text-gray-600 text-sm">{task.address}</p>
                    <p className="text-gray-500 text-xs">{task.scheduledDate}</p>
                  </div>
                  <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </div>
                          <p className="text-gray-500 text-xs mt-1">{task.estimatedWeight}</p>
                  </div>
                </div>
                ))
            )}
          </div>
            </div>
      )}

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Task #{selectedTask.id} Details</h3>
              <button
                onClick={() => setShowTaskDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.customerName}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.customerPhone}</p>
                </div>
                <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.address}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedTask.status === 'pending' ? 'Preferred Date' : 'Scheduled Date'}
                  </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.scheduledDate || selectedTask.preferredDate}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedTask.status === 'pending' ? 'Preferred Time' : 'Time Slot'}
                  </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.scheduledTime || selectedTask.preferredTime}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Weight</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.estimatedWeight}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <p className={`font-medium ${getPriorityColor(selectedTask.priority)} bg-gray-50 p-3 rounded-lg`}>
                    {selectedTask.priority?.toUpperCase()}
                  </p>
                </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items to Collect</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.items?.map((item, index) => (
                        <span key={index} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTask.specialInstructions && (
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.specialInstructions}</p>
                </div>
              )}

              {/* Delivery Status Info */}
              {selectedTask.status === 'completed' && (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <p className="text-sm font-medium text-emerald-800">Ready for Delivery</p>
                  </div>
                      <p className="text-xs text-emerald-600">
                    Task completed. Use "Update Delivery Details" to provide actual delivery information and complete the delivery process.
                  </p>
                </div>
              )}

              {/* Action buttons - only show for assigned/active tasks, not pending requests */}
              {selectedTask.status && selectedTask.status !== 'pending' && (
              <div className="flex space-x-3 pt-4">
                      <button
                  onClick={() => {
                    setShowPhotoUpload(true);
                  }}
                        className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos
                      </button>
                
                <button
                  onClick={() => {
                    setShowIssueReport(true);
                  }}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Upload Photos</h3>
              <button
                onClick={() => setShowPhotoUpload(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Drag and drop photos or click to select</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                      className="cursor-pointer bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Select Photos
                </label>
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                      <p className="text-gray-900 mb-2 font-medium">Uploaded Photos:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedPhotos.map(photo => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.name}
                              className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setUploadedPhotos(uploadedPhotos.filter(p => p.id !== photo.id))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPhotoUpload(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Done
          </button>
        </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Report Modal */}
      {showIssueReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Report Issue</h3>
              <button
                onClick={() => setShowIssueReport(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueReport} className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <select
                  value={issueForm.type}
                  onChange={(e) => setIssueForm({...issueForm, type: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="access">Access Problem</option>
                  <option value="customer">Customer Not Available</option>
                  <option value="items">Items Not Ready</option>
                  <option value="safety">Safety Concern</option>
                  <option value="vehicle">Vehicle Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={issueForm.severity}
                  onChange={(e) => setIssueForm({...issueForm, severity: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe the issue in detail..."
                  required
                />
        </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowIssueReport(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Report Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Details Update Modal */}
      {showDeliveryConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                    <h3 className="text-xl font-semibold text-gray-900">Update Delivery Details</h3>
                    <p className="text-sm text-gray-500 mt-1">Provide actual delivery information for the recycling center</p>
              </div>
              <button
                onClick={() => setShowDeliveryConfirm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliveryDetailsUpdate} className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={deliveryForm.actualWeight}
                  onChange={(e) => setDeliveryForm({...deliveryForm, actualWeight: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter actual weight"
                  required
                />
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Condition</label>
                <select
                  value={deliveryForm.condition}
                  onChange={(e) => setDeliveryForm({...deliveryForm, condition: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                <textarea
                  value={deliveryForm.notes}
                  onChange={(e) => setDeliveryForm({...deliveryForm, notes: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Any additional notes about the delivery..."
                />
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                      <p className="text-sm text-gray-700 mb-2 font-medium">Attached Photos: {uploadedPhotos.length}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeliveryConfirm(false)}
                  disabled={isUpdatingDelivery}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingDelivery}
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdatingDelivery ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Delivery Details'
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
