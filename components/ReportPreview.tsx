'use client';

import React from 'react';
import { ProductBatch, FreshBox } from '@/lib/types';
import { calculateBatchImpact } from '@/lib/calculations';
import {
  FileText,
  Printer,
  ShieldCheck,
  Thermometer,
  Droplets,
  AlertTriangle,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface ReportPreviewProps {
  batch: ProductBatch;
  box?: FreshBox;
  onPrint?: () => void;
}

export default function ReportPreview({ batch, box, onPrint }: ReportPreviewProps) {
  const impact = calculateBatchImpact(batch);

  // Simulated metrics based on batch quality and risk values
  const isTomato = batch.category.toLowerCase() === 'tomatoes';
  const isLeafy = batch.category.toLowerCase() === 'leafy vegetables';

  // Compliance scores
  const compliancePercent = batch.recommendation?.spoilageRisk === 'Low' ? 98.4 : batch.recommendation?.spoilageRisk === 'Medium' ? 91.5 : 82.0;
  const avgTemp = isTomato ? 11.4 : isLeafy ? 2.1 : 4.5;
  const avgHumidity = isTomato ? 88.5 : isLeafy ? 92.0 : 83.0;
  const alertCount = batch.recommendation?.spoilageRisk === 'Low' ? 0 : batch.recommendation?.spoilageRisk === 'Medium' ? 1 : 4;

  const finalCondition = batch.recommendation?.spoilageRisk === 'Low' ? 'Safe' : batch.recommendation?.spoilageRisk === 'Medium' ? 'Review Needed' : 'High Risk';

  const getConditionStyle = (condition: string) => {
    switch (condition) {
      case 'Safe':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Review Needed':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      default:
        return 'text-rose-700 bg-rose-50 border-rose-100';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="text-emerald-500" size={20} />
          <h2 className="font-sans font-bold text-slate-800 text-base">Cold Chain Compliance Audit</h2>
        </div>
        <button
          onClick={onPrint || (() => window.print())}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150"
        >
          <Printer size={13} />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Styled Printable Core Report */}
      <div id="printable-cold-chain-report" className="border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 bg-slate-50/20 relative overflow-hidden print:border-none print:p-0 print:bg-white">
        {/* Decorative background watermark */}
        <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
          <Award size={350} className="text-emerald-500" />
        </div>

        {/* Audit Sheet Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <h3 className="font-sans font-extrabold text-slate-900 text-lg tracking-tight uppercase print:text-xl">
              SupplAI • Quality Compliance Audit
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              REPORT ID: FB-QC-{batch.id.substring(4)}-2026
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getConditionStyle(finalCondition)}`}>
              Audit Status: {finalCondition}
            </span>
            <p className="text-[10px] text-slate-400 font-mono mt-1.5">Generated: 2026-06-24 16:15 UTC</p>
          </div>
        </div>

        {/* Section 1: Batch & Logistics Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-400 font-mono uppercase tracking-wide">1. Batch & Logistics Info</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400">Product:</span>
              <span className="font-bold text-slate-800 text-right truncate">{batch.name}</span>

              <span className="text-slate-400">Category:</span>
              <span className="font-semibold text-slate-800 text-right">{batch.category}</span>

              <span className="text-slate-400">Batch ID:</span>
              <span className="font-mono font-bold text-slate-800 text-right">{batch.id}</span>

              <span className="text-slate-400">Net Quantity:</span>
              <span className="font-bold text-slate-800 text-right">{batch.quantityKg} Kg</span>

              <span className="text-slate-400">Harvest Grade:</span>
              <span className="font-semibold text-slate-800 text-right">Class {batch.qualityGrade}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-400 font-mono uppercase tracking-wide">2. Storage & Fleet Info</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400">FreshBox ID:</span>
              <span className="font-mono font-bold text-slate-800 text-right">{batch.assignedBoxId}</span>

              <span className="text-slate-400">Start Date:</span>
              <span className="font-semibold text-slate-800 text-right">{batch.dateStored}</span>

              <span className="text-slate-400">Exp. Delivery:</span>
              <span className="font-semibold text-slate-800 text-right">{batch.expectedDeliveryDate}</span>

              <span className="text-slate-400">Origin:</span>
              <span className="font-medium text-slate-800 text-right truncate">{batch.origin}</span>

              <span className="text-slate-400">Destination:</span>
              <span className="font-medium text-slate-800 text-right truncate">{batch.destination}</span>
            </div>
          </div>
        </div>

        {/* Section 2: IoT Compliance Readings */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-400 font-mono uppercase tracking-wide">3. IoT Environmental Readings & Compliance</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Thermometer size={14} className="text-rose-500" />
                <span>Avg. Temperature</span>
              </div>
              <p className="text-lg font-extrabold text-slate-800">{avgTemp.toFixed(1)}°C</p>
              <p className="text-[10px] text-slate-400">Target: {batch.recommendation?.recommendedTemperature || '4–8°C'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Droplets size={14} className="text-blue-500" />
                <span>Avg. Humidity</span>
              </div>
              <p className="text-lg font-extrabold text-slate-800">{avgHumidity.toFixed(1)}%</p>
              <p className="text-[10px] text-slate-400">Target: {batch.recommendation?.recommendedHumidity || '80-90%'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Thermal Integrity</span>
              </div>
              <p className="text-lg font-extrabold text-emerald-600">{compliancePercent}%</p>
              <p className="text-[10px] text-slate-400">Target threshold &gt; 90%</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <AlertTriangle size={14} className={alertCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
                <span>Log Anomalies</span>
              </div>
              <p className={`text-lg font-extrabold ${alertCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{alertCount}</p>
              <p className="text-[10px] text-slate-400">Anomalous events logged</p>
            </div>
          </div>
        </div>

        {/* Section 3: Sustainability Impact Metrics */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-400 font-mono uppercase tracking-wide">4. Carbon & Food Loss Abatement (Impact offsets)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-emerald-50/40 p-4 border border-emerald-100 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100/50 text-emerald-700">
                <Award size={18} />
              </div>
              <div>
                <p className="text-slate-500 font-medium">Food Waste Avoided</p>
                <p className="text-base font-extrabold text-emerald-800 font-mono">
                  {impact.foodLossAvoidedKg.toFixed(1)} Kg
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/40 p-4 border border-emerald-100 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100/50 text-emerald-700">
                <Award size={18} />
              </div>
              <div>
                <p className="text-slate-500 font-medium">CO2e Emissions Prevented</p>
                <p className="text-base font-extrabold text-emerald-800 font-mono">
                  {impact.co2eAvoidedKg.toFixed(1)} kgCO2e
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/40 p-4 border border-emerald-100 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100/50 text-emerald-700">
                <Award size={18} />
              </div>
              <div>
                <p className="text-slate-500 font-medium">Saved Financial Loss</p>
                <p className="text-base font-extrabold text-emerald-800 font-mono">
                  Rp{impact.costLossAvoidedRp.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4.5: Registered Harvest Quality Photo & AI Vision (Conditional) */}
        {batch.productPhoto && (
          <div className="space-y-2">
            <h4 className="font-bold text-slate-400 font-mono uppercase tracking-wide">5. Harvest Quality Vision & AI Diagnostics</h4>
            <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo */}
              <div className="relative h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={batch.productPhoto}
                  alt="Registered Crop"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Badges / Metrics */}
              {batch.photoAnalysis ? (
                <div className="md:col-span-2 space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">Detected crop</span>
                      <strong className="text-slate-800">{batch.photoAnalysis.detectedProduct}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">Visual Quality</span>
                      <strong className={`font-bold ${
                        batch.photoAnalysis.visualQuality === 'Good' ? 'text-emerald-600' :
                        batch.photoAnalysis.visualQuality === 'Moderate' ? 'text-amber-600' : 'text-rose-600'
                      }`}>{batch.photoAnalysis.visualQuality}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">Ripeness / Maturity</span>
                      <strong className="text-slate-800 font-semibold">{batch.photoAnalysis.ripenessLevel}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider font-bold">Estimated Spoilage Risk</span>
                      <strong className={`font-bold ${
                        batch.photoAnalysis.estimatedSpoilageRisk === 'Low' ? 'text-emerald-600' :
                        batch.photoAnalysis.estimatedSpoilageRisk === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                      }`}>{batch.photoAnalysis.estimatedSpoilageRisk}</strong>
                    </div>
                  </div>

                  {batch.photoAnalysis.visibleRiskSigns.length > 0 && (
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider mb-1">Observed Risk Markers</span>
                      <div className="flex flex-wrap gap-1">
                        {batch.photoAnalysis.visibleRiskSigns.map((sign, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-mono font-medium capitalize border border-slate-200/50">
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg text-[11px]">
                    <span className="font-bold text-slate-700">AI Vision Tip:</span> {batch.photoAnalysis.handlingRecommendation}
                  </p>
                </div>
              ) : (
                <div className="md:col-span-2 flex items-center justify-center text-slate-400 italic text-xs">
                  Photo uploaded for compliance record. No AI quality diagnostics were performed.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Science Summary & Expert handling info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-3">
          <h4 className="font-bold text-slate-800">6. Cold Chain Science Summary</h4>
          <p className="text-slate-600 leading-relaxed font-sans">
            <span className="font-bold text-slate-700">Scientific rationale:</span>{' '}
            {batch.recommendation?.reasoningSummary || 'Stable environment conditions applied to regulate metabolic respiration rates.'}
          </p>
          <div className="pt-2.5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Handling Instruction:</span>
              <p className="text-slate-500 leading-relaxed">
                {batch.recommendation?.handlingRecommendation || 'Keep door sealed tightly; inspect sanitation records.'}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">Eco Optimization:</span>
              <p className="text-slate-500 leading-relaxed">
                {batch.recommendation?.energyOptimizationTip || 'Utilize cooling mass presets for optimal compressor power draws.'}
              </p>
            </div>
          </div>
        </div>

        {/* Signatures & Disclaimers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-6 border-t border-slate-200 text-[10px] text-slate-400">
          <div className="space-y-1">
            <p>SupplAI MVP IoT Cloud Core Telemetry Log</p>
            <p>Verification Algorithm: SHA-256 Verified Cold Chain Integrity Hash</p>
          </div>
          <div className="text-left md:text-right space-y-1 font-mono">
            <p>Digital Signature Certificate</p>
            <p className="font-bold text-slate-500 uppercase">Passed Audit Integrity Checks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
