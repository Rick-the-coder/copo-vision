import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { 
  LayoutDashboard, Users, BookOpen, LogOut, Menu, X, GraduationCap, Building2, 
  Calendar, Settings, PlayCircle, Database, BrainCircuit, Activity, BarChart2,
  ChevronDown, Search, Bell, ChevronLeft, ChevronRight
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const DashboardLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const allowedItems = (role: string) => {
    switch (role) {
      case 'ADMIN': return ['Dashboard', 'Departments', 'Faculty', 'Students', 'Subjects', 'Marks Entry', 'Program Outcomes', 'Course Outcomes', 'CO-PO Mapping'];
      case 'HOD': return ['Dashboard', 'Faculty', 'Students', 'Subjects', 'Marks Entry', 'Program Outcomes', 'Course Outcomes', 'CO-PO Mapping'];
      case 'FACULTY': return ['Dashboard', 'Students', 'Subjects', 'Marks Entry', 'Course Outcomes', 'CO-PO Mapping'];
      default: return ['Dashboard'];
    }
  };

  const navGroups = [
    {
      label: "Overview",
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
      ]
    },
    {
      label: "Academic Management",
      items: [
        { name: 'Departments', path: '/dashboard/departments', icon: <Building2 className="w-[18px] h-[18px]" /> },
        { name: 'Courses', path: '/dashboard/courses', icon: <GraduationCap className="w-[18px] h-[18px]" /> },
        { name: 'Subjects', path: '/dashboard/subjects', icon: <BookOpen className="w-[18px] h-[18px]" /> },
        { name: 'Academic Years', path: '/dashboard/academic-years', icon: <Calendar className="w-[18px] h-[18px]" /> },
      ]
    },
    {
      label: "Assessment Management",
      items: [
        { name: 'Assessments', path: '/dashboard/assessments', icon: <Activity className="w-[18px] h-[18px]" /> },
        { name: 'Question Bank', path: '/dashboard/question-bank', icon: <Database className="w-[18px] h-[18px]" /> },
        { name: 'Marks Entry', path: '/dashboard/marks-entry', icon: <Users className="w-[18px] h-[18px]" /> },
      ]
    },
    {
      label: "Outcome Management",
      items: [
        { name: 'Course Outcomes', path: '/dashboard/course-outcomes', icon: <BookOpen className="w-[18px] h-[18px]" /> },
        { name: 'CO-PO Mapping', path: '/dashboard/co-po-mapping', icon: <Settings className="w-[18px] h-[18px]" /> },
        { name: 'CO Attainment', path: '/dashboard/calculate-co', icon: <BarChart2 className="w-[18px] h-[18px]" /> },
        { name: 'PO Attainment', path: '/dashboard/calculate-po', icon: <BarChart2 className="w-[18px] h-[18px]" /> },
      ]
    },
    {
      label: "Analytics & AI",
      items: [
        { name: 'Analytics', path: '/dashboard/analytics-dashboard', icon: <Activity className="w-[18px] h-[18px]" /> },
        { name: 'Prediction', path: '/dashboard/ml-prediction', icon: <BrainCircuit className="w-[18px] h-[18px]" /> },
      ]
    },
    {
      label: "System",
      items: [
        { name: 'Reports', path: '/dashboard/reports', icon: <Database className="w-[18px] h-[18px]" /> },
        { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-[18px] h-[18px]" /> },
      ]
    }
  ].map(group => ({
    ...group,
    items: group.items // Allowing all roles to see all for now to demonstrate 50% frontend.
  })).filter(group => group.items.length > 0);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  return (
    <div className="h-screen flex font-sans bg-[#F8FAFC] overflow-hidden text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Enterprise Sidebar */}
      <aside className={`
        relative z-30 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 absolute inset-y-0 left-0 w-64' : '-translate-x-full absolute inset-y-0 left-0 w-64 lg:static lg:translate-x-0'}
        ${isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}
      `}>
        {/* Brand Area */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200 justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            {!isSidebarCollapsed && <span className="text-sm font-bold tracking-tight text-slate-900 truncate">COPO Vision</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6 last:mb-0">
              {!isSidebarCollapsed && (
                <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </h3>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      title={isSidebarCollapsed ? item.name : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150 relative group
                        ${isActive 
                          ? 'bg-[#F3F4F6] text-[#111827]' 
                          : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'}
                        ${isSidebarCollapsed ? 'justify-center px-0 py-2' : ''}
                      `}
                    >
                      <span className={`shrink-0 ${isActive ? 'text-[#111827]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]'}`}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Actions Area */}
        <div className="p-3 border-t border-slate-200 shrink-0">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
            {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Enterprise Top Header */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-[#6B7280] hover:text-[#111827]">
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center text-[13px] text-slate-500 font-medium">
               <span>COPO Vision</span>
               <span className="mx-2 text-slate-300">/</span>
               <span className="text-slate-800 capitalize">
                 {location.pathname === '/dashboard' ? 'Overview' : location.pathname.split('/').pop()?.replace(/-/g, ' ')}
               </span>
            </div>

            {/* Global Search */}
            <div className="hidden md:flex items-center w-full max-w-sm relative ml-4">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full bg-[#F3F4F6] border border-transparent focus:bg-white focus:border-[#E5E7EB] focus:ring-1 focus:ring-gray-200 text-[13px] rounded-md pl-9 pr-4 py-1.5 transition-all duration-150 outline-none text-[#111827] placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5 ml-4">
            {/* Notifications */}
            <button className="text-[#9CA3AF] hover:text-[#111827] relative transition-colors duration-150">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
            </button>
            
            <div className="h-4 w-px bg-[#E5E7EB] hidden sm:block"></div>
            
            {/* User Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-[#F9FAFB] p-1 rounded-md transition-colors duration-150"
              >
                <div className="h-7 w-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111827] font-semibold text-xs border border-[#E5E7EB]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-medium text-[#111827] leading-none">{user.name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#9CA3AF] hidden sm:block" />
              </button>
              
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-[10px] shadow-lg border border-[#E5E7EB] z-20 py-1">
                    <div className="px-4 py-3 border-b border-[#F3F4F6]">
                      <p className="text-[13px] text-[#111827] font-medium">{user.name}</p>
                      <p className="text-[12px] text-[#6B7280] truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/dashboard/settings" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-[13px] text-[#111827] hover:bg-[#F9FAFB]">Profile Settings</Link>
                    </div>
                    <div className="py-1 border-t border-[#F3F4F6]">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-[13px] text-[#EF4444] hover:bg-[#FEF2F2] font-medium">
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto relative">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            <Outlet context={{ user }} />
          </div>
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
