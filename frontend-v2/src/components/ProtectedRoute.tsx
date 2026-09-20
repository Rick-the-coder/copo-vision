import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="flex items-center space-x-3 mb-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-slate-100">COPO-VISION</div>
            <div className="text-xs text-amber-400 font-medium tracking-widest uppercase">Institutional Portal</div>
          </div>
        </div>
        <div className="text-sm text-slate-400">Authenticating institutional session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
