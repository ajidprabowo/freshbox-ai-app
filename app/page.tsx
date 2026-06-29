'use client';

import React, { useState, useEffect } from 'react';
import {
  FreshBox,
  Rental,
  ProductBatch,
  MonitoringData,
  Invoice,
  UsageMode,
  BoxType,
  BoxRecommendationResult,
  RentalSuggestion,
} from '@/lib/types';
import {
  getBoxes,
  saveBoxes,
  getRentals,
  saveRentals,
  getProducts,
  saveProducts,
  getLatestBoxRecommendation,
  getLatestRentalSuggestion,
  saveLatestRentalSuggestion,
  clearLatestRentalSuggestion,
} from '@/lib/storage';
import { calculateRentalCost, calculateCumulativeImpact } from '@/lib/calculations';

// Reusable components
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import BoxCard from '@/components/BoxCard';
import ProductForm from '@/components/ProductForm';
import MonitoringCard from '@/components/MonitoringCard';
import CostBreakdown from '@/components/CostBreakdown';
import ReportPreview from '@/components/ReportPreview';
import BoxRecommendation from '@/components/BoxRecommendation';

// Icons
import {
  Box,
  CalendarDays,
  Leaf,
  Activity,
  Calculator,
  FileBarChart,
  TrendingUp,
  AlertTriangle,
  Info,
  Sparkles,
  MapPin,
  Building,
  Truck,
  CheckCircle2,
  HelpCircle,
  Thermometer,
  Droplets,
  ShieldAlert,
  Coins,
  FileText,
  User,
  Power,
  RotateCcw,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core application lists
  const [boxes, setBoxes] = useState<FreshBox[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [products, setProducts] = useState<ProductBatch[]>([]);

  // Simulation states
  const [monitoringList, setMonitoringList] = useState<MonitoringData[]>([]);
  const [globalAlerts, setGlobalAlerts] = useState<string[]>([]);

  // Selected states
  const [selectedBoxForBooking, setSelectedBoxForBooking] = useState<string>('');
  const [bookingConfirmedRental, setBookingConfirmedRental] = useState<Rental | null>(null);

  // Booking Form prefill states
  const [bookingCompany, setBookingCompany] = useState('');
  const [bookingStartDate, setBookingStartDate] = useState('2026-06-24');
  const [bookingEndDate, setBookingEndDate] = useState('2026-06-29');
  const [bookingUsageMode, setBookingUsageMode] = useState<UsageMode>('Distribution');
  const [bookingPickup, setBookingPickup] = useState('');
  const [bookingDestination, setBookingDestination] = useState('');

  // Merged workflow states
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [selectedRentalBoxId, setSelectedRentalBoxId] = useState<string>('');
  const [isViewRentalModalOpen, setIsViewRentalModalOpen] = useState(false);
  const [latestRentalSuggestion, setLatestRentalSuggestion] = useState<RentalSuggestion | null>(null);

  // New harvesting load pre-registration fields
  const [bookingProductCategory, setBookingProductCategory] = useState('Tomatoes');
  const [bookingProductName, setBookingProductName] = useState('');
  const [bookingProductWeight, setBookingProductWeight] = useState<number>(100);
  const [bookingNotes, setBookingNotes] = useState('');

  // Suggested Booking banner state
  const [suggestedBooking, setSuggestedBooking] = useState<BoxRecommendationResult | null>(null);

  // Recommendation focus state
  const [latestRecommendation, setLatestRecommendation] = useState<ProductBatch | null>(null);
  const [isRecommendationSubmitting, setIsRecommendationSubmitting] = useState(false);

  // Calculator states
  const [calcBoxType, setCalcBoxType] = useState<BoxType>('M');
  const [calcQuantity, setCalcQuantity] = useState<number>(1);
  const [calcDuration, setCalcDuration] = useState<number>(7);
  const [calcMode, setCalcMode] = useState<UsageMode>('Distribution');
  const [calcEnergyKwh, setCalcEnergyKwh] = useState<number>(35);
  const [calcPickup, setCalcPickup] = useState<boolean>(true);
  const [calcCleaning, setCalcCleaning] = useState<boolean>(true);
  const [calcLateDays, setCalcLateDays] = useState<number>(0);

  // Box filters
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterProductLoad, setFilterProductLoad] = useState<string>('All');

  // Report focus state
  const [selectedReportBatchId, setSelectedReportBatchId] = useState<string>('');

  // 1. Initial State Load
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    const initialBoxes = getBoxes();
    const initialRentals = getRentals();
    const initialProducts = getProducts();
    const initialRec = getLatestBoxRecommendation();
    const initialSugg = getLatestRentalSuggestion();

    setBoxes(initialBoxes);
    setRentals(initialRentals);
    setProducts(initialProducts);

    if (initialRec) {
      setSuggestedBooking(initialRec);
    }

    if (initialSugg) {
      setLatestRentalSuggestion(initialSugg);
    }

    if (initialProducts.length > 0) {
      setSelectedReportBatchId(initialProducts[0].id);
      setLatestRecommendation(initialProducts[0]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 2. Generate Real-time IoT Monitoring Matrix
  useEffect(() => {
    if (!mounted || boxes.length === 0) return;

    // Build the initial monitoring structures for all "Active Rental" boxes
    const rentedBoxes = boxes.filter((b) => b.status === 'Active Rental');
    const list: MonitoringData[] = rentedBoxes.map((box) => {
      // Find assigned product if any
      const matchingProduct = products.find((p) => p.assignedBoxId === box.id);
      const productName = matchingProduct ? matchingProduct.name : 'Chilled Load Preset';
      const risk = matchingProduct?.recommendation?.spoilageRisk || 'Low';

      return {
        boxId: box.id,
        productName,
        temperature: box.currentTemp,
        humidity: box.currentHumidity,
        battery: box.batteryLevel,
        doorStatus: 'Closed',
        gpsStatus: box.location === 'warehouse' ? 'Latitude: -6.2088, Longitude: 106.8456 (Warehouse Zone)' : 'Route: Highway KM 48 (Jakarta Bound)',
        coolingStatus: 'Active',
        spoilageRisk: risk,
        remainingSafeTime: risk === 'Low' ? '72 Hours' : risk === 'Medium' ? '36 Hours' : '8 Hours',
        alerts: [],
      };
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMonitoringList(list);
  }, [mounted, boxes, products]);

  // 3. Simulated IoT Telemetry Loop (Triggers every 5 seconds)
  useEffect(() => {
    if (!mounted || monitoringList.length === 0) return;

    const interval = setInterval(() => {
      setMonitoringList((prevList) => {
        let updatedAlerts: string[] = [];

        const nextList = prevList.map((item) => {
          // Add a tiny random thermal drift
          const tempShift = (Math.random() - 0.5) * 0.4;
          const humidityShift = (Math.random() - 0.5) * 1.5;
          const nextTemp = Math.max(-20, Math.min(30, item.temperature + tempShift));
          const nextHumidity = Math.max(40, Math.min(100, item.humidity + humidityShift));

          // Battery depletion (slow discharge)
          const nextBattery = Math.max(1, item.battery - (Math.random() > 0.7 ? 1 : 0));

          // Simulated random events
          const doorTrigger = Math.random() > 0.95 ? 'Open' : 'Closed';
          const compressorState = Math.random() > 0.85 ? 'Idle' : 'Active';

          // Detect active anomalies
          const currentAlerts: string[] = [];
          if (nextBattery < 15) {
            currentAlerts.push(`CRITICAL: Battery Level low on container ${item.boxId} (${nextBattery}%).`);
          }
          if (doorTrigger === 'Open') {
            currentAlerts.push(`WARNING: Container ${item.boxId} door detected open on truck fleet.`);
          }

          // Evaluate temperature bounds based on product risk levels
          if (item.spoilageRisk === 'High' && nextTemp > 6) {
            currentAlerts.push(`CRITICAL ALERT: Temp warning on ${item.boxId} (${nextTemp.toFixed(1)}°C) for sensitive load!`);
          }

          if (currentAlerts.length > 0) {
            updatedAlerts = [...updatedAlerts, ...currentAlerts];
          }

          return {
            ...item,
            temperature: nextTemp,
            humidity: nextHumidity,
            battery: nextBattery,
            doorStatus: doorTrigger as 'Closed' | 'Open',
            coolingStatus: compressorState as 'Active' | 'Idle',
            alerts: currentAlerts,
          };
        });

        // Sync global alerts if any changed
        if (updatedAlerts.length > 0) {
          setGlobalAlerts((prev) => Array.from(new Set([...updatedAlerts, ...prev])).slice(0, 5));
        }

        return nextList;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted, monitoringList.length]);

  // If not mounted yet, show simple layout to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans text-slate-800">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold text-slate-600">Syncing FreshBox Workspace...</p>
        </div>
      </div>
    );
  }

  // Calculate Cumulative Impact indicators
  const cumulativeImpact = calculateCumulativeImpact(products);

  // Merged Direct Booking & Product Load Attachment Handler
  const handleDirectBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCompany || !selectedBoxForBooking || !bookingStartDate || !bookingEndDate || !bookingPickup || !bookingDestination) {
      alert('Please fill out all booking form fields.');
      return;
    }

    const newRental: Rental = {
      id: `RNT-${Math.floor(100 + Math.random() * 900)}`,
      userName: bookingCompany,
      boxId: selectedBoxForBooking,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
      usageMode: bookingUsageMode,
      pickupLocation: bookingPickup,
      destinationLocation: bookingDestination,
      bookingDate: new Date().toISOString().split('T')[0],
    };

    // Attach product load if supplied
    const productBatchName = bookingProductName || `Fresh Load`;
    
    // Update boxes list: change rented box status and bind it
    const updatedBoxes = boxes.map((box) => {
      if (box.id === selectedBoxForBooking) {
        return {
          ...box,
          status: 'Active Rental' as const,
          assignedProductId: productBatchName,
          activeRentalId: newRental.id,
        };
      }
      return box;
    });

    // Also register a ProductBatch and attach it to the box so it is loaded!
    const newProductBatch: ProductBatch = {
      id: `BTCH-${Math.floor(1000 + Math.random() * 9000)}`,
      name: productBatchName,
      category: bookingProductCategory,
      quantityKg: bookingProductWeight,
      origin: bookingPickup,
      destination: bookingDestination,
      qualityGrade: 'A',
      estimatedShelfLifeDays: 14, // default
      dateStored: bookingStartDate,
      expectedDeliveryDate: bookingEndDate,
      assignedBoxId: selectedBoxForBooking,
      recommendation: {
        recommendedTemperature: `${bookingProductCategory === 'Tomatoes' ? 12 : bookingProductCategory === 'Seafood' ? 1 : 4}°C`,
        recommendedHumidity: '90%',
        airflowLevel: 'Medium',
        storageDurationLimit: '14 Days',
        spoilageRisk: 'Low',
        handlingRecommendation: bookingNotes || 'Maintained via FreshBox smart microclimate controller.',
        energyOptimizationTip: 'Enable eco-saving mode during warehouse static storage.',
        reasoningSummary: 'Optimal settings for cold chain lifecycle preservation.'
      }
    };

    const nextRentals = [newRental, ...rentals];
    const nextProducts = [newProductBatch, ...products];

    // Save and sync state
    setBoxes(updatedBoxes);
    saveBoxes(updatedBoxes);
    setRentals(nextRentals);
    saveRentals(nextRentals);
    setProducts(nextProducts);
    saveProducts(nextProducts);

    // Confirm booking
    setBookingConfirmedRental(newRental);
    setIsRentalModalOpen(false);
  };

  // Administrative Lease Termination Handler
  const handleTerminateRental = (boxId: string) => {
    if (!confirm(`Are you sure you want to terminate the lease for container ${boxId}? This will discharge the load and restore the container's status to Available.`)) {
      return;
    }

    // Restore box status to Available, remove assignedProductId and activeRentalId
    const updatedBoxes = boxes.map((box) => {
      if (box.id === boxId) {
        return {
          ...box,
          status: 'Available' as const,
          assignedProductId: undefined,
          activeRentalId: undefined,
        };
      }
      return box;
    });

    // Filter out active rental record for this box
    const nextRentals = rentals.filter((r) => r.boxId !== boxId);

    // Discharge/unlink any product batch assigned to this box
    const nextProducts: ProductBatch[] = products.map((p) => {
      if (p.assignedBoxId === boxId) {
        return {
          ...p,
          assignedBoxId: '', // discharge safely as empty string
        };
      }
      return p;
    });

    // Save and sync state
    setBoxes(updatedBoxes);
    saveBoxes(updatedBoxes);
    setRentals(nextRentals);
    saveRentals(nextRentals);
    setProducts(nextProducts);
    saveProducts(nextProducts);

    setIsViewRentalModalOpen(false);
    setSelectedRentalBoxId('');
  };

  // Booking Form submit handler
  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const userName = data.get('userName') as string;
    const boxId = data.get('boxId') as string;
    const startDate = data.get('startDate') as string;
    const endDate = data.get('endDate') as string;
    const usageMode = data.get('usageMode') as UsageMode;
    const pickupLocation = data.get('pickupLocation') as string;
    const destinationLocation = data.get('destinationLocation') as string;

    if (!userName || !boxId || !startDate || !endDate || !pickupLocation || !destinationLocation) {
      alert('Please fill out all booking form fields.');
      return;
    }

    const newRental: Rental = {
      id: `RNT-${Math.floor(100 + Math.random() * 900)}`,
      userName,
      boxId,
      startDate,
      endDate,
      usageMode,
      pickupLocation,
      destinationLocation,
      bookingDate: '2026-06-24',
    };

    // Update boxes list: change rented box status and bind it
    const updatedBoxes = boxes.map((box) => {
      if (box.id === boxId) {
        return {
          ...box,
          status: 'Active Rental' as const,
          assignedProductId: 'New Rental Active Load',
        };
      }
      return box;
    });

    const nextRentals = [newRental, ...rentals];

    // Save and sync state
    setBoxes(updatedBoxes);
    saveBoxes(updatedBoxes);
    setRentals(nextRentals);
    saveRentals(nextRentals);

    // Confirm booking
    setBookingConfirmedRental(newRental);
    e.currentTarget.reset();
  };

  // Product batch registration handler + AI API recommendation fetch
  const handleProductSubmit = async (
    batchData: Omit<ProductBatch, 'recommendation'>,
    usageMode: UsageMode
  ) => {
    setIsRecommendationSubmitting(true);
    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: batchData.name,
          productCategory: batchData.category,
          quantityKg: batchData.quantityKg,
          estimatedShelfLifeDays: batchData.estimatedShelfLifeDays,
          dateStored: batchData.dateStored,
          expectedDeliveryDate: batchData.expectedDeliveryDate,
          usageMode: usageMode,
          assignedBoxId: batchData.assignedBoxId,
        }),
      });

      const recommendationData = await response.json();

      if (recommendationData.error) {
        throw new Error(recommendationData.error);
      }

      const completeBatch: ProductBatch = {
        ...batchData,
        recommendation: recommendationData,
      };

      // Update product batches in state
      const nextProducts = [completeBatch, ...products];
      setProducts(nextProducts);
      saveProducts(nextProducts);

      // Bind product payload details to the associated Box
      const updatedBoxes = boxes.map((box) => {
        if (box.id === batchData.assignedBoxId) {
          return {
            ...box,
            assignedProductId: batchData.name,
          };
        }
        return box;
      });
      setBoxes(updatedBoxes);
      saveBoxes(updatedBoxes);

      setLatestRecommendation(completeBatch);
      setSelectedReportBatchId(completeBatch.id);
    } catch (error) {
      console.error('Failed to register product or query AI advice:', error);
      alert('Error fetching AI advice. Standard expert rules applied instead.');
    } finally {
      setIsRecommendationSubmitting(false);
    }
  };

  // Helper calculation for dynamic invoice in tab
  const activeInvoice: Invoice = {
    boxId: 'FB-TEMP',
    boxType: calcBoxType,
    durationDays: calcDuration,
    quantity: calcQuantity,
    usageMode: calcMode,
    energyUsageKwh: calcEnergyKwh,
    pickupDeliveryService: calcPickup,
    cleaningService: calcCleaning,
    lateReturnDays: calcLateDays,
    breakdown: calculateRentalCost({
      boxType: calcBoxType,
      numberOfBoxes: calcQuantity,
      durationDays: calcDuration,
      usageMode: calcMode,
      estimatedEnergyKwh: calcEnergyKwh,
      pickupDelivery: calcPickup,
      cleaning: calcCleaning,
      lateReturnDays: calcLateDays,
    }),
  };

  // Filters for Box list
  const filteredBoxes = boxes.filter((box) => {
    const matchStatus = filterStatus === 'All' || box.status === filterStatus;
    const matchType = filterType === 'All' || box.type === filterType;
    const matchLoc = filterLocation === 'All' || box.location === filterLocation;
    const matchProductLoad =
      filterProductLoad === 'All' ||
      (filterProductLoad === 'Empty' && !box.assignedProductId) ||
      (filterProductLoad === 'Loaded' && !!box.assignedProductId);
    return matchStatus && matchType && matchLoc && matchProductLoad;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main workspace frame */}
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto space-y-8">
        
        {/* Global Alarms Marquee if any critical alerts exist */}
        {globalAlerts.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <div className="text-xs text-amber-900 font-medium overflow-hidden truncate">
              <span className="font-bold">Active System Alerts:</span> {globalAlerts[0]}
            </div>
            <button
              onClick={() => setGlobalAlerts([])}
              className="ml-auto text-[10px] text-amber-700 hover:text-amber-900 font-bold uppercase"
            >
              Clear
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 1: DASHBOARD                        */}
        {/* ======================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header branding */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Monitor</h1>
                <p className="text-sm text-slate-500 mt-1">Real-time telemetry and supply chain statistics overview.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>IndoFresh Cloud Center Synchronized</span>
              </div>
            </div>

            {/* KPI grid panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Available Containers"
                value={boxes.filter((b) => b.status === 'Available').length}
                subtitle={`${boxes.filter((b) => b.status === 'Maintenance').length} in maintenance`}
                icon={Box}
                variant="slate"
              />
              <StatCard
                title="Active Rented Boxes"
                value={boxes.filter((b) => b.status === 'Active Rental').length}
                subtitle="In-transit tracking active"
                icon={Truck}
                variant="blue"
              />
              <StatCard
                title="Protected Volumes"
                value={`${products.reduce((acc, p) => acc + p.quantityKg, 0).toLocaleString()} Kg`}
                subtitle={`${products.length} registered batches stored`}
                icon={Leaf}
                variant="emerald"
              />
              <StatCard
                title="Average Compliance"
                value="95.3%"
                subtitle="Supply chain target met"
                icon={CheckCircle2}
                variant="indigo"
              />
            </div>

            {/* Main supply chain layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sustainability impact micro summary */}
              <div className="bg-emerald-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-emerald-950/10 space-y-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="bg-emerald-800/30 border border-emerald-700/30 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase">
                    <TrendingUp size={12} />
                    <span>Live Green Offsets</span>
                  </div>
                  <h2 className="text-xl font-bold font-sans tracking-tight">Net Sustainability Abatement</h2>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">
                    SupplAI units prevent biological ripening decay and minimize global thermal trailer waste.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-emerald-800/50">
                  <div className="flex justify-between items-end border-b border-emerald-800/30 pb-3">
                    <span className="text-xs text-emerald-300/80">Food Loss Saved</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {cumulativeImpact.foodLossAvoidedKg.toFixed(1)} Kg
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-emerald-800/30 pb-3">
                    <span className="text-xs text-emerald-300/80">Carbon Prevented</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {cumulativeImpact.co2eAvoidedKg.toFixed(1)} kgCO2e
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-emerald-300/80">Economic Salvage</span>
                    <span className="text-xl font-bold font-mono text-white">
                      Rp{cumulativeImpact.costLossAvoidedRp.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('impact')}
                  className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/15 active:scale-[0.98] transition-all"
                >
                  <span>Explore Sustainability Dashboard</span>
                  <Sparkles size={12} />
                </button>
              </div>

              {/* Rented active box list */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-sans font-bold text-slate-800 text-base">Active Registered Fleets</h3>
                    <p className="text-xs text-slate-400">Rented containers equipped with active IoT monitors.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('monitoring')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
                  >
                    Launch Live IoT
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[340px] divide-y divide-slate-100 mt-4 space-y-4">
                  {boxes.filter((b) => b.status === 'Active Rental').length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                      <HelpCircle size={32} className="mx-auto stroke-[1.5]" />
                      <p className="text-xs font-medium">No containers are currently booked or loaded.</p>
                      <button
                        onClick={() => setActiveTab('box-rental')}
                        className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                      >
                        Book a container now <Sparkles size={12} />
                      </button>
                    </div>
                  ) : (
                    boxes
                      .filter((b) => b.status === 'Active Rental')
                      .map((box) => {
                        const matchingProduct = products.find((p) => p.assignedBoxId === box.id);
                        return (
                          <div key={box.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-slate-800 text-sm">{box.id}</span>
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                {matchingProduct ? matchingProduct.name : 'Chilled Logistics Load'}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-xs font-bold text-slate-800">{box.currentTemp}°C</span>
                              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                                Battery: {box.batteryLevel}%
                              </p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: AI RECOMMENDATION                 */}
        {/* ======================================= */}
        {activeTab === 'recommendation-cost' && (
          <BoxRecommendation
            onUseRecommendation={(rec) => {
              setLatestRentalSuggestion(rec);
              setActiveTab('box-rental');
            }}
          />
        )}

        {/* ======================================= */}
        {/* TAB 1: BOX RENTAL                        */}
        {/* ======================================= */}
        {activeTab === 'box-rental' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">FreshBox Rental Desk</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Browse real-time container availabilities, apply AI-driven size suggestions, and rent smart cold chain units instantly.
                </p>
              </div>
            </div>

            {/* Smart Loaded Suggestion Banner */}
            {latestRentalSuggestion && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden animate-scale-up">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-1.5 z-10">
                  <span className="bg-slate-950/20 text-emerald-100 font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md">
                    AI Logistics Plan Loaded
                  </span>
                  <h3 className="text-base font-extrabold font-sans">
                    Recommendation for {latestRentalSuggestion.productName} ({latestRentalSuggestion.totalWeightKg} Kg)
                  </h3>
                  <p className="text-xs text-emerald-50/90 max-w-2xl leading-relaxed">
                    Plan recommends renting <span className="font-bold underline">{latestRentalSuggestion.recommendedQuantity} × {latestRentalSuggestion.recommendedBoxType}</span> containers for the route <span className="font-bold">{latestRentalSuggestion.pickupLocation} → {latestRentalSuggestion.destinationLocation}</span>. Total estimated cost: <span className="font-mono font-bold">Rp{latestRentalSuggestion.estimatedRentalCost.toLocaleString()}</span>.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 z-10 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => {
                      // Apply details to booking form states
                      const boxTypeLetter = latestRentalSuggestion.recommendedBoxType.endsWith('S') ? 'S' : latestRentalSuggestion.recommendedBoxType.endsWith('M') ? 'M' : 'L';
                      
                      // Auto pick an available box matching this type if possible
                      const availableBoxOfThisType = boxes.find((b) => b.type === boxTypeLetter && b.status === 'Available');
                      
                      setFilterType(boxTypeLetter);
                      setBookingProductCategory(latestRentalSuggestion.productCategory);
                      setBookingProductName(latestRentalSuggestion.productName);
                      setBookingProductWeight(latestRentalSuggestion.totalWeightKg);
                      setBookingUsageMode(latestRentalSuggestion.usageMode);
                      setBookingPickup(latestRentalSuggestion.pickupLocation);
                      setBookingDestination(latestRentalSuggestion.destinationLocation);
                      
                      if (availableBoxOfThisType) {
                        setSelectedBoxForBooking(availableBoxOfThisType.id);
                        setIsRentalModalOpen(true);
                      } else {
                        alert(`Configured form inputs! Please click "Rent This Box" on any of the filtered available ${latestRentalSuggestion.recommendedBoxType} containers below.`);
                      }
                    }}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Pre-fill & Auto-Book</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => {
                      clearLatestRentalSuggestion();
                      setLatestRentalSuggestion(null);
                    }}
                    className="px-3.5 py-2.5 border border-white/20 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Filter Controls Panel */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Status Filter</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Active Rental">Active Rental</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Box Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="All">All Sizes</option>
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Operational Location</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="All">All Locations</option>
                  <option value="warehouse">Warehouse Zone</option>
                  <option value="truck">Logistics Truck</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Product Load</label>
                <select
                  value={filterProductLoad}
                  onChange={(e) => setFilterProductLoad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="All">All Product Loads</option>
                  <option value="Empty">Empty (Unloaded)</option>
                  <option value="Loaded">Loaded (Assigned Product)</option>
                </select>
              </div>
            </div>

            {/* Container Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoxes.map((box) => (
                <BoxCard
                  key={box.id}
                  box={box}
                  onBookClick={(boxId) => {
                    setSelectedBoxForBooking(boxId);
                    setBookingProductCategory(latestRentalSuggestion?.productCategory || 'Tomatoes');
                    setBookingProductName(latestRentalSuggestion?.productName || '');
                    setBookingProductWeight(latestRentalSuggestion?.totalWeightKg || 120);
                    setBookingNotes('');
                    setIsRentalModalOpen(true);
                  }}
                  onViewRentalClick={(boxId) => {
                    setSelectedRentalBoxId(boxId);
                    setIsViewRentalModalOpen(true);
                  }}
                />
              ))}

              {filteredBoxes.length === 0 && (
                <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 space-y-4">
                  <HelpCircle size={40} className="mx-auto stroke-[1.2]" />
                  <div>
                    <p className="font-semibold text-slate-700">No FreshBox containers fit this criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your status, capacity, or location filters.</p>
                  </div>
                </div>
              )}
            </div>

            {/* 1. RENTAL BOOKING MODAL (DRAWER FORM) */}
            {isRentalModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative animate-scale-up">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 font-mono uppercase tracking-wide">
                        Lease Form
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans mt-1">
                        Rent Smart Container: {selectedBoxForBooking}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsRentalModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full text-lg cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleDirectBookingSubmit} className="space-y-6">
                    {/* Customer & Route Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Company / Renter Name *</label>
                        <input
                          type="text"
                          value={bookingCompany}
                          onChange={(e) => setBookingCompany(e.target.value)}
                          placeholder="e.g. AgriTrade Indonesia"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Operational Mode *</label>
                        <select
                          value={bookingUsageMode}
                          onChange={(e) => setBookingUsageMode(e.target.value as UsageMode)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white"
                          required
                        >
                          <option value="Storage">Warehouse Static Storage</option>
                          <option value="Distribution">Inter-city Logistics Truck</option>
                          <option value="Storage + Distribution">Transit Logistics Lifecycle</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lease Start Date *</label>
                        <input
                          type="date"
                          value={bookingStartDate}
                          onChange={(e) => setBookingStartDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lease End Date *</label>
                        <input
                          type="date"
                          value={bookingEndDate}
                          onChange={(e) => setBookingEndDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup Location *</label>
                        <input
                          type="text"
                          value={bookingPickup}
                          onChange={(e) => setBookingPickup(e.target.value)}
                          placeholder="e.g. Warehouse Bandung"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Destination Location *</label>
                        <input
                          type="text"
                          value={bookingDestination}
                          onChange={(e) => setBookingDestination(e.target.value)}
                          placeholder="e.g. Jakarta Retail Hub"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Integrated Product Load Attachment */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Leaf size={14} className="text-emerald-500" />
                        <span>Integrated Product Load Attachment</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Product Category</label>
                          <select
                            value={bookingProductCategory}
                            onChange={(e) => setBookingProductCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                          >
                            <option value="Tomatoes">Tomatoes</option>
                            <option value="Leafy Vegetables">Leafy Greens</option>
                            <option value="Seafood">Seafood</option>
                            <option value="Dairy">Dairy & Eggs</option>
                            <option value="Meat">Meat & Poultry</option>
                            <option value="Tropical Fruit">Tropical Fruits</option>
                            <option value="Frozen Food">Frozen Food</option>
                            <option value="Other">Other Crop</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Product Name</label>
                          <input
                            type="text"
                            value={bookingProductName}
                            onChange={(e) => setBookingProductName(e.target.value)}
                            placeholder="e.g. Premium Tomatoes"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Weight (Kg)</label>
                          <input
                            type="number"
                            min="1"
                            value={bookingProductWeight}
                            onChange={(e) => setBookingProductWeight(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Microclimate Notes</label>
                        <input
                          type="text"
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          placeholder="e.g. Maintain strict 11°C with active humidity ventilation."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsRentalModalOpen(false)}
                        className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                      >
                        Confirm & Activate Cold Chain
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. ACTIVE RENTAL DETAILS DIALOG */}
            {isViewRentalModalOpen && selectedRentalBoxId && (
              <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                {(() => {
                  const rental = rentals.find((r) => r.boxId === selectedRentalBoxId);
                  const box = boxes.find((b) => b.id === selectedRentalBoxId);
                  const product = products.find((p) => p.assignedBoxId === selectedRentalBoxId);

                  if (!box) return null;

                  return (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-scale-up space-y-6">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 font-mono uppercase tracking-wide">
                            Active Contract
                          </span>
                          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans mt-1">
                            Diagnostics: {box.id}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setIsViewRentalModalOpen(false);
                            setSelectedRentalBoxId('');
                          }}
                          className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full text-lg cursor-pointer"
                        >
                          ×
                        </button>
                      </div>

                      {/* Diagnostic details */}
                      <div className="space-y-4 text-xs text-slate-600">
                        {rental ? (
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] font-mono">Renter Company</span>
                              <span className="font-semibold text-slate-800">{rental.userName}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] font-mono">Agreement Code</span>
                              <span className="font-mono font-bold text-slate-800">{rental.id}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] font-mono">Lease Dates</span>
                              <span className="font-semibold text-slate-800">{rental.startDate} to {rental.endDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] font-mono">Logistics Route</span>
                              <span className="font-semibold text-slate-800 text-right">{rental.pickupLocation} → {rental.destinationLocation}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-amber-600 text-[11px] font-medium bg-amber-50 p-3 rounded-xl">
                            No active contract parameters found. Container assigned with basic transit parameters.
                          </p>
                        )}

                        {/* Real-time parameters */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                            <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wide">Environment Temp</span>
                            <p className="text-sm font-extrabold text-slate-800 mt-0.5">{box.currentTemp}°C</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                            <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wide">Environment Moisture</span>
                            <p className="text-sm font-extrabold text-slate-800 mt-0.5">{box.currentHumidity}%</p>
                          </div>
                        </div>

                        {/* Attached Product Load */}
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                          <span className="text-emerald-800 font-bold uppercase tracking-wider text-[8px] font-mono flex items-center gap-1">
                            <Leaf size={12} />
                            <span>Attached Product Load</span>
                          </span>
                          {product ? (
                            <div className="space-y-1.5 mt-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-800">{product.name}</span>
                                <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {product.quantityKg} Kg
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono">Category: {product.category}</p>
                              {product.recommendation && (
                                <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed border-t border-slate-100 pt-1">
                                  Microclimate bounds: Temp {product.recommendation.recommendedTemperature} | Humidity {product.recommendation.recommendedHumidity}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                              No microclimate crops bound. Current product load string: <span className="font-mono underline">{box.assignedProductId || 'Loaded'}</span>.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Modal Footer with lease termination trigger */}
                      <div className="flex justify-between gap-3 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleTerminateRental(box.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-xs transition-all cursor-pointer"
                        >
                          Terminate Lease Agreement
                        </button>
                        <button
                          onClick={() => {
                            setIsViewRentalModalOpen(false);
                            setSelectedRentalBoxId('');
                          }}
                          className="px-5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Close View
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: PRODUCT REGISTRATION              */}
        {/* ======================================= */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Register Harvest Product</h1>
              <p className="text-sm text-slate-500 mt-1">
                Register agricultural crops and query SupplAI for temperature and moisture microclimate recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Registration Form (Left) */}
              <div className="lg:col-span-3">
                <ProductForm
                  availableBoxes={boxes}
                  onSubmit={handleProductSubmit}
                  isSubmitting={isRecommendationSubmitting}
                />
              </div>

              {/* Recommendation Screen (Right) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                    <Sparkles className="text-emerald-500" size={18} />
                    <h3 className="font-sans font-bold text-slate-800 text-sm">AI Microclimate Preset</h3>
                  </div>

                  {latestRecommendation?.recommendation ? (
                    <div className="space-y-5">
                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Active Product Target</p>
                          <p className="font-bold text-slate-800 mt-0.5">{latestRecommendation.name}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono rounded">
                          {latestRecommendation.recommendation.spoilageRisk} Risk
                        </span>
                      </div>

                      {/* Reading targets */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 font-medium font-mono text-[9px] uppercase">Temp Target</span>
                          <p className="text-base font-extrabold text-slate-800 mt-1">
                            {latestRecommendation.recommendation.recommendedTemperature}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 font-medium font-mono text-[9px] uppercase">Humidity Target</span>
                          <p className="text-base font-extrabold text-slate-800 mt-1">
                            {latestRecommendation.recommendation.recommendedHumidity}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 font-medium font-mono text-[9px] uppercase">Airflow Speed</span>
                          <p className="text-base font-extrabold text-slate-800 mt-1">
                            {latestRecommendation.recommendation.airflowLevel}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 font-medium font-mono text-[9px] uppercase">Safety duration</span>
                          <p className="text-base font-extrabold text-slate-800 mt-1">
                            {latestRecommendation.recommendation.storageDurationLimit}
                          </p>
                        </div>
                      </div>

                      {/* Scientific Rationale */}
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-700">Scientific Rationale:</span>
                        <p className="text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/30">
                          {latestRecommendation.recommendation.reasoningSummary}
                        </p>
                      </div>

                      {/* Handling Guide */}
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-700">Cold Chain Handling rules:</span>
                        <p className="text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/30">
                          {latestRecommendation.recommendation.handlingRecommendation}
                        </p>
                      </div>

                      {/* Eco Tip */}
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <TrendingUp size={12} /> Carbon Optimization Tip:
                        </span>
                        <p className="text-emerald-800 leading-relaxed bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/30">
                          {latestRecommendation.recommendation.energyOptimizationTip}
                        </p>
                      </div>

                      {/* Simulated Push settings to container box */}
                      <button
                        onClick={() => {
                          const recommendedTempRange = latestRecommendation.recommendation?.recommendedTemperature;
                          // Extract first number if any
                          const numericMatch = recommendedTempRange?.match(/-?\d+/);
                          const targetTemp = numericMatch ? parseFloat(numericMatch[0]) : 4;

                          const updatedBoxes = boxes.map((box) => {
                            if (box.id === latestRecommendation.assignedBoxId) {
                              return {
                                ...box,
                                currentTemp: targetTemp,
                                currentHumidity: recommendedTempRange?.includes('%') ? 90 : 85,
                              };
                            }
                            return box;
                          });
                          setBoxes(updatedBoxes);
                          saveBoxes(updatedBoxes);
                          alert(`IoT signal sent successfully! Container ${latestRecommendation.assignedBoxId} pre-chilling initiated to target ${targetTemp}°C.`);
                        }}
                        className="w-full py-3 border border-emerald-200 hover:border-emerald-300 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Power size={13} className="text-emerald-600 animate-pulse" />
                        <span>Apply & Sync target telemetry parameters to IoT Box</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 space-y-3">
                      <HelpCircle size={32} className="mx-auto stroke-[1.5]" />
                      <p className="text-xs font-medium">No harvest load registered yet.</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                        Fill in the registration parameters to load specific crop presets.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: REAL-TIME IoT                    */}
        {/* ======================================= */}
        {activeTab === 'monitoring' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Active IoT Live Telemetry</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Read live container sensor arrays. Values automatically simulate small environment shifts every 5s.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-slate-600">Continuous Syncing (5s interval)</span>
              </div>
            </div>

            {/* Live Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monitoringList.map((item) => (
                <MonitoringCard key={item.boxId} data={item} />
              ))}

              {monitoringList.length === 0 && (
                <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 space-y-4">
                  <Activity size={40} className="mx-auto text-slate-300 animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-slate-700">No Active Cold Chains Found</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Rent a container and register a harvest load to initialize your IoT trackers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
                  >
                    Launch a Container Box
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 6: RENTAL COST CALCULATOR            */}
        {/* ======================================= */}
        {activeTab === 'calculator' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Rental Cost Estimator</h1>
              <p className="text-sm text-slate-500 mt-1">
                Customize operational modes, cleaning services, and lease scopes to compile instant client quotes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form Input Selector (Left) */}
              <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                  <Calculator className="text-emerald-500" size={18} />
                  <h3 className="font-sans font-bold text-slate-800 text-sm">Agreement Customization</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Box size selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">FreshBox Size Model</label>
                    <div className="flex gap-3">
                      {(['S', 'M', 'L'] as BoxType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCalcBoxType(type)}
                          className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                            calcBoxType === type
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Model {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Number of Boxes</label>
                    <input
                      type="number"
                      min="1"
                      value={calcQuantity}
                      onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  {/* Rental Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rental Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={calcDuration}
                      onChange={(e) => setCalcDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  {/* Usage Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Operational Mode</label>
                    <select
                      value={calcMode}
                      onChange={(e) => setCalcMode(e.target.value as UsageMode)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="Storage">Storage Only</option>
                      <option value="Distribution">Distribution Fleet</option>
                      <option value="Storage + Distribution">Storage & Distribution</option>
                    </select>
                  </div>

                  {/* Estimated energy consumption */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estimated Energy (kWh)</label>
                    <input
                      type="number"
                      min="0"
                      value={calcEnergyKwh}
                      onChange={(e) => setCalcEnergyKwh(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  {/* Late return days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Late Return Offset (Days)</label>
                    <input
                      type="number"
                      min="0"
                      value={calcLateDays}
                      onChange={(e) => setCalcLateDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  {/* Value Added Services Switches */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-200">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Value Added Logistics Services</label>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Pickup & Delivery */}
                      <button
                        type="button"
                        onClick={() => setCalcPickup(!calcPickup)}
                        className={`flex-1 flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                          calcPickup
                            ? 'bg-emerald-50/50 border-emerald-500/20 text-emerald-900'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold leading-none">Fleet Transport Service</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Rp50,000 / Box Flat</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${calcPickup ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                          {calcPickup && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>

                      {/* Deep Cleaning */}
                      <button
                        type="button"
                        onClick={() => setCalcCleaning(!calcCleaning)}
                        className={`flex-1 flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                          calcCleaning
                            ? 'bg-emerald-50/50 border-emerald-500/20 text-emerald-900'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold leading-none">Sanitization & Deep Clean</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Rp25,000 / Box Flat</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${calcCleaning ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                          {calcCleaning && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Sheet (Right) */}
              <div className="lg:col-span-2">
                <CostBreakdown invoice={activeInvoice} />
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 7: REPORTS                          */}
        {/* ======================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans font-sans">Cold Chain Quality Audit Report</h1>
              <p className="text-sm text-slate-500 mt-1">
                Audit compliance scores, food waste offsets, thermal logs, and generate official supply chain audit paperwork.
              </p>
            </div>

            {/* Select product batch dropdown */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono block">SELECT BATCH TO AUDIT</span>
                <select
                  value={selectedReportBatchId}
                  onChange={(e) => setSelectedReportBatchId(e.target.value)}
                  className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="" disabled>Select a crop batch</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Showing audit compliance data loaded from container logs.
              </p>
            </div>

            {/* Audit Document Display */}
            {selectedReportBatchId && products.find((p) => p.id === selectedReportBatchId) ? (
              <ReportPreview
                batch={products.find((p) => p.id === selectedReportBatchId)!}
                box={boxes.find((b) => b.id === products.find((p) => p.id === selectedReportBatchId)!.assignedBoxId)}
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 space-y-4">
                <FileBarChart size={40} className="mx-auto text-slate-300" />
                <div>
                  <h3 className="font-semibold text-slate-700 font-sans">No Audit Compliances Registered</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Please register products inside the &quot;Product Register&quot; tab to construct cold chain audit forms.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 8: IMPACT                           */}
        {/* ======================================= */}
        {activeTab === 'impact' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans font-sans">Environmental Sustainability Impact</h1>
              <p className="text-sm text-slate-500 mt-1">
                Net-green metrics computed from avoided biological decomposition decay and optimized power curves.
              </p>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Box 1: Protected volumes */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">KPI Impact 1</span>
                  <h3 className="text-lg font-bold font-sans text-slate-800">Total Net-Volume Protected</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Total harvest volume registered and successfully transported within thermal boundaries.
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {cumulativeImpact.foodProtectedKg.toLocaleString()} <span className="text-sm font-normal text-slate-500 font-sans">Kg</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Across {products.length} registered batch leases</p>
                </div>
              </div>

              {/* Box 2: Food Waste Avoided */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">KPI Impact 2</span>
                  <h3 className="text-lg font-bold font-sans text-slate-800">Avoided Biological Decay</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Simulated harvest mass salvaged from rotting under fluctuating trailer temperatures.
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-emerald-600 tracking-tight font-mono">
                    {cumulativeImpact.foodLossAvoidedKg.toFixed(1)} <span className="text-sm font-normal text-slate-500 font-sans">Kg</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Calculated via low-risk microclimate status</p>
                </div>
              </div>

              {/* Box 3: Carbon offsets */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">KPI Impact 3</span>
                  <h3 className="text-lg font-bold font-sans text-slate-800">Carbon Abatement (CO2e)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Prevented greenhouse gas footprint by averting rotting emissions (2.5 kgCO2e per Kg food).
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-indigo-600 tracking-tight font-mono">
                    {cumulativeImpact.co2eAvoidedKg.toFixed(1)} <span className="text-sm font-normal text-slate-500 font-sans">kgCO2e</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Verified with IPCC supply-chain variables</p>
                </div>
              </div>

              {/* Box 4: Economic salvage */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">KPI Impact 4</span>
                  <h3 className="text-lg font-bold font-sans text-slate-800">Economic Value Recovered</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Recovered agricultural value (flat estimated salvage index: Rp20,000 per Kg).
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    Rp{cumulativeImpact.costLossAvoidedRp.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Returned directly to smallholder farm margins</p>
                </div>
              </div>

              {/* Box 5: Energy Saved */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">KPI Impact 5</span>
                  <h3 className="text-lg font-bold font-sans text-slate-800">Thermal Energy Abatement</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Saved logistics energy versus conventional full-trailer cooling grids.
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-teal-600 tracking-tight font-mono">
                    {cumulativeImpact.energySavedKwh.toFixed(1)} <span className="text-sm font-normal text-slate-500 font-sans">kWh</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Calculated under localized smart compartment grids</p>
                </div>
              </div>

              {/* Bento Box 6: Educational Pitch Card */}
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Modular Intelligence Advantage</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Traditional shipping fleets cool entire trailers to single temperatures, leading to ripening mismatches. FreshBox compartmentalizes the cold chain, regulating individual microclimates to reduce total energy waste by up to 64%.
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
                  <span>FRESHBOX CORE AI MVP</span>
                  <span className="text-emerald-400">Ver 1.0</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
