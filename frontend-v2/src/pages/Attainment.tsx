import React, { useEffect, useState, useMemo } from 'react';
import api from '../config/api';
import { COAttainmentRecord, POAttainmentRecord } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Award,
  Target,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const Attainment: React.FC = () => {
  const [activeView, setActiveView] = useState<'CO' | 'PO'>('CO');
  const [coRecords, setCoRecords] = useState<COAttainmentRecord[]>([]);
  const [poRecords, setPoRecords] = useState<POAttainmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [coRes, poRes] = await Promise.all([
        api.get('/api/copo/attainment'),
        api.get('/api/copo/po-attainment'),
      ]);

      if (coRes.data.status === 'success') {
        setCoRecords(coRes.data.attainment || []);
      }
      if (poRes.data.status === 'success') {
        setPoRecords(poRes.data.attainment || []);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to fetch attainment records',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setNotification(null);
    try {
      const res = await api.post('/api/copo/calculate');
      if (res.data.status === 'success') {
        setNotification({
          type: 'success',
          message: `Attainment recalculated successfully! CO records: ${res.data.co_records_written}, PO records: ${res.data.po_records_written}`,
        });
        await fetchData();
      } else {
        setNotification({
          type: 'error',
          message: res.data.message || 'Calculation completed with errors',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Recalculation failed',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Filtered dataset
  const currentDataset = activeView === 'CO' ? coRecords : poRecords;

  const filteredRecords = useMemo(() => {
    return currentDataset.filter((row: any) => {
      const matchesSearch =
        row.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.enrollment_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.co_code && row.co_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (row.po_id && `PO${row.po_id}`.toLowerCase().includes(searchQuery.toLowerCase()));

      const levelStr = String(row.attainment_level);
      const matchesLevel =
        levelFilter === 'ALL' ||
        (levelFilter === '3' && parseFloat(levelStr) >= 3.0) ||
        (levelFilter === '2' && parseFloat(levelStr) >= 2.0 && parseFloat(levelStr) < 3.0) ||
        (levelFilter === '1' && parseFloat(levelStr) >= 1.0 && parseFloat(levelStr) < 2.0) ||
        (levelFilter === '0' && parseFloat(levelStr) < 1.0);

      return matchesSearch && matchesLevel;
    });
  }, [currentDataset, searchQuery, levelFilter]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  // Reset page on filter or view change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, searchQuery, levelFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header Card & Recalculate Trigger */}
      <div className="academic-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-amber-50/20">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>OBE Outcome Attainment Matrix</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Course & Program Outcome Direct Evaluation
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Calculated from student assessment marks against target score thresholds (NBA 3-level attainment rubric).
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleCalculate}
            disabled={isCalculating || isLoading}
            className="px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-navy-900/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>{isCalculating ? 'Computing Attainment...' : 'Recalculate Attainment'}</span>
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

      {/* Main Table Card */}
      <div className="academic-card overflow-hidden">
        {/* Controls Bar: Toggle, Search, Filter */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* CO / PO View Toggle */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg shrink-0">
            <button
              onClick={() => setActiveView('CO')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeView === 'CO'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-navy-700" />
              <span>Course Outcomes (CO)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600">
                {coRecords.length}
              </span>
            </button>
            <button
              onClick={() => setActiveView('PO')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeView === 'PO'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-navy-700" />
              <span>Program Outcomes (PO)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600">
                {poRecords.length}
              </span>
            </button>
          </div>

          {/* Search and Level Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or outcome..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-600 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-navy-600"
              >
                <option value="ALL">All Levels</option>
                <option value="3">Level 3 (High)</option>
                <option value="2">Level 2 (Moderate)</option>
                <option value="1">Level 1 (Low)</option>
                <option value="0">Level 0 (Unattained)</option>
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
                <th>{activeView === 'CO' ? 'Course Outcome (CO)' : 'Program Outcome (PO)'}</th>
                <th>Attainment Percentage</th>
                <th>Rubric Attainment Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading attainment records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No attainment records match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record: any, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const outcomeTag =
                    activeView === 'CO'
                      ? record.co_code || `CO${record.co_id}`
                      : `PO${record.po_id}`;

                  const percentVal = parseFloat(String(record.attainment_percentage || 0));

                  return (
                    <tr key={record.co_attainment_id || record.po_attainment_id || idx}>
                      <td className="font-mono text-xs text-slate-400">{globalIdx}</td>
                      <td className="font-semibold text-slate-900">{record.student_name}</td>
                      <td className="font-mono text-xs text-slate-600 font-medium">
                        {record.enrollment_no}
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-navy-50 text-navy-900 border border-navy-200">
                          {outcomeTag}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 font-mono text-xs">
                            {percentVal.toFixed(2)}%
                          </span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentVal >= 70
                                  ? 'bg-emerald-500'
                                  : percentVal >= 60
                                  ? 'bg-blue-500'
                                  : percentVal >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, percentVal)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge type="level" value={record.attainment_level} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, filteredRecords.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{filteredRecords.length}</span> records
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
