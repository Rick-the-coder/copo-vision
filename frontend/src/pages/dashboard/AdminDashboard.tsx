import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
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
    { name: 'Total Users', value: statsData?.users || 0, icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Departments', value: statsData?.departments || 0, icon: <Building2 className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Courses', value: statsData?.courses || 0, icon: <BookOpen className="w-6 h-6" />, color: 'bg-teal-50 text-teal-600' },
    { name: 'Subjects', value: statsData?.subjects || 0, icon: <GraduationCap className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
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
      <div className="flex h-64 items-center justify-center text-red-500 font-semibold">
        Error loading dashboard statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user.name}! 👋</h2>
          <p className="text-slate-500 mt-1">Here is the overview of your institution's master data.</p>
        </div>
        <div className="hidden sm:block">
           <span className="inline-flex items-center rounded-md bg-accent/10 px-3 py-1 text-sm font-medium text-accent ring-1 ring-inset ring-accent/20">
             {user.role} Access
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
             <div className="text-slate-500 flex items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                 No recent activity found.
             </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
             <div className="space-y-3">
                 <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                     + Add New User
                 </button>
                 <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                     + Create Department
                 </button>
                 <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                     + Generate Report
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
