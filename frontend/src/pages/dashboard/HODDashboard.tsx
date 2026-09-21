import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, Users, CheckCircle, AlertCircle, ArrowUpRight, 
  BarChart3, Award, Network, FileCheck, Layers 
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const HODDashboard = ({ user }: { user: User }) => {
  const { data: radarData } = useQuery({
    queryKey: ['analytics-radar'],
    queryFn: async () => (await api.get('/analytics/po-radar')).data
  });

  const { data: faculty } = useQuery({
    queryKey: ['faculty'],
    queryFn: async () => (await api.get('/faculty')).data
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/subjects')).data
  });

  const departmentRadar = radarData || [
    { subject: 'PO1 Eng. Knowledge', A: 85, fullMark: 100 },
    { subject: 'PO2 Problem Analysis', A: 78, fullMark: 100 },
    { subject: 'PO3 Design Solutions', A: 82, fullMark: 100 },
    { subject: 'PO4 Investigations', A: 74, fullMark: 100 },
    { subject: 'PO5 Modern Tools', A: 88, fullMark: 100 },
    { subject: 'PO6 Society & Eng', A: 70, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 mb-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Department Leadership &amp; OBE Oversight
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {user?.name || 'Dr. Ramesh Sharma'} (HOD)
            </h1>
            <p className="text-indigo-200/90 text-sm mt-1 max-w-xl">
              Department of Computer Science &amp; Engineering | NBA Tier-1 Accreditation Oversight
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/dashboard/co-po-mapping"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Network className="w-4 h-4" /> Review CO-PO Matrix
            </Link>
            <Link 
              to="/dashboard/calculate-po"
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" /> Calculate Dept PO
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dept Average PO</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">2.58 / 3.0</h3>
            <span className="text-xs font-medium text-emerald-600 mt-1 inline-block">86.0% (NBA Target Met)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Faculty Members</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{faculty?.length || 12} Active</h3>
            <span className="text-xs font-medium text-slate-500 mt-1 inline-block">100% Workload Assigned</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Subjects</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{subjects?.length || 8} Courses</h3>
            <span className="text-xs font-medium text-indigo-600 mt-1 inline-block">48 COs Configured</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">2 Submissions</h3>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              Requires HOD Sign-off
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Department PO Radar & Attainment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Department PO Attainment Radar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">CSE Department PO Alignment Radar</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live attainment distribution against NBA graduate attributes</p>
            </div>
            <Link to="/dashboard/analytics-dashboard" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={departmentRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Radar name="Dept Attainment (%)" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Faculty Evaluation Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Faculty Marks Submission</h2>
            <p className="text-xs text-slate-500 mt-0.5">Evaluation progress across courses</p>
          </div>

          <div className="space-y-4 my-4">
            {[
              { faculty: 'Prof. Amit Verma', subject: 'CS501 DBMS', progress: 100, status: 'Completed' },
              { faculty: 'Dr. Priya Sharma', subject: 'CS502 OS', progress: 85, status: 'In Progress' },
              { faculty: 'Prof. Rajiv Mehta', subject: 'CS503 CN', progress: 60, status: 'Pending IA2' },
              { faculty: 'Dr. S. K. Gupta', subject: 'CS504 DAA', progress: 100, status: 'Completed' },
            ].map((f, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{f.faculty} <span className="text-slate-500 font-normal">({f.subject})</span></span>
                  <span className={f.progress === 100 ? 'text-emerald-600' : 'text-blue-600'}>{f.status}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${f.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                    style={{ width: `${f.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-medium">NBA Criterion 3 Attainment Readiness:</span>
            <strong className="text-indigo-700 font-bold text-sm">88.5%</strong>
          </div>
        </div>

      </div>

      {/* Approval & Action Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">Pending Department Approvals &amp; Matrix Submissions</h3>
        <div className="divide-y divide-slate-100">
          {[
            { course: 'CS501 - Database Systems', faculty: 'Prof. Amit Verma', type: 'CO-PO Mapping Matrix Update', date: 'Today at 10:30 AM' },
            { course: 'CS502 - Operating Systems', faculty: 'Dr. Priya Sharma', type: 'Internal Assessment 1 Marks Freeze', date: 'Yesterday' },
          ].map((item, i) => (
            <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-semibold text-slate-800">{item.course}</h5>
                <p className="text-xs text-slate-500">{item.type} • Submitted by {item.faculty} ({item.date})</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Review Data
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
                  Approve &amp; Lock
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
