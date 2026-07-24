import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Download, Filter } from 'lucide-react';
import api from '../services/api';

import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';

import SummaryCards from '../components/Dashboard/SummaryCards';
import RadarChart from '../components/charts/RadarChart';
import GaugeChart from '../components/charts/GaugeChart';
import PieDistributionChart from '../components/charts/PieDistributionChart';
import COTrendChart from '../components/charts/COTrendChart';

const AnalyticsDashboard = () => {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({ queryKey: ['analytics-summary'], queryFn: async () => (await api.get('/analytics/summary')).data });
  const { data: radarData, isLoading: isRadarLoading } = useQuery({ queryKey: ['analytics-radar'], queryFn: async () => (await api.get('/analytics/po-radar')).data });
  const { data: riskData, isLoading: isRiskLoading } = useQuery({ queryKey: ['analytics-risk'], queryFn: async () => (await api.get('/analytics/risk-distribution')).data });
  const { data: coData, isLoading: isCoLoading } = useQuery({ queryKey: ['analytics-co-trends'], queryFn: async () => (await api.get('/analytics/co-trends')).data });

  if (isSummaryLoading || isRadarLoading || isRiskLoading || isCoLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics Overview" 
        description="High-level insights into program outcomes, student risk, and trajectory."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Analytics' }
        ]}
        actions={
          <>
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>Filter</Button>
            <Button variant="primary" icon={<Download className="w-4 h-4" />}>Export Report</Button>
          </>
        }
      />

      <SummaryCards data={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <Card noPadding className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department PO Alignment</CardTitle>
            <span className="text-[12px] text-[#6B7280] font-medium">Last 30 days</span>
          </CardHeader>
          <div className="p-6 h-[340px]">
            <RadarChart data={radarData} />
          </div>
        </Card>

        {/* Column for Gauge & Pie */}
        <div className="lg:col-span-1 space-y-6">
          <Card noPadding>
            <CardHeader><CardTitle>Target Health</CardTitle></CardHeader>
            <div className="p-6 h-[170px]">
              <GaugeChart score={summary?.average_po_attainment || 0} />
            </div>
          </Card>
          
          <Card noPadding>
            <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
            <div className="p-4 h-[170px]">
              <PieDistributionChart data={riskData} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card noPadding>
          <CardHeader>
            <CardTitle>Historical CO Attainment</CardTitle>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">CO1</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">CO2</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">CO3</span>
            </div>
          </CardHeader>
          <div className="p-6 h-[340px]">
            <COTrendChart data={coData} />
          </div>
        </Card>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
