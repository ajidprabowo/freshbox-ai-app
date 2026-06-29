import React from 'react';
import { FreshBox } from '@/lib/types';
import { SUPPLAI_PRICING, formatRupiah } from '../lib/pricing';
import {
  Battery,
  Thermometer,
  Droplets,
  CalendarDays,
  ShieldCheck,
  MapPin,
  Truck,
  Building,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Wifi,
} from 'lucide-react';

interface BoxCardProps {
  box: FreshBox;
  onBookClick?: (boxId: string) => void;
  onViewRentalClick?: (boxId: string) => void;
}

export default function BoxCard({ box, onBookClick, onViewRentalClick }: BoxCardProps) {
  // Battery color indicator
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-emerald-500 fill-emerald-500/20';
    if (level > 20) return 'text-amber-500 fill-amber-500/20';
    return 'text-rose-500 fill-rose-500/20';
  };

  // Status badges styling
  const getStatusBadge = (status: FreshBox['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={12} className="stroke-[2.5]" />
            Available
          </span>
        );
      case 'Active Rental':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Truck size={12} className="stroke-[2.5]" />
            Active Rental
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Wrench size={12} className="stroke-[2.5]" />
            Maintenance
          </span>
        );
    }
  };

  const pricingInfo = SUPPLAI_PRICING[box.type];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-800 text-lg">{box.id}</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700 font-mono uppercase">
              MODEL {box.type}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {box.location === 'warehouse' ? (
              <>
                <Building size={14} className="text-slate-400" />
                <span>Warehouse Storage</span>
              </>
            ) : (
              <>
                <Truck size={14} className="text-slate-400" />
                <span>Logistics Truck</span>
              </>
            )}
          </div>
        </div>
        {getStatusBadge(box.status)}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 space-y-4">
        {/* Model info labels */}
        <div>
          <h4 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">
            {pricingInfo.label}
          </h4>
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            Best Suited For: {pricingInfo.bestSuitedFor}
          </p>
        </div>

        {/* Real-time Environment Gauges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/50 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-500">
              <Thermometer size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold font-mono">TEMP</p>
              <p className="text-sm font-bold text-slate-800">{box.currentTemp}°C</p>
            </div>
          </div>

          <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/50 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
              <Droplets size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold font-mono">HUMIDITY</p>
              <p className="text-sm font-bold text-slate-800">{box.currentHumidity}%</p>
            </div>
          </div>
        </div>

        {/* Specifications List */}
        <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Usable Volume:</span>
            <span className="font-semibold text-slate-800">{pricingInfo.usableVolumeLiters} Liters</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Payload Cap:</span>
            <span className="font-semibold text-slate-800">{pricingInfo.payloadKg} Kg</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-50 pt-2">
            <span className="text-slate-400">Temp Range Capability:</span>
            <span className="font-mono font-semibold text-slate-800">{box.tempRange}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Battery Level:</span>
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <Battery size={14} className={getBatteryColor(box.batteryLevel)} />
              <span>{box.batteryLevel}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Sanitization Status:</span>
            <div className="flex items-center gap-1 text-slate-700">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Sanitized ({box.lastSanitized})</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">GPS / Connection:</span>
            <div className="flex items-center gap-1 text-slate-700">
              <Wifi size={14} className="text-emerald-500" />
              <span className="font-medium text-emerald-700">Connected (Simulated)</span>
            </div>
          </div>
          {box.assignedProductId && (
            <div className="mt-3 p-2 bg-emerald-50/40 border border-emerald-100/40 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-emerald-700 font-mono tracking-wide">
                Product Load
              </p>
              <p className="font-medium text-slate-800 truncate">{box.assignedProductId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 border-t border-slate-200 bg-slate-50/30 flex items-center justify-between mt-auto">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono leading-none">
            RENTAL RATE
          </p>
          <p className="text-base font-extrabold text-slate-900 mt-1">
            {formatRupiah(box.pricePerDay)}<span className="text-xs text-slate-500 font-normal">/day</span>
          </p>
        </div>

        {box.status === 'Available' && onBookClick ? (
          <button
            onClick={() => onBookClick(box.id)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 hover:scale-[1.02] transition-all cursor-pointer"
          >
            Rent This Box
          </button>
        ) : box.status === 'Active Rental' && onViewRentalClick ? (
          <button
            onClick={() => onViewRentalClick(box.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold hover:scale-[1.02] transition-all cursor-pointer"
          >
            View Rental
          </button>
        ) : (
          <button
            disabled
            className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
