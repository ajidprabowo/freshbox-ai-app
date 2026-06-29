export const SUPPLAI_PRICING = {
  S: {
    label: "SupplAI Small",
    model: "S",
    usableVolumeLiters: 70,
    payloadKg: 25,
    pricePerDay: 35000,
    bestSuitedFor: "Small premium batches",
  },
  M: {
    label: "SupplAI Medium",
    model: "M",
    usableVolumeLiters: 165,
    payloadKg: 60,
    pricePerDay: 60000,
    bestSuitedFor: "Standard farm distribution",
  },
  L: {
    label: "SupplAI Large",
    model: "L",
    usableVolumeLiters: 750,
    payloadKg: 250,
    pricePerDay: 125000,
    bestSuitedFor: "Consolidated bulk supply",
  },
} as const;

export function getPricePerDay(model: "S" | "M" | "L") {
  return SUPPLAI_PRICING[model].pricePerDay;
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
