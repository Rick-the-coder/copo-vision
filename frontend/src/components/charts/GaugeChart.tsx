import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GaugeChartProps {
  score: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ score }) => {
  // We use a half pie chart to simulate a gauge
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  
  const COLORS = ['#10b981', '#f1f5f9']; // Emerald for score, slate for remaining
  if (score < 50) COLORS[0] = '#ef4444'; // Red if low
  else if (score < 70) COLORS[0] = '#f59e0b'; // Amber if medium

  return (
    <div className="w-full h-48 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%" // Shift down so it's a half circle at the bottom
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 text-center w-full">
        <span className="text-3xl font-black text-slate-800">{score}%</span>
        <p className="text-xs text-slate-500 font-medium">Overall Attainment</p>
      </div>
    </div>
  );
};

export default GaugeChart;
