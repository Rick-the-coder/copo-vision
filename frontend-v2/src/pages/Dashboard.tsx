import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { DashboardSummary } from '../types';
import { StatCard } from '../components/common/StatCard';
import {
  Users,
  Award,
  Target,
  AlertTriangle,
  Bell,
  AlertCircle,
  Clock,
  ShieldCheck,
  UploadCloud,
  TrendingUp,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/dashboard/summary');
      if (response.data.status === 'success' && response.data.dashboard) {
        setSummary(response.data.dashboard);
      } else {
        setError('Unexpected response structure from backend');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Institutional Department Banner */}
      <div className="bg-gradient-to-r from-[#0c1d37] via-[#162a4d] to-[#204374] rounded-2xl p-6 text-white shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>National Board of Accreditation (NBA) Compliant System</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Outcome-Based Education Academic Dashboard
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Continuous quality improvement (CQI) monitoring system for Course Outcomes (CO) & Program Outcomes (PO) attainment, predictive academic risk forecasting, and automated student alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchSummary}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold border border-slate-600/60 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
          <Link
            to="/upload-marks"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-md shadow-amber-500/20 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest Marks</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSummary}
            className="text-xs font-semibold text-rose-700 underline hover:text-rose-900"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Primary Stat Cards Grid (8 required metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <StatCard
          title="Total Enrolled Students"
          value={isLoading ? '...' : (summary?.total_students ?? 0)}
          subtitle="Department of Computer Science"
          icon={Users}
          variant="navy"
          badgeText="Active Cohort"
        />

        {/* Average CO Attainment */}
        <StatCard
          title="Average CO Attainment"
          value={isLoading ? '...' : `${summary?.average_co_attainment ?? 0}%`}
          subtitle="Target NBA Benchmark: >= 60.0%"
          icon={Award}
          variant={(summary?.average_co_attainment ?? 0) >= 60 ? 'emerald' : 'amber'}
          badgeText={(summary?.average_co_attainment ?? 0) >= 60 ? 'Attained' : 'Deficient'}
        />

        {/* Average PO Attainment */}
        <StatCard
          title="Average PO Attainment"
          value={isLoading ? '...' : `${summary?.average_po_attainment ?? 0}%`}
          subtitle="Direct Program Outcomes Level 2.0"
          icon={Target}
          variant={(summary?.average_po_attainment ?? 0) >= 60 ? 'emerald' : 'amber'}
          badgeText={(summary?.average_po_attainment ?? 0) >= 60 ? 'Attained' : 'Deficient'}
        />

        {/* At-Risk Students */}
        <StatCard
          title="Students At-Risk"
          value={isLoading ? '...' : (summary?.at_risk_students ?? 0)}
          subtitle="Requires Academic Remediation"
          icon={AlertTriangle}
          variant="rose"
          badgeText="Critical Alert"
        />

        {/* Total Alerts */}
        <StatCard
          title="Total System Alerts"
          value={isLoading ? '...' : (summary?.total_alerts ?? 0)}
          subtitle="Generated by Attainment & Prediction rules"
          icon={Bell}
          variant="slate"
        />

        {/* High Severity Alerts */}
        <StatCard
          title="High Severity Alerts"
          value={isLoading ? '...' : (summary?.high_alerts ?? 0)}
          subtitle="Level 0 attainment (< 50%) or severe deficiency"
          icon={AlertCircle}
          variant="rose"
          badgeText="Priority 1"
        />

        {/* Medium Severity Alerts */}
        <StatCard
          title="Medium Severity Alerts"
          value={isLoading ? '...' : (summary?.medium_alerts ?? 0)}
          subtitle="Level 1 attainment (50%–59%)"
          icon={AlertTriangle}
          variant="amber"
          badgeText="Priority 2"
        />

        {/* Unread Alerts */}
        <StatCard
          title="Unread Action Items"
          value={isLoading ? '...' : (summary?.unread_alerts ?? 0)}
          subtitle="Awaiting faculty review & remediation"
          icon={Clock}
          variant="navy"
          badgeText="Pending"
        />
      </div>

      {/* Academic Benchmarking & OBE Accreditation Standards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attainment Levels Reference */}
        <div className="academic-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Institutional OBE Attainment Scale & NBA Standards
              </h3>
              <p className="text-xs text-slate-500">
                Criterion 3: Course Outcomes & Criterion 4: Students' Performance
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
              3-Level Rubric
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  3.0
                </span>
                <div>
                  <div className="text-xs font-bold text-emerald-950">Level 3 · High Attainment</div>
                  <div className="text-[11px] text-emerald-800">&ge; 70% students score &ge; 60% marks in mapped assessment questions</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">Satisfies Accreditation Threshold</span>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  2.0
                </span>
                <div>
                  <div className="text-xs font-bold text-blue-950">Level 2 · Moderate Attainment</div>
                  <div className="text-[11px] text-blue-800">60% to 69% students score &ge; 60% marks in mapped assessment questions</div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700">Target Standard Met</span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                  1.0
                </span>
                <div>
                  <div className="text-xs font-bold text-amber-950">Level 1 · Low Attainment</div>
                  <div className="text-[11px] text-amber-800">50% to 59% students score &ge; 60% marks in mapped assessment questions</div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700">Remedial Action Required</span>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                  0.0
                </span>
                <div>
                  <div className="text-xs font-bold text-rose-950">Level 0 · Unattained</div>
                  <div className="text-[11px] text-rose-800">&lt; 50% students score &ge; 60% marks (Critical Deficiency)</div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700">High Severity Alert Triggered</span>
            </div>
          </div>
        </div>

        {/* Quick Academic Actions */}
        <div className="academic-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight pb-3 mb-4 border-b border-slate-100">
              Departmental Quick Actions
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/upload-marks"
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-800 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <UploadCloud className="w-4 h-4 text-navy-700 group-hover:text-amber-600 transition-colors" />
                  <span>Upload Examination Marks (.xlsx)</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700">&rarr;</span>
              </Link>

              <Link
                to="/attainment"
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-800 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4 text-navy-700 group-hover:text-amber-600 transition-colors" />
                  <span>View CO & PO Attainment Tables</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700">&rarr;</span>
              </Link>

              <Link
                to="/predictions"
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-800 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <TrendingUp className="w-4 h-4 text-navy-700 group-hover:text-amber-600 transition-colors" />
                  <span>Run Student Performance Predictor</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700">&rarr;</span>
              </Link>

              <Link
                to="/alerts"
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-800 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-navy-700 group-hover:text-amber-600 transition-colors" />
                  <span>Review High Severity Alerts</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700">&rarr;</span>
              </Link>

              <Link
                to="/question-classifier"
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-800 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-navy-700 group-hover:text-amber-600 transition-colors" />
                  <span>Bloom's Taxonomy NLP Classifier</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
            <span>OBE Calculation Engine Synced with live database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
