export type BoxType = 'S' | 'M' | 'L';
export type BoxLocation = 'warehouse' | 'truck';
export type BoxStatus = 'Available' | 'Active Rental' | 'Maintenance';
export type UsageMode = 'Storage' | 'Distribution' | 'Storage + Distribution';
export type QualityGrade = 'A' | 'B' | 'C';
export type SpoilageRisk = 'Low' | 'Medium' | 'High';

export interface FreshBox {
  id: string;
  type: BoxType;
  location: BoxLocation;
  status: BoxStatus;
  batteryLevel: number;
  currentTemp: number;
  currentHumidity: number;
  tempRange: string;
  lastSanitized: string;
  pricePerDay: number;
  assignedProductId?: string; // ID or name of product currently inside
  currentProductLoad?: string;
  activeRentalId?: string;
  operationalLocation?: 'Warehouse Storage' | 'Logistics Truck';
}

export interface Rental {
  id: string;
  userName: string;
  boxId: string;
  startDate: string;
  endDate: string;
  usageMode: UsageMode;
  pickupLocation: string;
  destinationLocation: string;
  bookingDate: string;
}

export interface ProductBatch {
  id: string; // Batch ID
  name: string;
  category: string;
  quantityKg: number;
  origin: string;
  destination: string;
  dateStored: string;
  expectedDeliveryDate: string;
  estimatedShelfLifeDays: number;
  assignedBoxId: string;
  qualityGrade: QualityGrade;
  recommendation?: Recommendation;
  productPhoto?: string; // compressed base64 or data URL
  photoAnalysis?: ProductPhotoAnalysis;
  photoUploadedAt?: string;
}

export interface ProductPhotoAnalysis {
  detectedProduct: string;
  visualQuality: "Good" | "Moderate" | "Poor" | "Unknown";
  ripenessLevel: "Unripe" | "Semi-ripe" | "Ripe" | "Overripe" | "Unknown";
  visibleRiskSigns: string[];
  estimatedSpoilageRisk: "Low" | "Medium" | "High" | "Unknown";
  handlingRecommendation: string;
  confidenceLevel: "Low" | "Medium" | "High";
  disclaimer: string;
}

export interface BoxRecommendationInput {
  productCategory: string;
  productName: string;
  totalWeightKg: number;
  estimatedVolumeL?: number;
  storageDurationDays: number;
  usageMode: UsageMode;
  pickupLocation: string;
  destinationLocation: string;
  requiredDeliveryDate: string;
  productSensitivity: 'Low' | 'Medium' | 'High';
  needBatteryBackup: boolean;
  needGpsTracking: boolean;
}

export interface BoxRecommendationResult {
  recommendedBoxType: 'FreshBox S' | 'FreshBox M' | 'FreshBox L';
  recommendedQuantity: number;
  estimatedCapacityUsed: string;
  utilizationRate: string;
  estimatedRentalCost: string;
  microclimateSummary: string;
  usageModeRecommendation: string;
  alternativeOption: string;
  reasoningSummary: string;
  specialWarning?: string;
}

export interface Recommendation {
  recommendedTemperature: string;
  recommendedHumidity: string;
  airflowLevel: string;
  storageDurationLimit: string;
  spoilageRisk: SpoilageRisk;
  handlingRecommendation: string;
  energyOptimizationTip: string;
  reasoningSummary: string;
}

export interface MonitoringData {
  boxId: string;
  productName: string;
  temperature: number;
  humidity: number;
  battery: number;
  doorStatus: 'Closed' | 'Open';
  gpsStatus: string;
  coolingStatus: 'Active' | 'Idle' | 'Standby';
  spoilageRisk: SpoilageRisk;
  remainingSafeTime: string;
  alerts: string[];
}

export interface Alert {
  id: string;
  boxId: string;
  type: 'temp_out_of_range' | 'humidity_out_of_range' | 'door_open' | 'battery_low' | 'risk_high';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
}

export interface Invoice {
  boxId: string;
  boxType: BoxType;
  durationDays: number;
  quantity: number;
  usageMode: UsageMode;
  energyUsageKwh: number;
  pickupDeliveryService: boolean;
  cleaningService: boolean;
  lateReturnDays: number;
  breakdown: {
    boxRentalCost: number;
    energyCost: number;
    pickupCost: number;
    cleaningCost: number;
    lateFeeCost: number;
    totalCost: number;
  };
}

export interface RentalSuggestion {
  id: string;
  createdAt: string;
  productCategory: string;
  productName: string;
  totalWeightKg: number;
  usageMode: "Storage" | "Distribution" | "Storage + Distribution";
  pickupLocation: string;
  destinationLocation: string;
  rentalDurationDays: number;
  recommendedBoxType: "FreshBox S" | "FreshBox M" | "FreshBox L";
  recommendedQuantity: number;
  estimatedRentalCost: number;
  costBreakdown: {
    boxRentalCost: number;
    energyCost: number;
    pickupDeliveryCost: number;
    cleaningFee: number;
    lateFee: number;
    totalCost: number;
  };
  microclimateSummary: string;
  reasoningSummary: string;
  alternativeOption?: string;
  warning?: string;
}

