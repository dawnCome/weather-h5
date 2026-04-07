"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyWeather } from '@/types/qweather';

export default function TrendChart({ data }: { data: DailyWeather[] }) {
  const chartData = data.map(item => ({
    date: item.fxDate.split('-').slice(1).join('/'),
    max: parseInt(item.tempMax),
    min: parseInt(item.tempMin),
  }));

  return (
    <div className="w-full h-[25vh] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} label={{ position: 'top', fontSize: 10, fill: '#ef4444' }} />
          <Line type="monotone" dataKey="min" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} label={{ position: 'bottom', fontSize: 10, fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}