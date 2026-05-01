"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data - in a real scenario, we'll filter this from your LabResults state
const data = [
  { date: '2026-01', glucose: 95, cholesterol: 180 },
  { date: '2026-02', glucose: 110, cholesterol: 190 },
  { date: '2026-03', glucose: 102, cholesterol: 175 },
  { date: '2026-04', glucose: 98, cholesterol: 170 },
  { date: '2026-05', glucose: 92, cholesterol: 165 },
];

export default function HealthTrends() {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Vitals Analytics</h3>
        <p className="text-slate-500 text-sm font-medium">Tracking your metabolic health over time</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
            />
            <Tooltip 
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
            />
            <Legend iconType="circle" />
            <Line 
              type="monotone" 
              dataKey="glucose" 
              stroke="#3b82f6" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8 }}
              name="Glucose (mg/dL)"
            />
            <Line 
              type="monotone" 
              dataKey="cholesterol" 
              stroke="#10b981" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              name="Cholesterol"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}