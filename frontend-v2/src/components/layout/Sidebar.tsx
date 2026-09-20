import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Award,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  LogOut,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navSections = [
    {
      group: 'INSTITUTIONAL OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'CURRICULUM & OBE ENGINE',
      items: [
        { name: 'Upload Marks', path: '/upload-marks', icon: UploadCloud },
        { name: 'CO / PO Attainment', path: '/attainment', icon: Award },
      ],
    },
    {
      group: 'AI & ACADEMIC ANALYTICS',
      items: [
        { name: 'Student Predictions', path: '/predictions', icon: TrendingUp },
        { name: 'Early-Warning Alerts', path: '/alerts', icon: AlertTriangle },
        { name: "Bloom's Question Classifier", path: '/question-classifier', icon: BookOpen },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-[#0c1d37] text-slate-200 flex flex-col min-h-screen border-r border-slate-800/80 select-none shadow-xl z-30">
      {/* Brand & Emblem */}
      <div className="p-5 border-b border-slate-800/80 bg-[#091528]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide flex items-center space-x-1.5">
              <span>COPO-VISION</span>
            </div>
            <div className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase">
              OBE Academic Portal
            </div>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
          <span>Accreditation Framework (NBA/NAAC)</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.group}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {section.group}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isActive
                              ? 'text-slate-950 translate-x-0.5'
                              : 'text-slate-500 opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Faculty Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#091528]/80">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
              {user?.full_name ? user.full_name.charAt(0) : 'F'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Faculty Member'}
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center space-x-1">
                <span className="capitalize">{user?.role || 'Faculty'}</span>
                <span>•</span>
                <span>@{user?.username || 'faculty1'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
