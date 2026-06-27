'use client';

import React from 'react';
import { Invoice } from '@/lib/types';
import { Coins, FileText, Sparkles, Printer, CalendarDays, Check, ArrowRight } from 'lucide-react';

interface CostBreakdownProps {
  invoice: Invoice;
  onPrintInvoice?: () => void;
}

export default function CostBreakdown({ invoice, onPrintInvoice }: CostBreakdownProps) {
  const { breakdown } = invoice;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <Coins className="text-emerald-500" size={20} />
        <h2 className="font-sans font-bold text-slate-800 text-base">Cost Calculation Breakdown</h2>
      </div>

      {/* Numerical Breakdown Rows */}
      <div className="space-y-3.5 text-sm text-slate-600">
        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
          <div>
            <span className="font-medium text-slate-700">Container Rental Fees</span>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Type {invoice.boxType} × {invoice.quantity} Unit(s) × {invoice.durationDays} Day(s)
            </p>
          </div>
          <span className="font-mono font-semibold text-slate-800">
            Rp{breakdown.boxRentalCost.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
          <div>
            <span className="font-medium text-slate-700">Estimated Energy Consumption</span>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {invoice.energyUsageKwh} kWh Total × Rp1,500/kWh
            </p>
          </div>
          <span className="font-mono font-semibold text-slate-800">
            Rp{breakdown.energyCost.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
          <div>
            <span className="font-medium text-slate-700">Logistics Transport & Handling</span>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {invoice.pickupDeliveryService ? `Flat rate delivery Rp50,000 per unit` : 'Self pickup'}
            </p>
          </div>
          <span className="font-mono font-semibold text-slate-800">
            Rp{breakdown.pickupCost.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
          <div>
            <span className="font-medium text-slate-700">Sanitization & Deep Cleaning Service</span>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {invoice.cleaningService ? `Post-rental cleaning Rp25,000 per unit` : 'No clean service selected'}
            </p>
          </div>
          <span className="font-mono font-semibold text-slate-800">
            Rp{breakdown.cleaningCost.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
          <div>
            <span className="font-medium text-slate-700">Late Return Overhead Fees</span>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {invoice.lateReturnDays > 0 ? `${invoice.lateReturnDays} Late Day(s) × 30% daily rental charge` : 'On-time return guaranteed'}
            </p>
          </div>
          <span className={`font-mono font-semibold ${breakdown.lateFeeCost > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            Rp{breakdown.lateFeeCost.toLocaleString()}
          </span>
        </div>

        {/* Invoice Grand Total */}
        <div className="flex justify-between items-center pt-4 pb-2 text-slate-900">
          <span className="text-base font-extrabold font-sans">Estimated Cost Total</span>
          <span className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">
            Rp{breakdown.totalCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Styled Interactive Invoice Sheet */}
      <div className="pt-4 border-t border-slate-200">
        <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 shadow-md relative overflow-hidden font-mono text-xs space-y-4">
          {/* Header Watermark Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start">
            <div>
              <p className="font-sans font-bold text-sm tracking-tight text-white leading-none">FreshBox AI Logistics</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Smart Cold Chain Invoice</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-emerald-400 font-bold uppercase">PREVIEW ONLY</p>
              <p className="text-[9px] text-slate-400">#FB-INV-2026-{invoice.boxType}-{invoice.durationDays}</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-4 text-[10px]">
            <div>
              <p className="text-slate-500 uppercase tracking-wider">PREPARED FOR</p>
              <p className="font-semibold text-slate-200 mt-1">IndoFresh Logistics Partner</p>
              <p className="text-slate-400 mt-0.5">Jakarta Distribution Hub</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 uppercase tracking-wider">RENTAL OVERVIEW</p>
              <p className="font-semibold text-slate-200 mt-1">Box Model: Type {invoice.boxType}</p>
              <p className="text-slate-400 mt-0.5">Mode: {invoice.usageMode}</p>
            </div>
          </div>

          {/* Table Items */}
          <div className="border-t border-slate-800 pt-3 space-y-2 text-[10px]">
            <div className="flex justify-between text-slate-500">
              <span>ITEM DESCRIPTION</span>
              <span>TOTAL AMT</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>FreshBox Unit Rental ({invoice.durationDays} days)</span>
              <span>Rp{breakdown.boxRentalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>IoT Power Charge ({invoice.energyUsageKwh} kWh)</span>
              <span>Rp{breakdown.energyCost.toLocaleString()}</span>
            </div>
            {(invoice.pickupDeliveryService || invoice.cleaningService || invoice.lateReturnDays > 0) && (
              <div className="flex justify-between text-slate-300">
                <span>Value Added Services & Fees</span>
                <span>Rp{(breakdown.pickupCost + breakdown.cleaningCost + breakdown.lateFeeCost).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-bold text-white">
            <span className="font-sans">INVOICE TOTAL</span>
            <span className="font-sans text-emerald-400">Rp{breakdown.totalCost.toLocaleString()}</span>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[9px] text-slate-500">Thank you for reducing food waste with FreshBox AI!</p>
          </div>
        </div>
      </div>

      {/* Print Action button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onPrintInvoice || (() => window.print())}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150"
        >
          <Printer size={14} />
          <span>Print Official Invoice</span>
        </button>
      </div>
    </div>
  );
}
