'use client';

import React, { useState, useEffect } from 'react';
import { ProductBatch, FreshBox, QualityGrade, UsageMode, ProductPhotoAnalysis } from '@/lib/types';
import { Leaf, Box, Sparkles, MapPin, CalendarDays, BarChart4, Info, CheckCircle2 } from 'lucide-react';

interface ProductFormProps {
  availableBoxes: FreshBox[];
  onSubmit: (batchData: Omit<ProductBatch, 'recommendation'>, usageMode: UsageMode) => Promise<void>;
  isSubmitting: boolean;
  onRentBoxClick?: (productBatchId: string) => void;
}

export default function ProductForm({ availableBoxes, onSubmit, isSubmitting, onRentBoxClick }: ProductFormProps) {
  // Local state form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tomatoes');
  const [batchId, setBatchId] = useState(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `BAT-${randomNum}`;
  });
  const [quantityKg, setQuantityKg] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [dateStored, setDateStored] = useState('2026-06-24');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const deliveryDate = new Date('2026-06-24');
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toISOString().split('T')[0];
  });
  const [estimatedShelfLifeDays, setEstimatedShelfLifeDays] = useState('');
  const [assignedBoxId, setAssignedBoxId] = useState('');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('A');
  const [usageMode, setUsageMode] = useState<UsageMode>('Storage');

  // Photo upload and analysis states
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<ProductPhotoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successBatchId, setSuccessBatchId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      setUploadError("Image too large. Maximum size is 3 MB.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPhotoBase64(compressed);
      setPhotoAnalysis(null); // reset analysis on new image upload
    } catch (err) {
      console.error(err);
      setUploadError("Failed to compress or read image file.");
    }
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    setPhotoAnalysis(null);
    setUploadError(null);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 600; // max width or height
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality jpeg
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAnalyzePhoto = async () => {
    if (!photoBase64) return;
    setIsAnalyzing(true);
    setUploadError(null);
    try {
      const response = await fetch('/api/analyze-product-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: photoBase64,
          category,
          productName: name,
        }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setPhotoAnalysis(data.result);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Analysis failed. Staged photo is saved for documentation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update default assignedBoxId when availableBoxes changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (availableBoxes.length > 0 && !assignedBoxId) {
      // Prefer boxes that are Available
      const firstAvail = availableBoxes.find(b => b.status === 'Available');
      if (firstAvail) {
        setAssignedBoxId(firstAvail.id);
      } else {
        setAssignedBoxId(availableBoxes[0].id);
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [availableBoxes, assignedBoxId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !quantityKg || !origin || !destination || !dateStored || !expectedDeliveryDate || !estimatedShelfLifeDays || !assignedBoxId) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload: Omit<ProductBatch, 'recommendation'> = {
      id: batchId,
      name,
      category,
      quantityKg: parseFloat(quantityKg),
      origin,
      destination,
      dateStored,
      expectedDeliveryDate,
      estimatedShelfLifeDays: parseInt(estimatedShelfLifeDays),
      assignedBoxId,
      qualityGrade,
      productPhoto: photoBase64 || undefined,
      photoAnalysis: photoAnalysis || undefined,
      photoUploadedAt: photoBase64 ? new Date().toISOString() : undefined,
    };

    try {
      await onSubmit(payload, usageMode);
      setSuccessBatchId(batchId);
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    'Tomatoes',
    'Leafy Vegetables',
    'Seafood',
    'Dairy',
    'Meat',
    'Tropical Fruit',
    'Frozen Food',
    'Other',
  ];

  if (successBatchId) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 md:p-8 text-center space-y-6 animate-scale-up">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white">
          <CheckCircle2 size={24} className="stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-emerald-900">Product registered successfully!</h3>
          <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
            Product registered successfully. You can now rent a SupplAI box and select this product during booking.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setSuccessBatchId(null);
              setName('');
              setQuantityKg('');
              setOrigin('');
              setDestination('');
              setEstimatedShelfLifeDays('');
              setPhotoBase64(null);
              setPhotoAnalysis(null);
              setBatchId(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
            }}
            className="px-5 py-2.5 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Register Another Crop
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('pendingProductForRental', successBatchId);
              if (onRentBoxClick) {
                onRentBoxClick(successBatchId);
              }
            }}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all uppercase cursor-pointer"
          >
            Rent a Box for This Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Card Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
          <Leaf className="text-emerald-500" size={20} />
          <h2 className="font-sans font-bold text-slate-800 text-base">New Batch Specification</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Product Name *</label>
            <input
              type="text"
              placeholder="e.g. Cherry Tomatoes Premium, Salmon Fillet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              required
            />
          </div>

          {/* Product Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Crop / Food Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Batch ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Batch ID *</label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-sm font-bold"
              required
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quantity (Kg) *</label>
            <input
              type="number"
              placeholder="e.g. 150"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              min="1"
              required
            />
          </div>

          {/* Logistics Origin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" /> Origin Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Lembang Farms, Bandung"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              required
            />
          </div>

          {/* Logistics Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" /> Destination Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Jakarta Supermarket Hub"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              required
            />
          </div>

          {/* Date Stored */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <CalendarDays size={12} className="text-slate-400" /> Date Stored *
            </label>
            <input
              type="date"
              value={dateStored}
              onChange={(e) => setDateStored(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              required
            />
          </div>

          {/* Expected Delivery Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <CalendarDays size={12} className="text-slate-400" /> Expected Delivery *
            </label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              required
            />
          </div>

          {/* Estimated Shelf Life */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Est. Shelf Life (Days) *
            </label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={estimatedShelfLifeDays}
              onChange={(e) => setEstimatedShelfLifeDays(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              min="1"
              required
            />
          </div>

          {/* Assigned FreshBox ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Box size={12} className="text-slate-400" /> Assigned SupplAI Container *
            </label>
            <select
              value={assignedBoxId}
              onChange={(e) => setAssignedBoxId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
              required
            >
              <option value="" disabled>Select a container</option>
              {availableBoxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.id} - Type {box.type} ({box.status} - {box.location})
                </option>
              ))}
            </select>
            {availableBoxes.length === 0 && (
              <p className="text-[10px] text-amber-600 font-medium">
                No boxes available. Please register or clear rentals first.
              </p>
            )}
          </div>

          {/* Quality Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <BarChart4 size={12} className="text-slate-400" /> Harvest Quality Grade *
            </label>
            <div className="flex gap-4">
              {(['A', 'B', 'C'] as QualityGrade[]).map((grade) => (
                <label
                  key={grade}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                    qualityGrade === grade
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="qualityGrade"
                    value={grade}
                    checked={qualityGrade === grade}
                    onChange={() => setQualityGrade(grade)}
                    className="sr-only"
                  />
                  Grade {grade}
                </label>
              ))}
            </div>
          </div>

          {/* Usage Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Logistics Mode *</label>
            <select
              value={usageMode}
              onChange={(e) => setUsageMode(e.target.value as UsageMode)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
            >
              <option value="Storage">Storage Only (Warehouse)</option>
              <option value="Distribution">Distribution Only (Logistics Truck)</option>
              <option value="Storage + Distribution">Storage & Distribution Mixed</option>
            </select>
          </div>
        </div>

        {/* Product Photo Upload & AI Analysis */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Product Photo Upload & AI Vision</label>
            <p className="text-xs text-slate-400">
              Upload a product photo to document initial quality. Advanced AI analysis can estimate visible freshness and spoilage risk. (Max 3MB, JPG/PNG/WebP)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo Upload Box */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="product-photo-upload"
                  accept="image/png, image/jpeg, image/webp"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {photoBase64 ? (
                  <div className="relative w-full h-48 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 group">
                    <img
                      src={photoBase64}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label
                        htmlFor="product-photo-upload"
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="product-photo-upload"
                    className="w-full h-48 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-slate-50/50 transition-all gap-2"
                  >
                    <div className="bg-slate-100 text-slate-500 w-10 h-10 rounded-full flex items-center justify-center">
                      <Leaf size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Upload Product Photo</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Click to browse or take camera shot</span>
                    </div>
                  </label>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {uploadError}
                </p>
              )}
            </div>

            {/* AI Vision Analysis Cards */}
            <div className="space-y-4">
              {photoBase64 ? (
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">AI Quality Diagnostics</h4>
                      {photoAnalysis ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          ANALYSIS COMPLETE
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                          AWAITING DIAGNOSIS
                        </span>
                      )}
                    </div>

                    {photoAnalysis ? (
                      <div className="space-y-3 text-xs">
                        {/* Badges Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[8px] text-slate-400 block uppercase font-mono">Detected crop</span>
                            <span className="font-bold text-slate-800">{photoAnalysis.detectedProduct}</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[8px] text-slate-400 block uppercase font-mono">Visual Quality</span>
                            <span className={`font-bold ${
                              photoAnalysis.visualQuality === 'Good' ? 'text-emerald-600' :
                              photoAnalysis.visualQuality === 'Moderate' ? 'text-amber-600' : 'text-rose-600'
                            }`}>{photoAnalysis.visualQuality}</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[8px] text-slate-400 block uppercase font-mono">Ripeness Level</span>
                            <span className="font-bold text-slate-800">{photoAnalysis.ripenessLevel}</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[8px] text-slate-400 block uppercase font-mono">Spoilage Risk</span>
                            <span className={`font-bold ${
                              photoAnalysis.estimatedSpoilageRisk === 'Low' ? 'text-emerald-600' :
                              photoAnalysis.estimatedSpoilageRisk === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                            }`}>{photoAnalysis.estimatedSpoilageRisk}</span>
                          </div>
                        </div>

                        {photoAnalysis.visibleRiskSigns.length > 0 && (
                          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[8px] text-slate-400 block uppercase font-mono">Detected Risk Signs</span>
                            <div className="flex flex-wrap gap-1">
                              {photoAnalysis.visibleRiskSigns.map((sign, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium capitalize">
                                  {sign}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[8px] text-slate-400 block uppercase font-mono">AI Handling Tip</span>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{photoAnalysis.handlingRecommendation}</p>
                        </div>

                        <p className="text-[9px] text-slate-400 italic font-mono leading-tight">
                          Disclaimer: {photoAnalysis.disclaimer}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 leading-relaxed py-4">
                        Photo successfully compressed and staged. Click &ldquo;Analyze Product Photo&rdquo; below to inspect freshness, ripeness, and potential mechanical bruising via SupplAI API.
                      </p>
                    )}
                  </div>

                  {!photoAnalysis && (
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={handleAnalyzePhoto}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold rounded-xl text-xs transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer h-9"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Inspecting Image...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} className="fill-slate-950" />
                          <span>Analyze Product Photo with AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="border border-slate-200 border-dashed rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center text-slate-400 space-y-2">
                  <Info size={28} className="text-slate-300 stroke-[1.2]" />
                  <p className="text-xs max-w-xs leading-relaxed">
                    Staging a harvest photo enables visual quality checkpoints. It identifies surface decay, maturity, and skin integrity automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Submission Button with Sparks! */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || availableBoxes.length === 0}
          className={`flex items-center gap-2 px-6 py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150 text-sm ${
            isSubmitting || availableBoxes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              <span>Analyzing with SupplAI...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="fill-slate-950" />
              <span>Get AI recommendation & Register</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
