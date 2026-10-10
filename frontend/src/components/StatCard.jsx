import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass, bgClass }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}