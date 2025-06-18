import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  HardDrive, 
  Wifi,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const RealTimeMonitor = ({ compact = false, showAlerts = true }) => {
  const [healthData, setHealthData] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Start monitoring
    analyticsService.startRealTimeMonitoring((data) => {
      setHealthData(data);
      setLastUpdate(new Date());
      setIsConnected(true);
    });

    // Simulate connection status
    const connectionCheck = setInterval(() => {
      // Randomly simulate connection issues (very rarely)
      if (Math.random() < 0.02) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000);
      }
    }, 10000);

    return () => {
      analyticsService.stopRealTimeMonitoring();
      clearInterval(connectionCheck);
    };
  }, []);

  if (!healthData) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
            <span className="text-white">Initializing monitoring...</span>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-900';
      case 'warning': return 'bg-yellow-900';
      case 'error': return 'bg-red-900';
      default: return 'bg-gray-900';
    }
  };

  const getMetricStatus = (value, thresholds) => {
    if (value >= thresholds.critical) return 'error';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const responseTimeStatus = getMetricStatus(healthData.metrics.responseTime, { warning: 200, critical: 500 });
  const memoryStatus = getMetricStatus(healthData.metrics.memoryUsage, { warning: 80, critical: 90 });
  const errorRateStatus = getMetricStatus(healthData.metrics.errorRate, { warning: 1, critical: 5 });

  if (compact) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">System Status</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-xs ${getStatusColor(healthData.status)}`}>
              {healthData.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Response</p>
            <p className={`text-sm font-semibold ${getStatusColor(responseTimeStatus)}`}>
              {healthData.metrics.responseTime}ms
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Memory</p>
            <p className={`text-sm font-semibold ${getStatusColor(memoryStatus)}`}>
              {healthData.metrics.memoryUsage}%
            </p>
          </div>
        </div>

        {showAlerts && healthData.alerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">{healthData.alerts.length} alert(s)</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-emerald-400" />
          <h4 className="text-lg font-semibold text-white">Real-time System Monitor</h4>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusBg(healthData.status)} ${getStatusColor(healthData.status)}`}>
            {healthData.status === 'healthy' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="capitalize font-medium">{healthData.status}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className={`h-5 w-5 ${getStatusColor(responseTimeStatus)}`} />
            <span className={`text-xs font-medium ${getStatusColor(responseTimeStatus)}`}>
              {responseTimeStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Response Time</p>
          <p className={`text-xl font-bold ${getStatusColor(responseTimeStatus)}`}>
            {healthData.metrics.responseTime}ms
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-400" />
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm">Active Users</p>
          <p className="text-xl font-bold text-white">
            {healthData.metrics.activeUsers.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className={`h-5 w-5 ${getStatusColor(errorRateStatus)}`} />
            <span className={`text-xs font-medium ${getStatusColor(errorRateStatus)}`}>
              {errorRateStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Error Rate</p>
          <p className={`text-xl font-bold ${getStatusColor(errorRateStatus)}`}>
            {healthData.metrics.errorRate.toFixed(2)}%
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className={`h-5 w-5 ${getStatusColor(memoryStatus)}`} />
            <span className={`text-xs font-medium ${getStatusColor(memoryStatus)}`}>
              {memoryStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Memory Usage</p>
          <p className={`text-xl font-bold ${getStatusColor(memoryStatus)}`}>
            {healthData.metrics.memoryUsage}%
          </p>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Cpu className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">CPU Usage</p>
              <p className="text-white font-semibold">45%</p>
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
            <div className="bg-purple-400 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <HardDrive className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Disk Usage</p>
              <p className="text-white font-semibold">62%</p>
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
            <div className="bg-blue-400 h-2 rounded-full" style={{ width: '62%' }}></div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Wifi className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Network I/O</p>
              <p className="text-white font-semibold">Normal</p>
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full" style={{ width: '35%' }}></div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {showAlerts && healthData.alerts.length > 0 && (
        <div className="border-t border-slate-700 pt-4">
          <h5 className="text-yellow-400 font-medium mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Active Alerts ({healthData.alerts.length})</span>
          </h5>
          <div className="space-y-2">
            {healthData.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded ${
                alert.type === 'error' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{alert.message}</span>
                </div>
                <span className="font-semibold">{alert.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-gray-400 text-xs text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default RealTimeMonitor; 