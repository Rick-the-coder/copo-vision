import React from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Server, BookCheck } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Academic Analytics Dashboard',
    subtitle: 'Institutional performance overview & attainment indicators',
  },
  '/upload-marks': {
    title: 'Assessment Marks Ingestion',
    subtitle: 'Upload marks spreadsheet (.xlsx) mapped to Course Outcomes',
  },
  '/attainment': {
    title: 'Course & Program Outcomes Attainment',
    subtitle: 'OBE direct attainment evaluation and student outcome matrices',
  },
  '/predictions': {
    title: 'Predictive Academic Analytics',
    subtitle: 'Machine learning forecasts for Program Outcome achievement',
  },
  '/alerts': {
    title: 'Early-Warning Academic Alerts',
    subtitle: 'Automated triggers for at-risk students and deficient outcomes',
  },
  '/question-classifier': {
    title: "Bloom's Taxonomy & CO Classifier",
    subtitle: 'Natural language classification of question cognitive levels',
  },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || {
    title: 'COPO-Vision Portal',
    subtitle: 'Outcome-Based Education Management System',
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-20 shadow-xs">
      <div className="px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {pageInfo.title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-navy-50 text-navy-800 border border-navy-200/80">
              <BookCheck className="w-3 h-3 mr-1 text-navy-700" />
              CSE Dept
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Academic Session Pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">AY 2025–26</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-semibold">Semester II</span>
          </div>

          {/* Backend Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Server className="w-3 h-3 text-emerald-600" />
            <span className="font-semibold">{API_BASE_URL.replace('http://', '')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
