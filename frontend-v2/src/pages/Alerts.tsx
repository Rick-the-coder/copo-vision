import React, { useEffect, useState, useMemo } from 'react';
import api from '../config/api';
import { AlertRecord } from '../types';
import { Badge } from '../components/common/Badge';
import {
  AlertTriangle,
  Bell,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/alerts/');
      if (res.data.status === 'success') {
        setAlerts(res.data.alerts || []);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to fetch alerts',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNotification(null);
    try {
      const res = await api.post('/api/alerts/generate');
      if (res.data.status === 'success') {
        setNotification({
          type: 'success',
          message: `Alert scan complete! Generated ${res.data.co_alerts_created} CO attainment alerts and ${res.data.prediction_alerts_created} prediction alerts.`,
        });
        await fetchAlerts();
      } else {
        setNotification({
          type: 'error',
          message: res.data.message || 'Alert generation completed with warnings',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to trigger alert generation',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch =
        (a.student_name && a.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.enrollment_no && a.enrollment_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.message && a.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.alert_type && a.alert_type.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeverity =
        severityFilter === 'ALL' ||
        a.severity?.toUpperCase() === severityFilter.toUpperCase();

      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchQuery, severityFilter]);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, severityFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Trigger Action */}
      <div className="academic-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-rose-50/20">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Academic Early-Warning Intervention</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Deficiencies & Outcome Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Automated alerts identify students failing to attain threshold Course Outcome percentages (Level 0 / Level 1) or flagged at-risk by machine learning predictions.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isLoading}
            className="px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-navy-900/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Scanning Attainment Database...' : 'Generate Alerts'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Alerts Table Card */}
      <div className="academic-card overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Total Alerts ({alerts.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, alert, or code..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-600 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-navy-600"
              >
                <option value="ALL">All Severities</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full academic-table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Student Details</th>
                <th>Alert Classification</th>
                <th>Diagnostic Message</th>
                <th>Severity</th>
                <th>Generated Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading academic alerts...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No alerts match your filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((alert, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={alert.alert_id || idx}>
                      <td className="font-mono text-xs text-slate-400">{globalIdx}</td>
                      <td>
                        <div className="font-semibold text-slate-900">{alert.student_name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{alert.enrollment_no}</div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {alert.alert_type}
                        </span>
                        {alert.co_id && (
                          <span className="ml-1 text-[11px] text-amber-700 font-semibold font-mono">
                            CO{alert.co_id}
                          </span>
                        )}
                      </td>
                      <td className="max-w-md">
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {alert.message}
                        </p>
                      </td>
                      <td>
                        <Badge type="severity" value={alert.severity} />
                      </td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredAlerts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, filteredAlerts.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{filteredAlerts.length}</span> alerts
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
