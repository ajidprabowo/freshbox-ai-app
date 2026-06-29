'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Box as BoxIcon,
  MapPin,
  CalendarDays,
  Gauge,
  Battery,
  Navigation,
  Weight,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Zap,
  Info,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Printer,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { BoxRecommendationInput, BoxRecommendationResult, UsageMode, RentalSuggestion, BoxType } from '../lib/types';
import { saveLatestRentalSuggestion } from '../lib/storage';

interface BoxRecommendationProps {
  onUseRecommendation: (rec: RentalSuggestion) => void;
}

export default function BoxRecommendation({ onUseRecommendation }: BoxRecommendationProps) {
  // Recommendation input states
  const [category, setCategory] = useState('Tomatoes');
  const [productName, setProductName] = useState('');
  const [totalWeight, setTotalWeight] = useState<number>(180);
  const [estimatedVolume, setEstimatedVolume] = useState<string>('');
  const [duration, setDuration] = useState<number>(5);
  const [usageMode, setUsageMode] = useState<UsageMode>('Storage + Distribution');
  const [pickup, setPickup] = useState('Bandung');
  const [destination, setDestination] = useState('Jakarta');
  const [deliveryDate, setDeliveryDate] = useState('2026-06-28');
  const [sensitivity, setSensitivity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [batteryBackup, setBatteryBackup] = useState(true);
  const [gpsTracking, setGpsTracking] = useState(true);

  // Cost calculator custom parameters (directly integrated!)
  const [fleetTransport, setFleetTransport] = useState(true);
  const [deepSanitization, setDeepSanitization] = useState(true);
  const [lateReturnDays, setLateReturnDays] = useState(0);

  // Output / Loading / Error states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BoxRecommendationResult | null>(null);
  const [apiMethod, setApiMethod] = useState<'ai' | 'rule-based' | 'rule-based-fallback' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate pricing when recommendation changes or calculator variables shift
  const rentalSuggestion = useMemo(() => {
    if (!result) return null;

    const qty = result.recommendedQuantity;
    const typeStr = result.recommendedBoxType; // e.g. "FreshBox M"
    const typeLetter: BoxType = typeStr.endsWith('S') ? 'S' : typeStr.endsWith('M') ? 'M' : 'L';

    // Daily prices: S = 75k, M = 120k, L = 200k
    let dailyPrice = 75000;
    if (typeLetter === 'M') dailyPrice = 120000;
    if (typeLetter === 'L') dailyPrice = 200000;

    const boxRentalCost = dailyPrice * qty * duration;

    // Estimate energy usage: S = 2.2 kWh/day, M = 5.0 kWh/day, L = 11.5 kWh/day
    const dailyKwh = typeLetter === 'S' ? 2.2 : typeLetter === 'M' ? 5.0 : 11.5;
    const estKwh = parseFloat((qty * duration * dailyKwh).toFixed(1));
    const energyCost = estKwh * 1500; // Rp1,500 per kWh

    // Fleet transport flat: Rp50,000 per unit
    const pickupDeliveryCost = fleetTransport ? 50000 * qty : 0;

    // Cleaning flat: Rp25,000 per unit
    const cleaningFee = deepSanitization ? 25000 * qty : 0;

    // Late return offset: 30% penalty per late day
    const lateFee = lateReturnDays * (dailyPrice * 0.3) * qty;

    const totalCost = boxRentalCost + energyCost + pickupDeliveryCost + cleaningFee + lateFee;

    // Generate deterministic values to remain 100% pure (anti-impure-render rule)
    const categoryCode = category.substring(0, 3).toUpperCase();
    const modeLetter = usageMode.substring(0, 1).toUpperCase();
    const durationStr = duration.toString();
    const qtyStr = qty.toString();
    const weightStr = totalWeight.toString();
    const uniqueId = `SUG-${categoryCode}-${modeLetter}${durationStr}-${qtyStr}${weightStr}`;
    const dummyCreatedAt = "2026-06-27T00:00:00.000Z";

    const suggestion: RentalSuggestion = {
      id: uniqueId,
      createdAt: dummyCreatedAt,
      productCategory: category,
      productName: productName || `Fresh ${category}`,
      totalWeightKg: totalWeight,
      usageMode,
      pickupLocation: pickup,
      destinationLocation: destination,
      rentalDurationDays: duration,
      recommendedBoxType: typeStr,
      recommendedQuantity: qty,
      estimatedRentalCost: totalCost,
      costBreakdown: {
        boxRentalCost,
        energyCost,
        pickupDeliveryCost,
        cleaningFee,
        lateFee,
        totalCost,
      },
      microclimateSummary: result.microclimateSummary,
      reasoningSummary: result.reasoningSummary,
      alternativeOption: result.alternativeOption,
      warning: result.specialWarning,
    };

    return suggestion;
  }, [
    result,
    duration,
    fleetTransport,
    deepSanitization,
    lateReturnDays,
    category,
    productName,
    totalWeight,
    usageMode,
    pickup,
    destination,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const inputData: BoxRecommendationInput = {
      productCategory: category,
      productName: productName || `Fresh ${category}`,
      totalWeightKg: Number(totalWeight),
      estimatedVolumeL: estimatedVolume ? Number(estimatedVolume) : undefined,
      storageDurationDays: Number(duration),
      usageMode,
      pickupLocation: pickup,
      destinationLocation: destination,
      requiredDeliveryDate: deliveryDate,
      productSensitivity: sensitivity,
      needBatteryBackup: batteryBackup,
      needGpsTracking: gpsTracking,
    };

    try {
      const response = await fetch('/api/box-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendation from API');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.result);
      setApiMethod(data.method);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (!rentalSuggestion) return;
    saveLatestRentalSuggestion(rentalSuggestion);
    onUseRecommendation(rentalSuggestion);
  };

  // Helper to color code capacity utilization percentage
  const getUtilizationColor = (rateStr: string) => {
    const rate = parseInt(rateStr) || 0;
    if (rate >= 60 && rate <= 90) {
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        progress: 'bg-emerald-500',
        label: 'Optimal Utilization (Green)',
      };
    } else if (rate > 90 && rate <= 105) {
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-700 bg-amber-50 border-amber-200',
        progress: 'bg-amber-500',
        label: 'High Capacity Alert (Yellow)',
      };
    } else if (rate > 105) {
      return {
        bg: 'bg-rose-500',
        text: 'text-rose-700 bg-rose-50 border-rose-200',
        progress: 'bg-rose-500',
        label: 'Over Capacity Alert (Red)',
      };
    } else {
      return {
        bg: 'bg-blue-500',
        text: 'text-blue-700 bg-blue-50 border-blue-200',
        progress: 'bg-blue-500',
        label: 'Low Under-utilization (Blue)',
      };
    }
  };

  const utilizationInfo = result ? getUtilizationColor(result.utilizationRate) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Header Segment */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2">
          <Sparkles className="text-emerald-500 fill-emerald-500/10" size={28} />
          <span>AI Recommendation</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Input your product logistics, route requirements, and custom services. Get the perfect smart container size and fully automated cost calculator quote instantly.
        </p>
      </div>

      {/* Box Fleet Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Box S Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 font-mono uppercase tracking-wide">MODEL S</span>
              <h3 className="text-base font-bold text-slate-800 mt-1">FreshBox Small</h3>
            </div>
            <span className="font-mono text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Rp75,000/day</span>
          </div>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Usable Volume:</span>
              <span className="font-semibold text-slate-700">70 Liters</span>
            </div>
            <div className="flex justify-between">
              <span>Payload Cap:</span>
              <span className="font-semibold text-slate-700">25 Kg</span>
            </div>
            <div className="flex justify-between">
              <span>Best Suited For:</span>
              <span className="font-semibold text-slate-700">High-value boutique batches</span>
            </div>
          </div>
        </div>

        {/* Box M Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 font-mono uppercase tracking-wide">MODEL M</span>
              <h3 className="text-base font-bold text-slate-800 mt-1">FreshBox Medium</h3>
            </div>
            <span className="font-mono text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Rp120,000/day</span>
          </div>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Usable Volume:</span>
              <span className="font-semibold text-slate-700">165 Liters</span>
            </div>
            <div className="flex justify-between">
              <span>Payload Cap:</span>
              <span className="font-semibold text-slate-700">60 Kg</span>
            </div>
            <div className="flex justify-between">
              <span>Best Suited For:</span>
              <span className="font-semibold text-slate-700">Standard farm distribution</span>
            </div>
          </div>
        </div>

        {/* Box L Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 font-mono uppercase tracking-wide">MODEL L</span>
              <h3 className="text-base font-bold text-slate-800 mt-1">FreshBox Large</h3>
            </div>
            <span className="font-mono text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Rp200,000/day</span>
          </div>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Usable Volume:</span>
              <span className="font-semibold text-slate-700">750 Liters</span>
            </div>
            <div className="flex justify-between">
              <span>Payload Cap:</span>
              <span className="font-semibold text-slate-700">250 Kg</span>
            </div>
            <div className="flex justify-between">
              <span>Best Suited For:</span>
              <span className="font-semibold text-slate-700">Consolidated bulk supply</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form + Recommendation Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recommendation & Cost Input Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Calculator className="text-emerald-500" size={18} />
            <h3 className="font-sans font-bold text-slate-800 text-sm">Logistics & Service Parameters</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Product Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                required
              >
                <option value="Tomatoes">Tomatoes (Chilling Sensitive)</option>
                <option value="Leafy Vegetables">Leafy Vegetables (High Transpiration)</option>
                <option value="Seafood">Seafood (Critical Temp Control)</option>
                <option value="Dairy">Dairy & Eggs</option>
                <option value="Meat">Meat & Poultry</option>
                <option value="Tropical Fruit">Tropical Fruits</option>
                <option value="Frozen Food">Frozen Products (Sub-zero)</option>
                <option value="Other">Other Fresh Produce</option>
              </select>
            </div>

            {/* Product name & weight */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Cherry Tomatoes"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Weight (Kg) *</label>
                <input
                  type="number"
                  min="1"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            {/* Volume & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Est. Volume (Liters)</label>
                <input
                  type="number"
                  value={estimatedVolume}
                  onChange={(e) => setEstimatedVolume(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lease Duration (Days) *</label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            {/* Usage Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Operational Mode *</label>
              <select
                value={usageMode}
                onChange={(e) => setUsageMode(e.target.value as UsageMode)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                required
              >
                <option value="Storage">Static Warehouse Storage</option>
                <option value="Distribution">Inter-city Logistics Fleet</option>
                <option value="Storage + Distribution">Complete Transit Lifecycle</option>
              </select>
            </div>

            {/* Route Locations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup Location *</label>
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Destination Location *</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            {/* Custom value added services */}
            <div className="space-y-3 pt-3.5 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Cost Estimator Options</span>
              
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-700">Fleet Transport Service</p>
                  <p className="text-[10px] text-slate-400 font-mono">Rp50,000 / Box Flat Rate</p>
                </div>
                <input
                  type="checkbox"
                  checked={fleetTransport}
                  onChange={(e) => setFleetTransport(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-700">Deep Sanitization Cleaning</p>
                  <p className="text-[10px] text-slate-400 font-mono">Rp25,000 / Box Flat Rate</p>
                </div>
                <input
                  type="checkbox"
                  checked={deepSanitization}
                  onChange={(e) => setDeepSanitization(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-700">Late Return Buffer</p>
                  <p className="text-[10px] text-slate-400 font-mono">Offset penalty days</p>
                </div>
                <input
                  type="number"
                  min="0"
                  value={lateReturnDays}
                  onChange={(e) => setLateReturnDays(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0 days"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-right"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl text-xs transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing with SupplAI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="fill-white" />
                  <span>Generate AI Recommendation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Recommendation Result & Automated Cost Breakdown Panel */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-3xl p-5 flex gap-3 text-xs">
              <AlertTriangle className="text-rose-600 shrink-0" size={16} />
              <div>
                <p className="font-bold">Recommendation Generation Failed</p>
                <p className="mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="h-full bg-white border border-slate-200 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center text-slate-400 space-y-3 min-h-[400px]">
              <div className="bg-slate-50 p-4 rounded-full border border-slate-100">
                <Sparkles size={28} className="text-slate-300" />
              </div>
              <p className="font-semibold text-slate-700">Awaiting Input Parameters</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Complete the shipping specs form on the left to compile AI suggestions and view an automated pricing estimate quote.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full bg-white border border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center text-slate-400 space-y-4 min-h-[400px]">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <Sparkles className="text-emerald-500 fill-emerald-500/10 animate-pulse" size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Consulting FreshBox Neural Model</p>
                <p className="text-xs max-w-xs leading-relaxed mt-1">
                  Determining thermal bounds, calculating box capacities, and generating complete pricing breakdowns...
                </p>
              </div>
            </div>
          )}

          {result && rentalSuggestion && (
            <div className="space-y-6 animate-scale-up">
              {/* Unified Header with CTA */}
              <div className="bg-emerald-500 text-slate-950 p-6 rounded-3xl shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase font-mono bg-slate-950/10 px-2 py-0.5 rounded-md text-emerald-950">
                    Recommendation Saved
                  </span>
                  <p className="text-lg font-extrabold font-sans">Apply configured advice now</p>
                  <p className="text-xs text-emerald-900 max-w-md font-medium">
                    This selection is saved in local memory. You can import it with 1-click on the Box Rental page to complete reservation.
                  </p>
                </div>
                <button
                  onClick={handleApplySuggestion}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-slate-950/20 cursor-pointer"
                >
                  <span>Use Recommendation for Rental</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Recommendation Details Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BoxIcon className="text-emerald-500" size={18} />
                    <h4 className="font-bold text-slate-800 text-sm">Target Packaging Recommendation</h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    API METHOD: {apiMethod ? apiMethod.toUpperCase() : 'AI'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recommended Type */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Recommended Box Configuration</span>
                    <p className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <span className="bg-slate-900 text-white px-2.5 py-1 rounded-xl text-xs font-mono">
                        {rentalSuggestion.recommendedQuantity} ×
                      </span>
                      <span>{rentalSuggestion.recommendedBoxType}</span>
                    </p>
                  </div>

                  {/* Volume Utilization rate with color coded progress bar */}
                  {utilizationInfo && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Physical Capacity Utilization</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${utilizationInfo.text}`}>
                          {result.utilizationRate}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full ${utilizationInfo.progress} transition-all duration-500`}
                          style={{ width: `${Math.min(100, parseInt(result.utilizationRate) || 0)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 font-medium">{utilizationInfo.label}</p>
                    </div>
                  )}
                </div>

                {/* Microclimate parameters */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono block">AI microclimate settings</span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                      {rentalSuggestion.microclimateSummary}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono block">Capacity Breakdown Details</span>
                    <p className="text-xs text-slate-600 font-mono font-medium mt-1 leading-relaxed">
                      {result.estimatedCapacityUsed}
                    </p>
                  </div>
                </div>

                {/* Reasoning summary text */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Recommendation Reasoning</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {rentalSuggestion.reasoningSummary}
                  </p>
                </div>

                {/* Warnings / Alternatives */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  {rentalSuggestion.warning && (
                    <div className="p-3 bg-amber-50 text-amber-900 border border-amber-100/70 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <AlertTriangle size={12} className="text-amber-600" />
                        <span>Physiological Warning</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{rentalSuggestion.warning}</p>
                    </div>
                  )}

                  {rentalSuggestion.alternativeOption && (
                    <div className="p-3 bg-blue-50 text-blue-900 border border-blue-100/70 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <Info size={12} className="text-blue-600" />
                        <span>Alternative Deployment</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{rentalSuggestion.alternativeOption}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Calculation Breakdown Section */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Coins className="text-emerald-500" size={18} />
                  <h4 className="font-bold text-slate-800 text-sm">Cost Calculation Breakdown</h4>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">Modular Container Rental Fees</span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Model {rentalSuggestion.recommendedBoxType.split(' ')[1]} × {rentalSuggestion.recommendedQuantity} Units × {rentalSuggestion.rentalDurationDays} Days
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      Rp{rentalSuggestion.costBreakdown.boxRentalCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">Estimated Energy Consumption</span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Based on {rentalSuggestion.recommendedQuantity} × {rentalSuggestion.recommendedBoxType.split(' ')[1]} load at Rp1,500/kWh flat rate
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      Rp{rentalSuggestion.costBreakdown.energyCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">Logistics Transport & Handling</span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {fleetTransport ? `Fleet delivery flat rate Rp50,000 per box` : 'Customer self pickup'}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      Rp{rentalSuggestion.costBreakdown.pickupDeliveryCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">Sanitization & Deep Cleaning Service</span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {deepSanitization ? 'Sanitation protocol charge Rp25,000 per box' : 'No sanitization selected'}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      Rp{rentalSuggestion.costBreakdown.cleaningFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">Late Return Overhead Fees</span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {lateReturnDays > 0 ? `${lateReturnDays} Late Day(s) × 30% daily rental charge` : 'On-time return guaranteed'}
                      </p>
                    </div>
                    <span className={`font-mono font-bold text-sm ${rentalSuggestion.costBreakdown.lateFee > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      Rp{rentalSuggestion.costBreakdown.lateFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4 pb-2 text-slate-950">
                    <span className="text-sm font-extrabold font-sans">Estimated Cost Total</span>
                    <span className="text-lg font-extrabold text-slate-900 font-sans tracking-tight">
                      Rp{rentalSuggestion.costBreakdown.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Digital Digital Watermarked Invoice Sheet */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-[#0B1329] text-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden font-mono text-xs space-y-4">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-sans font-bold text-sm tracking-tight text-white leading-none">SupplAI Logistics</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider mt-1">Smart Cold Chain Invoice Quote</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-emerald-400 font-bold uppercase">PREVIEW ONLY</p>
                        <p className="text-[8px] text-slate-400">#{rentalSuggestion.id}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-4 text-[9px]">
                      <div>
                        <p className="text-slate-500 uppercase tracking-wider">PRODUCT DETAILS</p>
                        <p className="font-semibold text-slate-200 mt-1">{rentalSuggestion.productName}</p>
                        <p className="text-slate-400 mt-0.5">{rentalSuggestion.totalWeightKg} kg ({rentalSuggestion.productCategory})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 uppercase tracking-wider">ROUTE & DURATION</p>
                        <p className="font-semibold text-slate-200 mt-1">{rentalSuggestion.pickupLocation} → {rentalSuggestion.destinationLocation}</p>
                        <p className="text-slate-400 mt-0.5">Lease: {rentalSuggestion.rentalDurationDays} days ({rentalSuggestion.usageMode})</p>
                      </div>
                    </div>

                    {/* Table Items */}
                    <div className="border-t border-slate-800 pt-3 space-y-2 text-[9px]">
                      <div className="flex justify-between text-slate-500">
                        <span>ITEM DESCRIPTION</span>
                        <span>TOTAL AMT</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>FreshBox {rentalSuggestion.recommendedBoxType.split(' ')[1]} Container Leases ({rentalSuggestion.recommendedQuantity} units)</span>
                        <span>Rp{rentalSuggestion.costBreakdown.boxRentalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Simulated Smart Power Grid Support Charge</span>
                        <span>Rp{rentalSuggestion.costBreakdown.energyCost.toLocaleString()}</span>
                      </div>
                      {(fleetTransport || deepSanitization || lateReturnDays > 0) && (
                        <div className="flex justify-between text-slate-300">
                          <span>Value Added Services & Margins</span>
                          <span>Rp{(rentalSuggestion.costBreakdown.pickupDeliveryCost + rentalSuggestion.costBreakdown.cleaningFee + rentalSuggestion.costBreakdown.lateFee).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-bold text-white">
                      <span className="font-sans">INVOICE TOTAL (EST)</span>
                      <span className="font-sans text-emerald-400">Rp{rentalSuggestion.costBreakdown.totalCost.toLocaleString()}</span>
                    </div>

                    <div className="pt-2 text-center border-t border-slate-800/50">
                      <p className="text-[8px] text-slate-500">Invoice generated automatically by SupplAI Engine. All rights reserved.</p>
                    </div>
                  </div>
                </div>

                {/* Print button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Quotation Sheet</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
