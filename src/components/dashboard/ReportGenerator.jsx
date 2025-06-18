import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Leaf, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const ReportGenerator = () => {
  const [selectedReportType, setSelectedReportType] = useState('comprehensive');
  const [dateRange, setDateRange] = useState(30);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  const reportTypes = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Complete analytics including usage, performance, environmental impact, and financial metrics',
      icon: FileText,
      color: 'text-blue-400',
      estimatedSize: '2.5 MB'
    },
    {
      id: 'usage',
      name: 'Usage Analytics',
      description: 'User behavior patterns, feature usage, and engagement metrics',
      icon: BarChart3,
      color: 'text-emerald-400',
      estimatedSize: '800 KB'
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'System performance, collector efficiency, and operational metrics',
      icon: TrendingUp,
      color: 'text-purple-400',
      estimatedSize: '600 KB'
    },
    {
      id: 'environmental',
      name: 'Environmental Impact',
      description: 'CO2 savings, energy conservation, and sustainability metrics',
      icon: Leaf,
      color: 'text-green-400',
      estimatedSize: '400 KB'
    },
    {
      id: 'engagement',
      name: 'User Engagement',
      description: 'User journey, conversion rates, and retention analysis',
      icon: Users,
      color: 'text-yellow-400',
      estimatedSize: '500 KB'
    },
    {
      id: 'financial',
      name: 'Financial Analysis',
      description: 'Revenue, costs, profitability, and financial projections',
      icon: DollarSign,
      color: 'text-orange-400',
      estimatedSize: '300 KB'
    }
  ];

  const dateRangeOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' },
    { value: 180, label: 'Last 6 months' },
    { value: 365, label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const handleGenerateReport = async (format = 'json') => {
    setIsGenerating(true);
    try {
      let reportOptions = { format };
      
      if (useCustomRange && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        reportOptions.dateRange = daysDiff;
      } else {
        reportOptions.dateRange = dateRange;
      }

      const report = await analyticsService.generateReport(selectedReportType, reportOptions);
      
      if (format === 'json') {
        analyticsService.exportReport(report, `ecotech-${selectedReportType}-report-${Date.now()}.json`);
      } else {
        analyticsService.exportCSV(report, `ecotech-${selectedReportType}-data-${Date.now()}.csv`);
      }
      
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDateRangeChange = (value) => {
    if (value === 'custom') {
      setUseCustomRange(true);
      setDateRange(30); // fallback
    } else {
      setUseCustomRange(false);
      setDateRange(Number(value));
    }
  };

  const selectedReport = reportTypes.find(type => type.id === selectedReportType);

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Report Generator</h3>
          <p className="text-gray-400">Generate comprehensive analytics reports for your data</p>
        </div>
        
        {lastGenerated && (
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Last generated: {lastGenerated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-4">Select Report Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedReportType === type.id
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <h5 className="font-medium text-white">{type.name}</h5>
                </div>
                <p className="text-gray-400 text-sm mb-2">{type.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Est. size: {type.estimatedSize}</span>
                  {selectedReportType === type.id && (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-4">Date Range</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Time Period</label>
            <select
              value={useCustomRange ? 'custom' : dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {useCustomRange && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Preview */}
      {selectedReport && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <selectedReport.icon className={`h-6 w-6 ${selectedReport.color}`} />
            <h5 className="text-lg font-medium text-white">{selectedReport.name}</h5>
          </div>
          <p className="text-gray-400 mb-3">{selectedReport.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Report Type</p>
              <p className="text-white font-medium">{selectedReport.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Date Range</p>
              <p className="text-white font-medium">
                {useCustomRange ? 'Custom' : `${dateRange} days`}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Estimated Size</p>
              <p className="text-white font-medium">{selectedReport.estimatedSize}</p>
            </div>
            <div>
              <p className="text-gray-500">Format</p>
              <p className="text-white font-medium">JSON / CSV</p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleGenerateReport('json')}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate JSON Report'}</span>
          </button>

          <button
            onClick={() => handleGenerateReport('csv')}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate CSV Data'}</span>
          </button>
        </div>

        {isGenerating && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Processing data...</span>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-slate-900 rounded-lg">
        <h6 className="text-white font-medium mb-2">Report Information</h6>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• JSON reports contain complete structured data with metadata</li>
          <li>• CSV exports provide tabular data suitable for spreadsheet analysis</li>
          <li>• Custom date ranges allow for specific period analysis</li>
          <li>• Comprehensive reports include all available metrics and insights</li>
          <li>• Reports are generated in real-time based on current system data</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportGenerator; 