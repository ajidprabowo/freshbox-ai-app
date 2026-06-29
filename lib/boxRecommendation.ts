import { BoxRecommendationInput, BoxRecommendationResult, UsageMode } from './types';
import { getFallbackRecommendation } from './recommendationFallback';

export function estimateVolumeL(category: string, weightKg: number): number {
  const cat = category.toLowerCase();
  switch (cat) {
    case 'tomatoes':
      return weightKg * 1.5;
    case 'leafy vegetables':
      return weightKg * 3.5;
    case 'seafood':
      return weightKg * 1.2;
    case 'dairy':
      return weightKg * 1.0;
    case 'meat':
      return weightKg * 1.1;
    case 'tropical fruit':
      return weightKg * 1.6;
    case 'frozen food':
      return weightKg * 1.1;
    default:
      return weightKg * 1.3;
  }
}

export function getRuleBasedRecommendation(input: BoxRecommendationInput): BoxRecommendationResult {
  const {
    productCategory,
    productName,
    totalWeightKg,
    estimatedVolumeL: userVolume,
    storageDurationDays,
    usageMode,
    pickupLocation,
    destinationLocation,
  } = input;

  const durationDays = Math.max(1, storageDurationDays);
  const volume = userVolume && userVolume > 0 ? userVolume : estimateVolumeL(productCategory, totalWeightKg);

  // Box specs
  const specs = {
    'FreshBox S': { payload: 25, volume: 70, price: 35000 },
    'FreshBox M': { payload: 60, volume: 165, price: 60000 },
    'FreshBox L': { payload: 250, volume: 750, price: 125000 },
  };

  // Decide box type
  let recommendedBoxType: 'FreshBox S' | 'FreshBox M' | 'FreshBox L' = 'FreshBox M';
  
  if (totalWeightKg <= 25 && volume <= 70) {
    recommendedBoxType = 'FreshBox S';
  } else if (totalWeightKg > 180 || volume > 500) {
    recommendedBoxType = 'FreshBox L';
  } else {
    recommendedBoxType = 'FreshBox M';
  }

  // Calculate quantity needed
  const spec = specs[recommendedBoxType];
  const qtyByWeight = Math.ceil(totalWeightKg / spec.payload);
  const qtyByVolume = Math.ceil(volume / spec.volume);
  let recommendedQuantity = Math.max(qtyByWeight, qtyByVolume);

  // Optimization: If recommending too many S, upgrade to M
  if (recommendedBoxType === 'FreshBox S' && recommendedQuantity > 3) {
    recommendedBoxType = 'FreshBox M';
    const specM = specs['FreshBox M'];
    recommendedQuantity = Math.max(Math.ceil(totalWeightKg / specM.payload), Math.ceil(volume / specM.volume));
  }
  // If recommending too many M, upgrade to L
  if (recommendedBoxType === 'FreshBox M' && recommendedQuantity > 3) {
    recommendedBoxType = 'FreshBox L';
    const specL = specs['FreshBox L'];
    recommendedQuantity = Math.max(Math.ceil(totalWeightKg / specL.payload), Math.ceil(volume / specL.volume));
  }

  // Recalculate specs for final choice
  const finalSpec = specs[recommendedBoxType];
  const payloadCap = recommendedQuantity * finalSpec.payload;
  const volumeCap = recommendedQuantity * finalSpec.volume;

  const weightUtil = (totalWeightKg / payloadCap) * 100;
  const volumeUtil = (volume / volumeCap) * 100;
  const utilRateNum = Math.round(Math.max(weightUtil, volumeUtil));
  const utilizationRate = `${utilRateNum}%`;

  const totalCost = recommendedQuantity * finalSpec.price * durationDays;
  const estimatedRentalCost = `Rp${totalCost.toLocaleString('id-ID')} for ${durationDays} day${durationDays > 1 ? 's' : ''}`;

  // Microclimate details
  const microclimate = getFallbackRecommendation(productCategory, productName);
  const microclimateSummary = `${productName} requires target cooling of ${microclimate.recommendedTemperature} and ${microclimate.recommendedHumidity} humidity.`;

  // Usage mode rec
  let usageModeRecommendation = '';
  if (usageMode === 'Storage') {
    usageModeRecommendation = 'Use Storage mode with eco-cooling parameters for stationary warehouse holding.';
  } else if (usageMode === 'Distribution') {
    usageModeRecommendation = `Use Distribution mode with active cooling. Configured route: ${pickupLocation} to ${destinationLocation}.`;
  } else {
    usageModeRecommendation = `Use Storage + Distribution mode to maintain seamless cold chain continuity during storage and transit from ${pickupLocation} to ${destinationLocation}.`;
  }

  // Alternative option
  let alternativeOption = '';
  if (recommendedBoxType === 'FreshBox S') {
    alternativeOption = '1 SupplAI Medium can be used for extra thermal capacity and physical loading buffer.';
  } else if (recommendedBoxType === 'FreshBox M') {
    const alternativeQtyL = Math.max(1, Math.ceil(totalWeightKg / specs['FreshBox L'].payload));
    alternativeOption = `${alternativeQtyL} SupplAI Large can consolidate your shipment, or SupplAI Small units can be used for split last-mile deliveries.`;
  } else {
    const alternativeQtyM = Math.ceil(totalWeightKg / specs['FreshBox M'].payload);
    alternativeOption = `${alternativeQtyM} SupplAI Medium units can be used for easier manual handling, sorting, and multi-point distribution.`;
  }

  // Reasoning
  const typeChar = recommendedBoxType.split(' ')[1];
  const modelNameLong = typeChar === 'S' ? 'SupplAI Small' : typeChar === 'M' ? 'SupplAI Medium' : 'SupplAI Large';
  const reasoningSummary = `${modelNameLong} is selected because each unit supports up to ${finalSpec.payload} kg payload and ${finalSpec.volume} L volume. For ${totalWeightKg} kg of ${productName} (estimated ${Math.round(volume)} L), renting ${recommendedQuantity} ${modelNameLong} unit(s) achieves ${utilizationRate} volumetric and physical capacity utilization, providing the most energy-efficient logistics configuration.`;

  // Special warnings
  let specialWarning = '';
  const normalizedCat = productCategory.toLowerCase();
  if (normalizedCat === 'tomatoes') {
    specialWarning = 'Warning: Tomatoes are highly sensitive to physiological cold injury below 10°C. Monitor temperature bounds carefully.';
  } else if (normalizedCat === 'leafy vegetables') {
    specialWarning = 'Warning: Highly perishable with rapid transpiration. Ensure relative humidity remains above 90% to avoid wilting.';
  } else if (normalizedCat === 'seafood') {
    specialWarning = 'Warning: Critical spoilage risk. Maintain temperature strictly between 0–2°C on packed crushed ice.';
  } else if (normalizedCat === 'meat') {
    specialWarning = 'Warning: Pathogenic threshold hazard. Keep temperature strictly below 4°C at all times.';
  } else if (normalizedCat === 'tropical fruit') {
    specialWarning = 'Warning: Tropical crops suffer pitting and decay if chilled below 10°C. Keep around 12–15°C.';
  } else if (normalizedCat === 'frozen food') {
    specialWarning = 'Warning: Requires active sub-zero freezer mode at -18°C. Active compressor must remain powered.';
  }

  return {
    recommendedBoxType,
    recommendedQuantity,
    estimatedCapacityUsed: `${totalWeightKg} kg / ${payloadCap} kg (${Math.round(volume)} L / ${volumeCap} L)`,
    utilizationRate,
    estimatedRentalCost,
    microclimateSummary,
    usageModeRecommendation,
    alternativeOption,
    reasoningSummary,
    specialWarning: specialWarning || undefined,
  };
}
