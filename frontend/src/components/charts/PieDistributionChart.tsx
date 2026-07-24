import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieDistributionChartProps {
  data: any[];
}

const COLORS = {
  'Low Risk': '#10B981',      // Muted Green
  'Medium Risk': '#F59E0B',   // Muted Amber
  'High Risk': '#F97316',     // Muted Orange
  'Critical Risk': '#EF4444'  // Muted Red
};

const PieDistributionChart: React.FC<PieDistributionChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieDistributionChart;
