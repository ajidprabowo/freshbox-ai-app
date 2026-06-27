'use client';

import React from 'react';
import { MonitoringData, SpoilageRisk } from '@/lib/types';
import {
  Thermometer,
  Droplets,
  Battery,
  ShieldCheck,
  Compass,
  AlertTriangle,
  RotateCcw,
  Activity,
  User,
  Power,
  DoorClosed,
  DoorOpen,
} from 'lucide-react';
import AlertBadge from './AlertBadge';

interface MonitoringCardProps {
  data: MonitoringData;
}

export default function MonitoringCard({ data }: MonitoringCardProps) {
  // Translate spoilage risk to visual indicator
  const getRiskStyle = (risk: SpoilageRisk) => {
    switch (risk) {
      case 'Low':
        return {
          indicator: 'bg-emerald-500',
          text: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          border: 'border-emerald-100',
          accent: 'emerald',
        };
      case 'Medium':
        return {
          indicator: 'bg-amber-500',
          text: 'text-amber-700 bg-amber-50 border-amber-100',
          border: 'border-amber-100',
          accent: 'amber',
        };
      case 'High':
        return {
          indicator: 'bg-rose-500',
          text: 'text-rose-700 bg-rose-50 border-rose-100',
          border: 'border-rose-100',
          accent: 'rose',
        };
    }
  };

  const riskStyle = getRiskStyle(data.spoilageRisk);

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm space-y-5 transition-all duration-300 ${data.alerts.length > 0 ? 'border-amber-300 ring-2 ring-amber-500/5' : 'border-slate-200'}`}>
      {/* Card Header: Device Connection State */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-800 text-base">{data.boxId}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${riskStyle.text}`}>
              Risk: {data.spoilageRisk}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 truncate max-w-[180px] mt-0.5">
            Load: {data.productName}
          </p>
        </div>

        {/* Dynamic Connection Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>LIVE IoT</span>
        </div>
      </div>

      {/* Main Sensor Reading Matrix */}
      <div className="grid grid-cols-2 gap-3">
        {/* Live Temp */}
        <div className="bg-slate-50/60 border border-slate-100/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-500 shrink-0">
            <Thermometer size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wide leading-none">TEMPERATURE</p>
            <p className="text-base font-extrabold text-slate-800 mt-1">{data.temperature.toFixed(1)}°C</p>
          </div>
        </div>

        {/* Live Humidity */}
        <div className="bg-slate-50/60 border border-slate-100/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-500 shrink-0">
            <Droplets size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wide leading-none">HUMIDITY</p>
            <p className="text-base font-extrabold text-slate-800 mt-1">{data.humidity.toFixed(0)}% RH</p>
          </div>
        </div>
      </div>

      {/* Secondary Device Diagnostics */}
      <div className="grid grid-cols-3 gap-2.5 text-xs">
        {/* Battery */}
        <div className="bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/30 text-center space-y-1">
          <div className="flex justify-center text-slate-400">
            <Battery size={14} className={data.battery < 20 ? 'text-rose-500 fill-rose-100' : 'text-slate-500'} />
          </div>
          <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wide leading-none">Battery</p>
          <p className={`font-extrabold font-mono ${data.battery < 20 ? 'text-rose-600' : 'text-slate-800'}`}>
            {data.battery}%
          </p>
        </div>

        {/* Door state */}
        <div className="bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/30 text-center space-y-1">
          <div className="flex justify-center text-slate-400">
            {data.doorStatus === 'Closed' ? (
              <DoorClosed size={14} className="text-emerald-500" />
            ) : (
              <DoorOpen size={14} className="text-amber-500" />
            )}
          </div>
          <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wide leading-none">Door State</p>
          <p className={`font-extrabold ${data.doorStatus === 'Closed' ? 'text-slate-800' : 'text-amber-600'}`}>
            {data.doorStatus}
          </p>
        </div>

        {/* Cooling compressor */}
        <div className="bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/30 text-center space-y-1">
          <div className="flex justify-center text-slate-400">
            <Power size={14} className={data.coolingStatus === 'Active' ? 'text-emerald-500 animate-spin-slow' : 'text-slate-400'} />
          </div>
          <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wide leading-none">Cooling</p>
          <p className="font-extrabold text-slate-800">
            {data.coolingStatus}
          </p>
        </div>
      </div>

      {/* Footer Diagnostic Bar */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Compass size={14} className="text-slate-400 shrink-0" />
          <span className="truncate max-w-[140px]">{data.gpsStatus}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
          <RotateCcw size={12} />
          <span>Safe time: <span className="text-slate-700 font-bold font-sans">{data.remainingSafeTime}</span></span>
        </div>
      </div>

      {/* Alarms Display Container */}
      {data.alerts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-dashed border-slate-100">
          {data.alerts.map((alert, index) => (
            <AlertBadge
              key={index}
              type={alert.includes('Battery') ? 'battery_low' : alert.includes('Door') ? 'door_open' : 'temp_out_of_range'}
              message={alert}
              severity={alert.includes('Risk') || alert.includes('CRITICAL') ? 'critical' : 'warning'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
