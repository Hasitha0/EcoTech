import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Leaf,
  Zap,
  Droplets,
  Car,
  TreePine,
  Home,
  Filter,
  Calendar,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState(30);
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    usage: null,
    performance: null,
    engagement: null,
    environmental: null,
    financial: null
  });

  useEffect(() => {
    loadAnalyticsData();
    startRealTimeMonitoring();

    return () => {
      analyticsService.stopRealTimeMonitoring();
    };
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [usage, performance, engagement, environmental, financial] = await Promise.all([
        analyticsService.getUsagePatterns(dateRange),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getUserEngagement(),
        analyticsService.getEnvironmentalImpact(),
        analyticsService.getFinancialMetrics()
      ]);

      setAnalyticsData({
        usage,
        performance,
        engagement,
        environmental,
        financial
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeMonitoring = () => {
    analyticsService.startRealTimeMonitoring((healthData) => {
      setRealTimeData(healthData);
    });
  };

  const handleExportReport = async (reportType) => {
    try {
      const report = await analyticsService.generateReport(reportType, { dateRange });
      analyticsService.exportReport(report, `ecotech-${reportType}-report-${Date.now()}.json`);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleExportCSV = async (reportType) => {
    try {
      const report = await analyticsService.generateReport(reportType, { dateRange, format: 'csv' });
      analyticsService.exportCSV(report, `ecotech-${reportType}-data-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Real-time System Health */}
      {realTimeData && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Real-time System Health</h4>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              realTimeData.status === 'healthy' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
            }`}>
              {realTimeData.status === 'healthy' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="capitalize">{realTimeData.status}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Response Time</p>
              <p className="text-white text-xl font-semibold">{realTimeData.metrics.responseTime}ms</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-white text-xl font-semibold">{realTimeData.metrics.activeUsers}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Error Rate</p>
              <p className="text-white text-xl font-semibold">{realTimeData.metrics.errorRate.toFixed(2)}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Memory Usage</p>
              <p className="text-white text-xl font-semibold">{realTimeData.metrics.memoryUsage}%</p>
            </div>
          </div>

          {realTimeData.alerts.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="text-yellow-400 font-medium">Active Alerts</h5>
              {realTimeData.alerts.map((alert, index) => (
                <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                  alert.type === 'error' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <span>{alert.message}: {alert.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-white text-2xl font-bold">
                {analyticsData.engagement?.uniqueVisitors || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-green-400 text-sm">+12.5% from last month</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Sessions</p>
              <p className="text-white text-2xl font-bold">
                {analyticsData.engagement?.totalSessions || 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-green-400 text-sm">+8.3% from last week</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-white text-2xl font-bold">
                ${analyticsData.financial?.revenue.monthly.toLocaleString() || 0}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
          <div className="mt-2">
            <span className="text-green-400 text-sm">+15.3% growth</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">CO2 Saved</p>
              <p className="text-white text-2xl font-bold">
                {analyticsData.environmental?.co2Saved || 0}kg
              </p>
            </div>
            <Leaf className="h-8 w-8 text-green-400" />
          </div>
          <div className="mt-2">
            <span className="text-green-400 text-sm">Environmental impact</span>
          </div>
        </div>
      </div>

      {/* Usage Trends Chart */}
      {analyticsData.usage && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Daily Active Users Trend</h4>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.usage.dailyActiveUsers.slice(-14).map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-emerald-500 rounded-t"
                  style={{ height: `${(day.value / 200) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-400 mt-2">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderUsageAnalytics = () => (
    <div className="space-y-6">
      {/* Feature Usage */}
      {analyticsData.usage && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Feature Usage Distribution</h4>
          <div className="space-y-4">
            {Object.entries(analyticsData.usage.featureUsage).map(([feature, percentage]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-gray-300">{feature}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold w-12">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Types */}
      {analyticsData.usage && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Device Usage</h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(analyticsData.usage.deviceTypes).map(([device, percentage]) => {
              const Icon = device === 'Desktop' ? Monitor : device === 'Mobile' ? Smartphone : Tablet;
              return (
                <div key={device} className="text-center">
                  <Icon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">{percentage}%</p>
                  <p className="text-gray-400 text-sm">{device}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peak Hours */}
      {analyticsData.usage && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Peak Usage Hours</h4>
          <div className="h-48 flex items-end space-x-1">
            {analyticsData.usage.peakHours.map((hour, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(hour.users / 110) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-400 mt-1">
                  {hour.hour}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Retention */}
      {analyticsData.usage && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">User Retention</h4>
          <div className="space-y-3">
            {Object.entries(analyticsData.usage.userRetention).map(([period, percentage]) => (
              <div key={period} className="flex items-center justify-between">
                <span className="text-gray-300">{period}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold w-12">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="space-y-6">
      {/* System Health Overview */}
      {analyticsData.performance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-white mb-4">System Uptime</h4>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {analyticsData.performance.systemHealth.uptime}%
              </p>
              <p className="text-gray-400 text-sm mt-2">Last 30 days</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Avg Response Time</h4>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {analyticsData.performance.systemHealth.responseTime}ms
              </p>
              <p className="text-gray-400 text-sm mt-2">API endpoints</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Error Rate</h4>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {analyticsData.performance.systemHealth.errorRate}%
              </p>
              <p className="text-gray-400 text-sm mt-2">System-wide</p>
            </div>
          </div>
        </div>
      )}

      {/* Collector Performance */}
      {analyticsData.performance && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Top Performing Collectors</h4>
          <div className="space-y-4">
            {analyticsData.performance.collectorPerformance.topPerformers.map((collector, index) => (
              <div key={collector.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-400 font-bold">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{collector.name}</p>
                    <p className="text-gray-400 text-sm">ID: {collector.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{collector.completionRate}%</p>
                  <p className="text-gray-400 text-sm">{collector.avgTime}h avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recycling Center Performance */}
      {analyticsData.performance && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Recycling Center Throughput</h4>
          <div className="space-y-4">
            {analyticsData.performance.centerThroughput.topCenters.map((center, index) => (
              <div key={center.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400 font-bold">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{center.name}</p>
                    <p className="text-gray-400 text-sm">ID: {center.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{center.throughput} kg/day</p>
                  <p className="text-gray-400 text-sm">{center.efficiency}% efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEnvironmentalImpact = () => (
    <div className="space-y-6">
      {/* Impact Overview */}
      {analyticsData.environmental && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg text-center">
            <Leaf className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analyticsData.environmental.co2Saved}kg</p>
            <p className="text-gray-400 text-sm">CO2 Saved</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg text-center">
            <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analyticsData.environmental.energySaved.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">kWh Energy Saved</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg text-center">
            <Droplets className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analyticsData.environmental.waterSaved.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Liters Water Saved</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg text-center">
            <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analyticsData.environmental.totalWeight}kg</p>
            <p className="text-gray-400 text-sm">Total Processed</p>
          </div>
        </div>
      )}

      {/* Comparison Metrics */}
      {analyticsData.environmental && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Environmental Impact Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <TreePine className="h-12 w-12 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{analyticsData.environmental.comparisonMetrics.treesEquivalent}</p>
              <p className="text-gray-400 text-sm">Trees planted equivalent</p>
            </div>

            <div className="text-center">
              <Car className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{analyticsData.environmental.comparisonMetrics.carsOffRoad}</p>
              <p className="text-gray-400 text-sm">Cars off road for 1 year</p>
            </div>

            <div className="text-center">
              <Home className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{analyticsData.environmental.comparisonMetrics.householdsPowered}</p>
              <p className="text-gray-400 text-sm">Households powered for 1 month</p>
            </div>
          </div>
        </div>
      )}

      {/* Materials Recovered */}
      {analyticsData.environmental && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Materials Recovered</h4>
          <div className="space-y-4">
            {Object.entries(analyticsData.environmental.materialsRecovered).map(([material, amount]) => (
              <div key={material} className="flex items-center justify-between">
                <span className="text-gray-300">{material}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${(amount / 2340) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold w-16">{amount}kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {analyticsData.environmental && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Monthly Environmental Impact Trends</h4>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.environmental.monthlyTrends.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full space-y-1">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(month.co2Saved / 1200) * 80}px` }}
                    title={`CO2: ${month.co2Saved}kg`}
                  ></div>
                  <div 
                    className="w-full bg-yellow-500"
                    style={{ height: `${(month.energySaved / 1500) * 60}px` }}
                    title={`Energy: ${month.energySaved}kWh`}
                  ></div>
                  <div 
                    className="w-full bg-blue-500"
                    style={{ height: `${(month.waterSaved / 1000) * 40}px` }}
                    title={`Water: ${month.waterSaved}L`}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 mt-2">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-400 text-sm">CO2 Saved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-400 text-sm">Energy Saved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-400 text-sm">Water Saved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserEngagement = () => (
    <div className="space-y-6">
      {/* Engagement Overview */}
      {analyticsData.engagement && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Page Views</p>
                <p className="text-white text-2xl font-bold">{analyticsData.engagement.pageViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Session Duration</p>
                <p className="text-white text-2xl font-bold">{analyticsData.engagement.averageSessionDuration}m</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bounce Rate</p>
                <p className="text-white text-2xl font-bold">{analyticsData.engagement.bounceRate}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Returning Users</p>
                <p className="text-white text-2xl font-bold">{analyticsData.engagement.returningUsers}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Conversion Rates */}
      {analyticsData.engagement && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Conversion Rates</h4>
          <div className="space-y-4">
            {Object.entries(analyticsData.engagement.conversionRates).map(([action, rate]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-gray-300">{action}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold w-12">{rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Journey */}
      {analyticsData.engagement && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">User Journey Funnel</h4>
          <div className="space-y-3">
            {analyticsData.engagement.userJourney.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{step.step}</span>
                    <span className="text-gray-400">{step.users} users</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${(step.users / analyticsData.engagement.userJourney[0].users) * 100}%` }}
                    ></div>
                  </div>
                  {step.dropoff > 0 && (
                    <p className="text-red-400 text-sm mt-1">{step.dropoff}% drop-off</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Engagement */}
      {analyticsData.engagement && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Content Engagement</h4>
          <div className="space-y-4">
            {Object.entries(analyticsData.engagement.contentEngagement).map(([content, metrics]) => (
              <div key={content} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                <div>
                  <p className="text-white font-medium">{content}</p>
                  <p className="text-gray-400 text-sm">{metrics.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold">{metrics.avgTime}m</p>
                  <p className="text-gray-400 text-sm">avg time</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'usage', label: 'Usage Analytics', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'environmental', label: 'Environmental Impact', icon: Leaf },
    { id: 'engagement', label: 'User Engagement', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics & Reporting</h1>
            <p className="text-gray-400 mt-2">Comprehensive insights into system performance and user behavior</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-2">
                  <button
                    onClick={() => handleExportReport('comprehensive')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-slate-700"
                  >
                    Complete Report (JSON)
                  </button>
                  <button
                    onClick={() => handleExportCSV('usage')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-slate-700"
                  >
                    Usage Data (CSV)
                  </button>
                  <button
                    onClick={() => handleExportCSV('performance')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-slate-700"
                  >
                    Performance Data (CSV)
                  </button>
                  <button
                    onClick={() => handleExportCSV('environmental')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-slate-700"
                  >
                    Environmental Data (CSV)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
              <span className="text-white">Loading analytics data...</span>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'usage' && renderUsageAnalytics()}
            {activeTab === 'performance' && renderPerformanceMetrics()}
            {activeTab === 'environmental' && renderEnvironmentalImpact()}
            {activeTab === 'engagement' && renderUserEngagement()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 