import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface AlertBadgeProps {
  type: string;
  message: string;
  severity?: 'warning' | 'critical';
}

export default function AlertBadge({ type, message, severity = 'warning' }: AlertBadgeProps) {
  const isCritical = severity === 'critical';

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium leading-relaxed animate-pulse ${
        isCritical
          ? 'bg-rose-50 border-rose-100 text-rose-800'
          : 'bg-amber-50 border-amber-100 text-amber-800'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isCritical ? (
          <ShieldAlert size={14} className="text-rose-600 stroke-[2.5]" />
        ) : (
          <AlertTriangle size={14} className="text-amber-600 stroke-[2.5]" />
        )}
      </div>
      <div>
        <span className="font-bold uppercase font-mono tracking-wider text-[10px] block leading-none mb-1">
          {type.replace(/_/g, ' ')}
        </span>
        <span className="font-sans text-slate-700">{message}</span>
      </div>
    </div>
  );
}
