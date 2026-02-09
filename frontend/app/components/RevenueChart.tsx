"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 40000 },
  { month: "Feb", revenue: 60000 },
  { month: "Mar", revenue: 75000 },
  { month: "Apr", revenue: 90000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white p-4 shadow rounded-xl">
      <h3 className="text-lg font-bold mb-2">Monthly Revenue (KES)</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
