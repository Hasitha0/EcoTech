import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  LogOut,
  Home,
  Bell,
  Shield,
  Zap
} from 'lucide-react';
import supabaseApi from '../../services/supabaseApi';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    totalRequests: 3456,
    activeCenters: 89,
    co2Saved: 12450,
    activeUsers: 1134,
    completedRequests: 2987,
    totalProcessed: 25600
  });
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  // Load initial data
  useEffect(() => {
    loadSystemStats();
    loadPendingRegistrations();
    loadSupportTickets();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const response = await supabaseApi.analytics.getCollectionStats();
      setSystemStats(response.stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRegistrations = async () => {
    try {
      console.log('Loading pending registrations...');
      // Note: Pending registrations functionality needs to be implemented
      console.log('Pending registrations not yet implemented');
      
      // Mock data for demonstration
      const mockRegistrations = [
        {
          id: 'reg-1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'COLLECTOR',
          phone: '+1234567890',
          address: '123 Main St, City',
          createdAt: new Date().toISOString(),
          businessInfo: 'Independent collector with 5 years experience'
        },
        {
          id: 'reg-2',
          name: 'GreenTech Recycling',
          email: 'contact@greentech.com',
          role: 'RECYCLING_CENTER',
          phone: '+1234567891',
          address: '456 Industrial Ave, City',
          createdAt: new Date().toISOString(),
          businessInfo: 'Licensed recycling facility specializing in electronics'
        }
      ];
      
      console.log('Pending registrations loaded:', mockRegistrations);
      setPendingRegistrations(mockRegistrations);
    } catch (error) {
      console.error('Error loading pending registrations:', error);
      setPendingRegistrations([]);
    }
  };

  const loadSupportTickets = async () => {
    try {
      console.log('Loading support tickets...');
      const response = await supabaseApi.support.getSupportRequests();
      console.log('Support tickets loaded:', response?.tickets);
      setSupportTickets(response?.tickets || []);
    } catch (error) {
      console.error('Error loading support tickets:', error);
      
      // Mock data for demonstration
      const mockTickets = [
        {
          id: 'ticket-1',
          subject: 'Unable to schedule pickup',
          message: 'I am having trouble scheduling a pickup through the app. The calendar widget is not responding.',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          category: 'technical_issue',
          priority: 'medium',
          status: 'open',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          admin_response: null,
          responded_at: null
        },
        {
          id: 'ticket-2',
          subject: 'Account Reactivation Request',
          message: 'My account was deactivated and I would like to reactivate it. I have resolved the previous issues.',
          name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          category: 'account_reactivation',
          priority: 'high',
          status: 'open',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          admin_response: null,
          responded_at: null
        },
        {
          id: 'ticket-3',
          subject: 'Payment Issue',
          message: 'I was charged twice for the same pickup service. Can you please help resolve this billing issue?',
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          category: 'billing',
          priority: 'high',
          status: 'resolved',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          admin_response: 'We have processed your refund for the duplicate charge. You should see it in your account within 3-5 business days.',
          responded_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        }
      ];
      
      console.log('Using mock support tickets:', mockTickets);
      setSupportTickets(mockTickets);
    }
  };

  const handleApproveRegistration = async (userId, approved, reason = '') => {
    try {
      console.log('Processing registration:', { userId, approved, reason });
      // Note: Registration approval functionality needs to be implemented
      console.log('Registration approval not yet implemented');
      console.log('Registration processed successfully:', result);
      await loadPendingRegistrations();
      setSelectedUser(null);
      
      // Show success message
      alert(`Registration ${approved ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error processing registration:', error);
      alert(`Error processing registration: ${error.message}`);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status, response = null) => {
    try {
      console.log('Updating ticket status:', { ticketId, status, response });
      const result = await supabaseApi.support.updateSupportTicket(ticketId, { status, admin_response: response });
      console.log('Ticket updated successfully:', result);
      await loadSupportTickets();
      setSelectedTicket(null);
      
      // Show success message
      alert(`Ticket ${status} successfully!`);
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert(`Error updating ticket: ${error.message}`);
    }
  };

  const handleReactivateAccount = async (email) => {
    try {
      console.log('Starting account reactivation process for:', email);
      
      const confirmReactivate = window.confirm(
        `Are you sure you want to reactivate the account for ${email}?\n\n` +
        'This will restore their access to the platform.'
      );
      
      if (!confirmReactivate) return;
      
      // Use the new reactivateAccountByEmail function
      const result = await supabaseApi.user.reactivateAccount(email);
      console.log('Account reactivated successfully:', result);
      
      // Refresh support tickets to update status
      await loadSupportTickets();
      
      // Show success message
      alert(`Account for ${email} has been reactivated successfully!`);
      
    } catch (error) {
      console.error('Error reactivating account:', error);
      alert(`Error reactivating account: ${error.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'registrations', label: 'Registrations', icon: UserCheck },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'support', label: 'Support Tickets', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'issues', label: 'Issues', icon: AlertTriangle }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-blue-500 text-sm font-medium">Active</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{systemStats?.totalUsers || 0}</p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-emerald-500 text-sm font-medium">Processing</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Collection Requests</h3>
          <p className="text-2xl font-bold text-gray-900">{systemStats?.totalRequests || 0}</p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-purple-500 text-sm font-medium">Operating</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Active Centers</h3>
          <p className="text-2xl font-bold text-gray-900">{systemStats?.activeCenters || 0}</p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+3% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500 text-sm font-medium">Impact</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">CO2 Saved (kg)</h3>
          <p className="text-2xl font-bold text-gray-900">{systemStats?.co2Saved || 0}</p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+15% from last month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">New collector registration approved</span>
              <span className="text-gray-400 text-sm ml-auto">2 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Collection request completed</span>
              <span className="text-gray-400 text-sm ml-auto">5 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">New recycling center pending approval</span>
              <span className="text-gray-400 text-sm ml-auto">10 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">System maintenance completed</span>
              <span className="text-gray-400 text-sm ml-auto">1 hour ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response Time</span>
              <span className="text-green-600 font-semibold">98ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Performance</span>
              <span className="text-green-600 font-semibold">Excellent</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Uptime</span>
              <span className="text-green-600 font-semibold">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Sessions</span>
              <span className="text-blue-600 font-semibold">1,247</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Pending Registrations</h3>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Total: {pendingRegistrations?.length || 0}</span>
        </div>
      </div>

      {(pendingRegistrations?.length || 0) === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="p-4 bg-emerald-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Registrations</h3>
          <p className="text-gray-600">All registration requests have been processed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {(pendingRegistrations || []).map((user) => (
            <div key={user.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'COLLECTOR' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'RECYCLING_CENTER' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-emerald-500" />
                      {user.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-emerald-500" />
                      {user.phone || 'Not provided'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      Applied: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                      {user.address || 'Not provided'}
                    </div>
                  </div>

                  {user.businessInfo && (
                    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-sm text-gray-900">
                        <strong className="text-gray-700">Business Info:</strong> {user.businessInfo}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleApproveRegistration(user.id, true)}
                    className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleApproveRegistration(user.id, false, 'Application rejected by admin')}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSupportTickets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Support Tickets</h3>
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">
            Total: {supportTickets?.length || 0} | Open: {supportTickets?.filter(t => t.status === 'open').length || 0}
          </span>
          <button
            onClick={loadSupportTickets}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: supportTickets?.filter(t => t.status === 'open').length || 0, color: 'bg-blue-500' },
          { label: 'In Progress', count: supportTickets?.filter(t => t.status === 'in_progress').length || 0, color: 'bg-yellow-500' },
          { label: 'Resolved', count: supportTickets?.filter(t => t.status === 'resolved').length || 0, color: 'bg-green-500' },
          { label: 'Closed', count: supportTickets?.filter(t => t.status === 'closed').length || 0, color: 'bg-gray-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            </div>
          </div>
        ))}
      </div>

      {(supportTickets?.length || 0) === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Support Tickets</h3>
          <p className="text-gray-600">All support requests have been resolved or no tickets exist yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {(supportTickets || []).map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{ticket.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {ticket.category === 'account_reactivation' && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        REACTIVATION
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-emerald-500" />
                      {ticket.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-2 text-emerald-500" />
                      {ticket.category.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-emerald-500" />
                      {ticket.name}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ticket.message}
                  </p>

                  {ticket.admin_response && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800">
                        <strong>Admin Response:</strong> {ticket.admin_response}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Responded: {new Date(ticket.responded_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {ticket.category === 'account_reactivation' && ticket.status === 'open' && (
                    <button
                      onClick={() => handleReactivateAccount(ticket.email)}
                      className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"
                      title="Reactivate Account"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                  {ticket.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved', 'Issue resolved by admin')}
                      className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      title="Mark Resolved"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">User Management</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{systemStats?.activeUsers || 0}</p>
            <p className="text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendingRegistrations.length}</p>
            <p className="text-gray-400">Pending Approval</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">0</p>
            <p className="text-gray-400">Suspended</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">User Management Tools</p>
                <p className="text-sm text-gray-400">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
            Manage Users
          </button>
        </div>

          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Role Management</p>
                <p className="text-sm text-gray-400">Configure user roles and permissions</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Configure Roles
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Communication Tools</p>
                <p className="text-sm text-gray-400">Send notifications and announcements</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              Send Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Analytics & Reports</h3>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.open('/analytics', '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Full Analytics</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Collection Metrics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Requests</span>
              <span className="text-white font-semibold">{systemStats?.totalRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Completed</span>
              <span className="text-green-400 font-semibold">{systemStats?.completedRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Success Rate</span>
              <span className="text-emerald-400 font-semibold">
                {systemStats?.totalRequests ? 
                  Math.round((systemStats.completedRequests / systemStats.totalRequests) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Avg. Processing Time</span>
              <span className="text-blue-400 font-semibold">2.3 days</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Environmental Impact</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Processed (kg)</span>
              <span className="text-white font-semibold">{systemStats?.totalProcessed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">CO2 Saved (kg)</span>
              <span className="text-green-400 font-semibold">{systemStats?.co2Saved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Energy Saved (kWh)</span>
              <span className="text-yellow-400 font-semibold">12,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Water Saved (L)</span>
              <span className="text-blue-400 font-semibold">8,920</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">User Growth</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">This Month</span>
              <span className="text-green-400 font-semibold">+127 users</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Last Month</span>
              <span className="text-gray-400 font-semibold">+98 users</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Growth Rate</span>
              <span className="text-emerald-400 font-semibold">+29.6%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Retention Rate</span>
              <span className="text-blue-400 font-semibold">87.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Financial Overview</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Monthly Revenue</span>
              <span className="text-white font-semibold">$24,580</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Operating Costs</span>
              <span className="text-red-400 font-semibold">$18,200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Net Profit</span>
              <span className="text-green-400 font-semibold">$6,380</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Profit Margin</span>
              <span className="text-emerald-400 font-semibold">25.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Analytics Preview */}
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">System Performance Overview</h4>
          <span className="text-green-400 text-sm">● System Healthy</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Uptime</p>
            <p className="text-white text-lg font-semibold">99.8%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Response Time</p>
            <p className="text-white text-lg font-semibold">145ms</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Active Users</p>
            <p className="text-white text-lg font-semibold">1,247</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Error Rate</p>
            <p className="text-white text-lg font-semibold">0.2%</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Content Management</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
          <Edit className="h-4 w-4" />
          <span>Create Content</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Blog Posts</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
              <div>
                <p className="text-white font-medium">E-Waste Recycling Guide</p>
                <p className="text-gray-400 text-sm">Published 2 days ago</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-blue-400 hover:text-blue-300">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
              <div>
                <p className="text-white font-medium">Sustainable Tech Practices</p>
                <p className="text-gray-400 text-sm">Published 1 week ago</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-blue-400 hover:text-blue-300">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Educational Resources</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
              <div>
                <p className="text-white font-medium">Recycling Best Practices</p>
                <p className="text-gray-400 text-sm">Updated 3 days ago</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-blue-400 hover:text-blue-300">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
              <div>
                <p className="text-white font-medium">Device Preparation Guide</p>
                <p className="text-gray-400 text-sm">Updated 1 week ago</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-blue-400 hover:text-blue-300">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
            </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-4">Content Editor</h4>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Content title..."
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <textarea
            placeholder="Write your content here..."
            rows={8}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
              Save Draft
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIssues = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Issue Resolution</h3>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Open Issues: 3</span>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-semibold text-white">Collection not completed</h4>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  HIGH PRIORITY
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  OPEN
                </span>
              </div>
              
              <p className="text-gray-300 mb-3">
                Collector marked pickup as complete but customer reports items were not collected.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  Reported by: John Doe
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reported: 2 hours ago
                </div>
                <div className="flex items-center text-gray-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Request ID: #CR-1001
                </div>
                <div className="flex items-center text-gray-300">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assigned to: Support Team
                </div>
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-semibold text-white">App login issues</h4>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  MEDIUM PRIORITY
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  IN PROGRESS
                </span>
              </div>
              
              <p className="text-gray-300 mb-3">
                Multiple users reporting difficulty logging into the mobile app.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  Reported by: Multiple users
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reported: 1 day ago
                </div>
                <div className="flex items-center text-gray-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Ticket ID: #TECH-2001
                </div>
                <div className="flex items-center text-gray-300">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assigned to: Tech Team
                </div>
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-semibold text-white">Center capacity update needed</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  LOW PRIORITY
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  OPEN
                </span>
              </div>
              
              <p className="text-gray-300 mb-3">
                Recycling center requests update to their processing capacity information.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  Reported by: GreenTech Recycling
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reported: 3 days ago
                </div>
                <div className="flex items-center text-gray-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Request ID: #UPDATE-3001
                </div>
                <div className="flex items-center text-gray-300">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assigned to: Data Team
                </div>
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'registrations':
        return renderRegistrations();
      case 'users':
        return renderUserManagement();
      case 'analytics':
        return renderAnalytics();
      case 'content':
        return renderContent();
      case 'issues':
        return renderIssues();
      case 'support':
        return renderSupportTickets();
      default:
        return renderOverview();
    }
  };

  if (loading && !systemStats) {
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
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-sm">Status:</span>
                <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="capitalize font-medium">System Online</span>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {supportTickets?.filter(t => t.status === 'open').length || 0}
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
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.id === 'support' && (supportTickets?.filter(t => t.status === 'open').length || 0) > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {supportTickets?.filter(t => t.status === 'open').length || 0}
                      </span>
                    )}
                    {tab.id === 'registrations' && pendingRegistrations.length > 0 && (
                      <span className="ml-auto bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
                        {pendingRegistrations.length}
                      </span>
                    )}
                  </button>
                );
              })}
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
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
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

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Registration Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUser.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUser.address || 'Not provided'}</p>
              </div>
              {selectedUser.businessInfo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Information</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUser.businessInfo}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleApproveRegistration(selectedUser.id, false, 'Application rejected by admin')}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleApproveRegistration(selectedUser.id, true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Support Ticket Details</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Ticket Header */}
              <div className="flex items-center space-x-3 mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedTicket.priority.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTicket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                  selectedTicket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTicket.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTicket.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTicket.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTicket.category.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Admin Response */}
              {selectedTicket.admin_response && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                    <p className="text-green-800 whitespace-pre-wrap">{selectedTicket.admin_response}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Responded: {new Date(selectedTicket.responded_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                {selectedTicket.category === 'account_reactivation' && selectedTicket.status === 'open' && (
                  <button
                    onClick={() => {
                      handleReactivateAccount(selectedTicket.email);
                      setSelectedTicket(null);
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    Reactivate Account
                  </button>
                )}
                {selectedTicket.status === 'open' && (
                  <button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved', 'Issue resolved by admin')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
