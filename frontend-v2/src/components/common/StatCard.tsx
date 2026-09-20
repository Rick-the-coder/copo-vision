import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'navy' | 'amber' | 'emerald' | 'rose' | 'slate';
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'navy',
  badgeText,
}) => {
  const variantStyles = {
    navy: {
      border: 'border-l-4 border-l-navy-700',
      iconBg: 'bg-navy-50 text-navy-800 border-navy-200',
      accent: 'text-navy-900',
    },
    amber: {
      border: 'border-l-4 border-l-amber-600',
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
      accent: 'text-amber-900',
    },
    emerald: {
      border: 'border-l-4 border-l-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accent: 'text-emerald-900',
    },
    rose: {
      border: 'border-l-4 border-l-rose-600',
      iconBg: 'bg-rose-50 text-rose-800 border-rose-200',
      accent: 'text-rose-900',
    },
    slate: {
      border: 'border-l-4 border-l-slate-600',
      iconBg: 'bg-slate-100 text-slate-800 border-slate-200',
      accent: 'text-slate-900',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`academic-card p-5 ${style.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold tracking-tight ${style.accent}`}>
              {value}
            </span>
            {badgeText && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {badgeText}
              </span>
            )}
          </div>
        </div>
        <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${style.iconBg} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
