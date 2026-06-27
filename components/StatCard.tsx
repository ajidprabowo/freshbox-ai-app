import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'slate';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
}: StatCardProps) {
  // Styles for variants
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      textColor: 'text-emerald-700',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      iconBg: 'bg-blue-50 border-blue-100 text-blue-600',
      textColor: 'text-blue-700',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
      textColor: 'text-indigo-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
      textColor: 'text-amber-700',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
      textColor: 'text-rose-700',
    },
    slate: {
      bg: 'bg-slate-50 text-slate-600',
      border: 'border-slate-100',
      iconBg: 'bg-slate-50 border-slate-100 text-slate-600',
      textColor: 'text-slate-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex items-start justify-between`}>
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        <h3 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
          {value}
        </h3>
        <p className="text-xs font-medium text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className={`p-3 rounded-xl border ${style.iconBg} flex items-center justify-center`}>
        <Icon size={20} className="stroke-[2]" />
      </div>
    </div>
  );
}
