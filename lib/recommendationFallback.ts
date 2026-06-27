import { Recommendation, SpoilageRisk } from './types';

export function getFallbackRecommendation(category: string, productName: string): Recommendation {
  const normalizedCategory = category.toLowerCase();

  switch (normalizedCategory) {
    case 'tomatoes':
      return {
        recommendedTemperature: '10–13°C',
        recommendedHumidity: '85–90% RH',
        airflowLevel: 'Medium',
        storageDurationLimit: '10–14 days',
        spoilageRisk: 'Low',
        handlingRecommendation: `Store ${productName} within the 10–13°C sweet spot. Avoid excessive chilling as temperatures below 10°C will trigger chilling injuries and cause flavor loss. Keep in ventilated boxes.`,
        energyOptimizationTip: 'Use smart ambient cooling ventilation during cold nights, reducing compressor workload.',
        reasoningSummary: 'Tomatoes are sensitive to physiological injuries if chilled too low, yet rot quickly above 15°C. Moderate high humidity preserves skin tension.',
      };

    case 'leafy vegetables':
      return {
        recommendedTemperature: '0–5°C',
        recommendedHumidity: '90–95% RH',
        airflowLevel: 'High',
        storageDurationLimit: '5–7 days',
        spoilageRisk: 'Medium',
        handlingRecommendation: `Store ${productName} near-frozen. High humidity is critical to prevent water loss and wilting. Pre-chill the FreshBox unit before loading to avoid condensation droplets.`,
        energyOptimizationTip: 'Run continuous circulation fans at 40% speed rather than intermittent bursts to ensure even moisture distribution.',
        reasoningSummary: 'Leafy greens possess a high surface-area-to-volume ratio and respiratory rate, demanding near-freezing status and ultra-high humidity.',
      };

    case 'seafood':
      return {
        recommendedTemperature: '0–2°C',
        recommendedHumidity: '75–90% RH',
        airflowLevel: 'High',
        storageDurationLimit: '3–5 days',
        spoilageRisk: 'High',
        handlingRecommendation: `Store ${productName} on crushed ice if possible within the container. Keep temperature strictly at 0–2°C to prevent rapid bacterial spoilage. High cooling priority.`,
        energyOptimizationTip: 'Set active cooling mode to max-efficiency pre-cooling when plugged into warehouse grids prior to truck delivery.',
        reasoningSummary: 'Marine proteins decompose exceptionally fast under mild cold. Tight temperature regulation close to freezing is vital.',
      };

    case 'dairy':
      return {
        recommendedTemperature: '0–5°C',
        recommendedHumidity: '70–85% RH',
        airflowLevel: 'Medium',
        storageDurationLimit: '7–12 days',
        spoilageRisk: 'Low',
        handlingRecommendation: `Maintain stable refrigeration. Avoid rapid temperature cycling which causes separation and premature lactic acidification in ${productName}.`,
        energyOptimizationTip: 'Optimize thermal mass by loading full capacities; larger volume holds cold temperature more stably with fewer cycles.',
        reasoningSummary: 'Dairy pasteurization shields products from quick spoilage, but steady temperatures prevent physical separation and fat destabilization.',
      };

    case 'meat':
      return {
        recommendedTemperature: '0–4°C',
        recommendedHumidity: '75–85% RH',
        airflowLevel: 'Medium',
        storageDurationLimit: '4–6 days',
        spoilageRisk: 'High',
        handlingRecommendation: `Strict temperature control is required. Pathogen risk increases exponentially above 4°C. Ensure sanitization records for the box are current.`,
        energyOptimizationTip: 'Utilize high insulation padding inside FreshBox M/L models to reduce energy leakage.',
        reasoningSummary: 'Fresh meat tissue allows bacterial replication at mild levels. Sub-4°C limits pathogenic growth while remaining above the freezing point.',
      };

    case 'tropical fruit':
      return {
        recommendedTemperature: '10–15°C',
        recommendedHumidity: '80–90% RH',
        airflowLevel: 'Medium',
        storageDurationLimit: '7–10 days',
        spoilageRisk: 'Medium',
        handlingRecommendation: `Keep ${productName} moderately cool. Do not drop below 10°C to avoid irreversible chilling injury, pitting, and skin blackening.`,
        energyOptimizationTip: 'Compressor operates in low-draw mode since target temperature is close to ambient conditions.',
        reasoningSummary: 'Tropical crops are evolutionary non-adapted to cold, suffering enzyme disruption and structural collapse at low temperatures.',
      };

    case 'frozen food':
      return {
        recommendedTemperature: '-18°C',
        recommendedHumidity: '60–75% RH',
        airflowLevel: 'Low',
        storageDurationLimit: '30–60 days',
        spoilageRisk: 'Low',
        handlingRecommendation: `Note: The FreshBox MVP is optimized for chilled modes, but supports frozen mode under strict monitor. Keep door sealed. Door openings should be less than 30 seconds.`,
        energyOptimizationTip: 'Pre-chill container to -20°C in warehouse with industrial power before shifting to truck logistics battery.',
        reasoningSummary: 'At -18°C, biological activities are completely halted. Energy retention is the paramount challenge for the portable box.',
      };

    default:
      return {
        recommendedTemperature: '4–8°C',
        recommendedHumidity: '80–90% RH',
        airflowLevel: 'Medium',
        storageDurationLimit: '7–10 days',
        spoilageRisk: 'Medium',
        handlingRecommendation: `Unclassified crop ${productName}. Recommended standard chilled preservation. Monitor closely for signs of chilling injury or moisture build-up.`,
        energyOptimizationTip: 'Run standard preset dynamic eco-cooling algorithm.',
        reasoningSummary: 'A safe, conservative default range designed to prevent decay while preventing sub-freezing crystal damage.',
      };
  }
}
