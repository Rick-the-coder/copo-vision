import React, { useEffect, useState, useMemo } from 'react';
import api from '../config/api';
import { PredictionRecord } from '../types';
import { Badge } from '../components/common/Badge';
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';

export const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelInfo, setModelInfo] = useState<{ algorithm?: string; accuracy?: number } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/predictions/');
      if (res.data.status === 'success') {
        setPredictions(res.data.predictions || []);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to fetch predictions',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNotification(null);
    try {
      const res = await api.post('/api/predictions/generate');
      if (res.data.status === 'success') {
        setModelInfo({
          algorithm: res.data.model?.algorithm || 'Linear Regression',
          accuracy: res.data.model?.accuracy,
        });
        setNotification({
          type: 'success',
          message: `Predictions generated successfully for ${res.data.total_predictions} students! Model Accuracy: ${res.data.model?.accuracy}%`,
        });
        await fetchPredictions();
      } else {
        setNotification({
          type: 'error',
          message: res.data.message || 'Generation failed',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to trigger prediction pipeline',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      const matchesSearch =
        (p.student_name && p.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.enrollment_no && p.enrollment_no.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        p.prediction_status?.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [predictions, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredPredictions.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPredictions.slice(start, start + pageSize);
  }, [filteredPredictions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Banner & Trigger Button */}
      <div className="academic-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-sky-50/20">
        <div>
          <div className="flex items-center space-x-2 text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Machine Learning Predictive Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Program Outcome Achievement Forecast
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Trains a supervised Linear Regression model on current Course Outcome attainments to project final Program Outcome achievement and isolate at-risk candidates for early intervention.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isLoading}
            className="px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-navy-900/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Training Model & Forecasting...' : 'Generate ML Predictions'}</span>
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

      {/* Predictions Table Card */}
      <div className="academic-card overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Prediction Records ({predictions.length} Total)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or enrollment..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-600 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-navy-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="GOOD">Good Attainment (&ge;75%)</option>
                <option value="AVERAGE">Average (60%-74%)</option>
                <option value="AT_RISK">At-Risk (&lt;60%)</option>
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
                <th>Student Name</th>
                <th>Enrollment No</th>
                <th>Current CO Attainment</th>
                <th>Forecasted PO Attainment</th>
                <th>Projected Status</th>
                <th>Model Version</th>
                <th>Forecast Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading ML predictions...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No predictions match your search criteria. Click "Generate ML Predictions" above to build models.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const coVal = parseFloat(String(item.predicted_co_attainment || 0));
                  const poVal = parseFloat(String(item.predicted_po_attainment || 0));

                  return (
                    <tr key={item.prediction_id || idx}>
                      <td className="font-mono text-xs text-slate-400">{globalIdx}</td>
                      <td className="font-semibold text-slate-900">{item.student_name || `Student #${item.student_id}`}</td>
                      <td className="font-mono text-xs text-slate-600 font-medium">
                        {item.enrollment_no || `ID-${item.student_id}`}
                      </td>
                      <td>
                        <span className="font-mono font-semibold text-xs text-slate-800">
                          {coVal.toFixed(2)}%
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {poVal.toFixed(2)}%
                          </span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                poVal >= 75
                                  ? 'bg-emerald-500'
                                  : poVal >= 60
                                  ? 'bg-sky-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, poVal)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge type="prediction" value={item.prediction_status} />
                      </td>
                      <td className="text-xs text-slate-500 font-mono">
                        Model #{item.model_id || '1'} (LR)
                      </td>
                      <td className="text-xs text-slate-500">
                        {item.predicted_at ? new Date(item.predicted_at).toLocaleString() : 'Recent'}
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
              {filteredPredictions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, filteredPredictions.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{filteredPredictions.length}</span> predictions
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
