import React from 'react';

interface BadgeProps {
  type: 'level' | 'severity' | 'prediction' | 'status';
  value: string | number;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  const valStr = String(value).toUpperCase();

  if (type === 'level') {
    const num = parseFloat(String(value));
    if (num >= 3.0) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}>
          Level {value} · High
        </span>
      );
    } else if (num >= 2.0) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}>
          Level {value} · Moderate
        </span>
      );
    } else if (num >= 1.0) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}>
          Level {value} · Low
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}>
          Level {value} · Unattained
        </span>
      );
    }
  }

  if (type === 'severity') {
    if (valStr === 'HIGH') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
          High Severity
        </span>
      );
    } else if (valStr === 'MEDIUM') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Medium Severity
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          Low Severity
        </span>
      );
    }
  }

  if (type === 'prediction') {
    if (valStr === 'GOOD') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Good Attainment
        </span>
      );
    } else if (valStr === 'AVERAGE') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5"></span>
          Average
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
          At-Risk
        </span>
      );
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 ${className}`}>
      {value}
    </span>
  );
};
