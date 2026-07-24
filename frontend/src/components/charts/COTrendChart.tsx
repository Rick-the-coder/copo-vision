import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface COTrendChartProps {
  data: any[];
}

const COTrendChart: React.FC<COTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line type="monotone" dataKey="CO1" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="CO2" stroke="#64748B" strokeWidth={2} dot={{ r: 4, fill: '#64748B' }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="CO3" stroke="#94A3B8" strokeWidth={2} dot={{ r: 4, fill: '#94A3B8' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default COTrendChart;
