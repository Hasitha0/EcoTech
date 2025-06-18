import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { MagicCard } from '../../components/ui/magic-card';
import { ShimmerButton } from '../../components/ui/shimmer-button';
import { AnimatedGradientText } from '../../components/ui/animated-gradient-text';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Scale, 
  FileText, 
  BarChart3,
  Eye,
  Edit,
  Star,
  Calendar,
  MapPin,
  Phone,
  User,
  Weight,
  Activity,
  TrendingUp,
  Archive
} from 'lucide-react';

const RecyclingCenterDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('deliveries');
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [showQualityControl, setShowQualityControl] = useState(false);
  const [showProcessingUpdate, setShowProcessingUpdate] = useState(false);

  // Form states
  const [qualityForm, setQualityForm] = useState({
    overallQuality: 'good',
    materialCondition: 'acceptable',
    contamination: 'none',
    notes: '',
    actionRequired: false,
    actionNotes: ''
  });
  
  const [processingForm, setProcessingForm] = useState({
    status: 'received',
    actualWeight: '',
    notes: '',
    processingDate: '',
    completionEstimate: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    pendingDeliveries: 0,
    processedToday: 0,
    totalWeight: 0,
    qualityScore: 0
  });

  useEffect(() => {
    loadDeliveries();
    loadStats();
  }, [user]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      // Get deliveries for this recycling center
      const response = await mockApi.getDeliveries(user.centerId || 1);
      setDeliveries(response.deliveries);
    } catch (err) {
      setError('Failed to load deliveries');
      console.error('Error loading deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from deliveries
      const response = await mockApi.getDeliveries(user.centerId || 1);
      const allDeliveries = response.deliveries;
      
      const pending = allDeliveries.filter(d => d.status === 'pending_delivery' || d.status === 'received').length;
      const processedToday = allDeliveries.filter(d => 
        d.processedAt && new Date(d.processedAt).toDateString() === new Date().toDateString()
      ).length;
      const totalWeight = allDeliveries.reduce((sum, d) => sum + (parseFloat(d.actualWeight) || parseFloat(d.estimatedWeight) || 0), 0);
      
      setStats({
        pendingDeliveries: pending,
        processedToday,
        totalWeight: totalWeight.toFixed(1),
        qualityScore: 4.6 // Mock quality score
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const confirmDelivery = async (deliveryId, actualWeight, notes) => {
    try {
      await mockApi.confirmDelivery(deliveryId, actualWeight, notes);
      await loadDeliveries();
      await loadStats();
      setShowDeliveryDetails(false);
    } catch (err) {
      setError('Failed to confirm delivery');
      console.error('Error confirming delivery:', err);
    }
  };

  const updateProcessingStatus = async (deliveryId, status, notes) => {
    try {
      await mockApi.updateProcessingStatus(deliveryId, status, notes);
      await loadDeliveries();
      await loadStats();
      setShowProcessingUpdate(false);
      setProcessingForm({ status: 'received', actualWeight: '', notes: '', processingDate: '', completionEstimate: '' });
    } catch (err) {
      setError('Failed to update processing status');
      console.error('Error updating processing:', err);
    }
  };

  const handleQualityControlSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mock quality control submission
      const qualityData = {
        deliveryId: selectedDelivery.id,
        centerId: user.centerId || 1,
        ...qualityForm,
        assessedAt: new Date().toISOString(),
        assessedBy: user.name
      };
      
      console.log('Quality control submitted:', qualityData);
      
      // Update delivery with quality notes
      await updateProcessingStatus(
        selectedDelivery.id, 
        'quality_checked', 
        `Quality: ${qualityForm.overallQuality}. ${qualityForm.notes}`
      );
      
      setShowQualityControl(false);
      setQualityForm({
        overallQuality: 'good',
        materialCondition: 'acceptable',
        contamination: 'none',
        notes: '',
        actionRequired: false,
        actionNotes: ''
      });
    } catch (err) {
      setError('Failed to submit quality control');
    }
  };

  const handleProcessingSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProcessingStatus(
        selectedDelivery.id,
        processingForm.status,
        `Processing: ${processingForm.notes}. Weight: ${processingForm.actualWeight}kg`
      );
    } catch (err) {
      setError('Failed to update processing status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_delivery: 'bg-yellow-500',
      received: 'bg-blue-500',
      quality_checked: 'bg-purple-500',
      processing: 'bg-orange-500',
      processed: 'bg-green-500',
      delivered: 'bg-green-600'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_delivery: 'Pending Delivery',
      received: 'Received',
      quality_checked: 'Quality Checked',
      processing: 'Processing',
      processed: 'Processed',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const getQualityColor = (quality) => {
    const colors = {
      excellent: 'text-green-400',
      good: 'text-emerald-400',
      acceptable: 'text-yellow-400',
      poor: 'text-red-400'
    };
    return colors[quality] || 'text-gray-400';
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <AnimatedGradientText className="text-3xl font-bold mb-2">
          Recycling Center Dashboard
        </AnimatedGradientText>
        <p className="text-gray-300">Welcome back, {user?.name}! Manage deliveries and processing operations.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MagicCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Deliveries</p>
              <p className="text-2xl font-bold text-white">{stats.pendingDeliveries}</p>
            </div>
            <Truck className="h-8 w-8 text-yellow-400" />
          </div>
        </MagicCard>

        <MagicCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Processed Today</p>
              <p className="text-2xl font-bold text-white">{stats.processedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </MagicCard>

        <MagicCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Weight</p>
              <p className="text-2xl font-bold text-white">{stats.totalWeight} kg</p>
            </div>
            <Weight className="h-8 w-8 text-blue-400" />
          </div>
        </MagicCard>

        <MagicCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Quality Score</p>
              <p className="text-2xl font-bold text-white">{stats.qualityScore}/5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </MagicCard>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'deliveries', label: 'Deliveries', icon: Truck },
          { id: 'processing', label: 'Processing', icon: Activity },
          { id: 'quality', label: 'Quality Control', icon: Star },
          { id: 'reports', label: 'Reports', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          {deliveries.length === 0 ? (
            <MagicCard className="p-8 text-center">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Deliveries</h3>
              <p className="text-gray-400">No deliveries scheduled for your center at the moment.</p>
            </MagicCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deliveries.map(delivery => (
                <MagicCard key={delivery.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(delivery.status)}`}></div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Delivery #{delivery.id}</h3>
                        <p className="text-sm text-gray-400">{getStatusLabel(delivery.status)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Request #{delivery.requestId}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm">Collector ID: {delivery.collectorId}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Weight className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm">
                        {delivery.actualWeight ? `${delivery.actualWeight} kg (actual)` : `${delivery.estimatedWeight} (estimated)`}
                      </span>
                    </div>
                    
                    {delivery.deliveredAt && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm">{new Date(delivery.deliveredAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {delivery.expectedDelivery && !delivery.deliveredAt && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">Expected: {new Date(delivery.expectedDelivery).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {delivery.items?.map((item, index) => (
                        <span key={index} className="bg-slate-700 text-emerald-400 px-2 py-1 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {delivery.collectorNotes && (
                    <div className="mb-4 p-3 bg-slate-700 rounded">
                      <p className="text-sm text-gray-400 mb-1">Collector Notes:</p>
                      <p className="text-sm text-white">{delivery.collectorNotes}</p>
                    </div>
                  )}

                  {delivery.processingNotes && (
                    <div className="mb-4 p-3 bg-emerald-500/10 rounded">
                      <p className="text-sm text-emerald-400 mb-1">Processing Notes:</p>
                      <p className="text-sm text-white">{delivery.processingNotes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <ShimmerButton
                      size="sm"
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setShowDeliveryDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
            View Details
                    </ShimmerButton>
                    
                    {delivery.status === 'pending_delivery' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setProcessingForm({
                            ...processingForm,
                            status: 'received',
                            actualWeight: delivery.estimatedWeight?.replace(' kg', '') || ''
                          });
                          setShowProcessingUpdate(true);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                      >
                        Confirm Receipt
                      </button>
                    )}
                    
                    {(delivery.status === 'received' || delivery.status === 'delivered') && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowQualityControl(true);
                        }}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition"
                      >
                        Quality Check
                      </button>
                    )}
                    
                    {delivery.status === 'quality_checked' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setProcessingForm({
                            ...processingForm,
                            status: 'processing'
                          });
                          setShowProcessingUpdate(true);
                        }}
                        className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition"
                      >
                        Start Processing
                      </button>
                    )}
                    
                    {delivery.status === 'processing' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setProcessingForm({
                            ...processingForm,
                            status: 'processed'
                          });
                          setShowProcessingUpdate(true);
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
                      >
                        Complete Processing
          </button>
                    )}
                  </div>
                </MagicCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Processing Tab */}
      {activeTab === 'processing' && (
        <MagicCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Processing Workflow</h3>
          <div className="space-y-4">
            {deliveries
              .filter(d => ['received', 'quality_checked', 'processing'].includes(d.status))
              .map(delivery => (
                <div key={delivery.id} className="flex items-center justify-between p-4 bg-slate-700 rounded">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(delivery.status)}`}></div>
                    <div>
                      <p className="text-white font-medium">Delivery #{delivery.id}</p>
                      <p className="text-gray-400 text-sm">{getStatusLabel(delivery.status)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-medium">{delivery.actualWeight || delivery.estimatedWeight}</p>
                    <p className="text-gray-400 text-xs">{delivery.items?.join(', ')}</p>
                  </div>
                </div>
              ))}
          </div>
        </MagicCard>
      )}

      {/* Quality Control Tab */}
      {activeTab === 'quality' && (
        <MagicCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Quality Control Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Recent Quality Assessments</h4>
              {deliveries
                .filter(d => d.status === 'quality_checked' || d.status === 'processed')
                .slice(0, 5)
                .map(delivery => (
                  <div key={delivery.id} className="p-4 bg-slate-700 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-medium">Delivery #{delivery.id}</p>
                      <span className="text-green-400 text-sm">✓ Passed</span>
                    </div>
                    <p className="text-gray-400 text-sm">{delivery.items?.join(', ')}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {delivery.processedAt ? new Date(delivery.processedAt).toLocaleDateString() : 'In progress'}
                    </p>
                  </div>
                ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Quality Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700 rounded text-center">
                  <p className="text-2xl font-bold text-green-400">98%</p>
                  <p className="text-gray-400 text-sm">Pass Rate</p>
                </div>
                <div className="p-4 bg-slate-700 rounded text-center">
                  <p className="text-2xl font-bold text-blue-400">4.6</p>
                  <p className="text-gray-400 text-sm">Avg Quality</p>
                </div>
                <div className="p-4 bg-slate-700 rounded text-center">
                  <p className="text-2xl font-bold text-yellow-400">2%</p>
                  <p className="text-gray-400 text-sm">Contamination</p>
                </div>
                <div className="p-4 bg-slate-700 rounded text-center">
                  <p className="text-2xl font-bold text-emerald-400">15</p>
                  <p className="text-gray-400 text-sm">Checked Today</p>
                </div>
              </div>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MagicCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Processing Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Deliveries This Month</span>
                <span className="text-white font-semibold">{deliveries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Weight Processed</span>
                <span className="text-white font-semibold">{stats.totalWeight} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Processing Time</span>
                <span className="text-white font-semibold">2.3 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Recycling Efficiency</span>
                <span className="text-green-400 font-semibold">94%</span>
              </div>
            </div>
          </MagicCard>

          <MagicCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Material Breakdown</h3>
            <div className="space-y-3">
              {[
                { name: 'Electronics', weight: '45%', color: 'bg-blue-500' },
                { name: 'Computers', weight: '25%', color: 'bg-green-500' },
                { name: 'Mobile Phones', weight: '15%', color: 'bg-purple-500' },
                { name: 'Batteries', weight: '10%', color: 'bg-yellow-500' },
                { name: 'Other', weight: '5%', color: 'bg-gray-500' }
              ].map(material => (
                <div key={material.name} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${material.color}`}></div>
                  <span className="text-gray-300 flex-1">{material.name}</span>
                  <span className="text-white font-medium">{material.weight}</span>
                </div>
              ))}
            </div>
          </MagicCard>
        </div>
      )}

      {/* Delivery Details Modal */}
      {showDeliveryDetails && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Delivery #{selectedDelivery.id} Details</h3>
              <button
                onClick={() => setShowDeliveryDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedDelivery.status)}`}></div>
                    <p className="text-white">{getStatusLabel(selectedDelivery.status)}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Request ID</label>
                  <p className="text-white">#{selectedDelivery.requestId}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Collector ID</label>
                  <p className="text-white">{selectedDelivery.collectorId}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Weight</label>
                  <p className="text-white">
                    {selectedDelivery.actualWeight ? 
                      `${selectedDelivery.actualWeight} (actual)` : 
                      `${selectedDelivery.estimatedWeight} (estimated)`
                    }
                  </p>
                </div>
                {selectedDelivery.deliveredAt && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Delivered At</label>
                    <p className="text-white">{new Date(selectedDelivery.deliveredAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Items</label>
                <div className="flex flex-wrap gap-2">
                  {selectedDelivery.items?.map((item, index) => (
                    <span key={index} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDelivery.collectorNotes && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Collector Notes</label>
                  <p className="text-white bg-slate-700 p-3 rounded">{selectedDelivery.collectorNotes}</p>
                </div>
              )}

              {selectedDelivery.processingNotes && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Processing Notes</label>
                  <p className="text-white bg-emerald-500/10 p-3 rounded">{selectedDelivery.processingNotes}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {selectedDelivery.status === 'pending_delivery' && (
                  <ShimmerButton
                    onClick={() => {
                      setShowDeliveryDetails(false);
                      setProcessingForm({
                        ...processingForm,
                        status: 'received',
                        actualWeight: selectedDelivery.estimatedWeight?.replace(' kg', '') || ''
                      });
                      setShowProcessingUpdate(true);
                    }}
                  >
                    Confirm Receipt
                  </ShimmerButton>
                )}
                
                {(selectedDelivery.status === 'received' || selectedDelivery.status === 'delivered') && (
                  <button
                    onClick={() => {
                      setShowDeliveryDetails(false);
                      setShowQualityControl(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Quality Check
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Control Modal */}
      {showQualityControl && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Quality Control Assessment</h3>
              <button
                onClick={() => setShowQualityControl(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQualityControlSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Overall Quality</label>
                <select
                  value={qualityForm.overallQuality}
                  onChange={(e) => setQualityForm({...qualityForm, overallQuality: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                  required
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Material Condition</label>
                <select
                  value={qualityForm.materialCondition}
                  onChange={(e) => setQualityForm({...qualityForm, materialCondition: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Contamination Level</label>
                <select
                  value={qualityForm.contamination}
                  onChange={(e) => setQualityForm({...qualityForm, contamination: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                >
                  <option value="none">None</option>
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Assessment Notes</label>
                <textarea
                  value={qualityForm.notes}
                  onChange={(e) => setQualityForm({...qualityForm, notes: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 h-24"
                  placeholder="Detailed quality assessment notes..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="actionRequired"
                  checked={qualityForm.actionRequired}
                  onChange={(e) => setQualityForm({...qualityForm, actionRequired: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="actionRequired" className="text-sm text-gray-400">
                  Special action required
                </label>
              </div>

              {qualityForm.actionRequired && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Action Notes</label>
                  <textarea
                    value={qualityForm.actionNotes}
                    onChange={(e) => setQualityForm({...qualityForm, actionNotes: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 h-20"
                    placeholder="Describe required actions..."
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowQualityControl(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                >
                  Submit Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Processing Update Modal */}
      {showProcessingUpdate && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Update Processing Status</h3>
              <button
                onClick={() => setShowProcessingUpdate(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={processingForm.status}
                  onChange={(e) => setProcessingForm({...processingForm, status: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                  required
                >
                  <option value="received">Received</option>
                  <option value="quality_checked">Quality Checked</option>
                  <option value="processing">Processing</option>
                  <option value="processed">Processed</option>
                </select>
              </div>

              {processingForm.status === 'received' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Actual Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={processingForm.actualWeight}
                    onChange={(e) => setProcessingForm({...processingForm, actualWeight: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2"
                    placeholder="Enter actual weight"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Processing Notes</label>
                <textarea
                  value={processingForm.notes}
                  onChange={(e) => setProcessingForm({...processingForm, notes: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 h-24"
                  placeholder="Add processing notes..."
                />
              </div>

              {processingForm.status === 'processed' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Completion Date</label>
                  <input
                    type="date"
                    value={processingForm.processingDate}
                    onChange={(e) => setProcessingForm({...processingForm, processingDate: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProcessingUpdate(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
                >
                  Update Status
                </button>
              </div>
            </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default RecyclingCenterDashboard;
