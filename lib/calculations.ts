import { BoxType, UsageMode, ProductBatch, Invoice } from './types';
import { getPricePerDay } from './pricing';

export function calculateRentalCost(params: {
  boxType: BoxType;
  numberOfBoxes: number;
  durationDays: number;
  usageMode: UsageMode;
  estimatedEnergyKwh: number;
  pickupDelivery: boolean;
  cleaning: boolean;
  lateReturnDays: number;
}): Invoice['breakdown'] {
  const {
    boxType,
    numberOfBoxes,
    durationDays,
    estimatedEnergyKwh,
    pickupDelivery,
    cleaning,
    lateReturnDays,
  } = params;

  // Box base price
  const basePricePerDay = getPricePerDay(boxType);

  const boxRentalCost = basePricePerDay * numberOfBoxes * durationDays;

  // Energy cost
  const energyCost = estimatedEnergyKwh * 1500;

  // Pickup delivery fee
  const pickupCost = pickupDelivery ? 50000 * numberOfBoxes : 0;

  // Cleaning fee
  const cleaningCost = cleaning ? 25000 * numberOfBoxes : 0;

  // Late fee
  const lateFeeCost = lateReturnDays * (basePricePerDay * 0.3) * numberOfBoxes;

  const totalCost = boxRentalCost + energyCost + pickupCost + cleaningCost + lateFeeCost;

  return {
    boxRentalCost,
    energyCost,
    pickupCost,
    cleaningCost,
    lateFeeCost,
    totalCost,
  };
}

export function calculateBatchImpact(batch: ProductBatch) {
  const risk = batch.recommendation?.spoilageRisk || 'Medium';
  let percentageAvoided = 0.03; // Default Medium
  if (risk === 'Low') percentageAvoided = 0.05;
  if (risk === 'High') percentageAvoided = 0.01;

  const foodLossAvoidedKg = batch.quantityKg * percentageAvoided;
  const co2eAvoidedKg = foodLossAvoidedKg * 2.5;
  const costLossAvoidedRp = foodLossAvoidedKg * 20000;

  // Calculate energy saved: conventional room cooling consumes ~18 kWh/day for this volume, FreshBox uses ~2.5 kWh/day
  // Let's assume duration is shelf life or expected delivery duration
  const start = new Date(batch.dateStored);
  const end = new Date(batch.expectedDeliveryDate);
  const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const conventionalDaily = 15; // kWh
  const freshboxDaily = 2.2; // kWh
  const energySavedKwh = (conventionalDaily - freshboxDaily) * durationDays;

  return {
    foodProtectedKg: batch.quantityKg,
    foodLossAvoidedKg,
    co2eAvoidedKg,
    costLossAvoidedRp,
    energySavedKwh,
  };
}

export function calculateCumulativeImpact(batches: ProductBatch[]) {
  return batches.reduce(
    (acc, batch) => {
      const impact = calculateBatchImpact(batch);
      return {
        foodProtectedKg: acc.foodProtectedKg + impact.foodProtectedKg,
        foodLossAvoidedKg: acc.foodLossAvoidedKg + impact.foodLossAvoidedKg,
        co2eAvoidedKg: acc.co2eAvoidedKg + impact.co2eAvoidedKg,
        costLossAvoidedRp: acc.costLossAvoidedRp + impact.costLossAvoidedRp,
        energySavedKwh: acc.energySavedKwh + impact.energySavedKwh,
      };
    },
    {
      foodProtectedKg: 0,
      foodLossAvoidedKg: 0,
      co2eAvoidedKg: 0,
      costLossAvoidedRp: 0,
      energySavedKwh: 0,
    }
  );
}
