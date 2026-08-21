import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, BookOpen, GraduationCap, Loader2, BarChart2, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const fetchStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};

const AdminDashboard = () => {
  const { user } = useOutletContext<{ user: User }>();

  const { data: statsData, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
  });

  const stats = [
    { name: 'Total Departments', value: statsData?.departments || 0, icon: <Building2 className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Total Courses', value: statsData?.courses || 0, icon: <GraduationCap className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Total Subjects', value: statsData?.subjects || 0, icon: <BookOpen className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
    { name: 'Total Students', value: statsData?.students || 0, icon: <Users className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Total Faculty', value: statsData?.faculty || 0, icon: <Users className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600' },
    { name: 'Avg CO Attainment', value: `${statsData?.avg_co_attainment || 0}%`, icon: <BarChart2 className="w-5 h-5" />, color: 'bg-teal-50 text-teal-600' },
    { name: 'Avg PO Attainment', value: `${statsData?.avg_po_attainment || 0}%`, icon: <BarChart2 className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
    { name: 'Assessments Done', value: statsData?.assessments_completed || 0, icon: <Activity className="w-5 h-5" />, color: 'bg-cyan-50 text-cyan-600' },
  ];

  const coAttainmentData = [
    { semester: 'Sem 1', attainment: 65 },
    { semester: 'Sem 2', attainment: 70 },
    { semester: 'Sem 3', attainment: 68 },
    { semester: 'Sem 4', attainment: 75 },
    { semester: 'Sem 5', attainment: 78 },
  ];

  const studentPerformanceData = [
    { name: 'Excellent', value: 400, color: '#10B981' },
    { name: 'Good', value: 500, color: '#3B82F6' },
    { name: 'Average', value: 200, color: '#F59E0B' },
    { name: 'Needs Improvement', value: 100, color: '#EF4444' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500 font-medium bg-white rounded-2xl shadow-sm border border-slate-100">
        Error loading dashboard statistics. Please ensure the backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 mt-1 text-sm">Welcome back, {user.name}. Here's what's happening today.</p>
        </div>
        <div className="hidden sm:flex">
           <span className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-200">
             Role: <span className="text-primary ml-1">{user.role}</span>
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[13px] font-medium text-slate-500 mb-0.5">{stat.name}</p>
              <p className="text-xl font-bold text-slate-800 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-semibold text-slate-800">CO Attainment Trend</h3>
               <select className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-600">
                 <option>All Programs</option>
                 <option>B.Tech CSE</option>
               </select>
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={coAttainmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorAttainment" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                   <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Area type="monotone" dataKey="attainment" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorAttainment)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
             <h3 className="text-base font-semibold text-slate-800 mb-6">Student Performance Distribution</h3>
             <div className="h-64 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={studentPerformanceData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={90}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {studentPerformanceData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

