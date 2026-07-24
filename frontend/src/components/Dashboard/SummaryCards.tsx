import React from 'react';
import { Users, BookOpen, Target, Activity } from 'lucide-react';
import { Card } from '../ui/Card';

interface SummaryCardsProps {
  data: any;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <Card noPadding className="p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-[#6B7280]">AI Predictions</p>
          <Activity className="w-4 h-4 text-[#2563EB]" />
        </div>
        <div>
          <h4 className="text-[28px] font-semibold text-[#111827] tracking-tight leading-none">{data?.total_predictions_run || 0}</h4>
          <p className="mt-2 text-[12px] font-medium text-[#10B981]">
            +12% from last week
          </p>
        </div>
      </Card>

      <Card noPadding className="p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-[#6B7280]">Target Health</p>
          <Target className="w-4 h-4 text-[#9CA3AF]" />
        </div>
        <div>
          <h4 className="text-[28px] font-semibold text-[#111827] tracking-tight leading-none">{data?.average_po_attainment || 0}%</h4>
          <p className="mt-2 text-[12px] text-[#6B7280]">
            Average PO Attainment
          </p>
        </div>
      </Card>

      <Card noPadding className="p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-[#6B7280]">Students Tracked</p>
          <Users className="w-4 h-4 text-[#9CA3AF]" />
        </div>
        <div>
          <h4 className="text-[28px] font-semibold text-[#111827] tracking-tight leading-none">{data?.active_students || 0}</h4>
          <p className="mt-2 text-[12px] text-[#6B7280]">
            Across 4 active batches
          </p>
        </div>
      </Card>

      <Card noPadding className="p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-[#6B7280]">Courses Analyzed</p>
          <BookOpen className="w-4 h-4 text-[#9CA3AF]" />
        </div>
        <div>
          <h4 className="text-[28px] font-semibold text-[#111827] tracking-tight leading-none">{data?.courses_analyzed || 0}</h4>
          <p className="mt-2 text-[12px] text-[#6B7280]">
            Live correlation data
          </p>
        </div>
      </Card>

    </div>
  );
};

export default SummaryCards;
