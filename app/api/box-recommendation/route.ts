import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getRuleBasedRecommendation } from "../../../lib/boxRecommendation";
import { BoxRecommendationInput } from "../../../lib/types";

export async function POST(req: NextRequest) {
  let input: BoxRecommendationInput;
  try {
    input = await req.json();
  } catch (parseError) {
    console.error("Failed to parse request JSON in box-recommendation:", parseError);
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  // Verify if API Key is present. If not, use local rule-based fallback immediately.
  if (!process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY not found. Using rule-based box recommendation fallback.");
    const fallbackResult = getRuleBasedRecommendation(input);
    return NextResponse.json({ result: fallbackResult, method: "rule-based" });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";

    const prompt = `You are an expert cold chain logistics assistant for "SupplAI".
Recommend the best configuration (represented as 'FreshBox S', 'FreshBox M', or 'FreshBox L') based on the following client request details:

Product Category: ${input.productCategory}
Product Name: ${input.productName}
Total Weight: ${input.totalWeightKg} kg
Estimated Volume: ${input.estimatedVolumeL || "Not provided (please estimate)"} liters
Storage/Rental Duration: ${input.storageDurationDays} days
Usage Mode: ${input.usageMode}
Pickup Location: ${input.pickupLocation}
Destination Location: ${input.destinationLocation}
Required Delivery Date: ${input.requiredDeliveryDate}
Product Sensitivity: ${input.productSensitivity}
Battery Backup Needed: ${input.needBatteryBackup ? "Yes" : "No"}
GPS Tracking Needed: ${input.needGpsTracking ? "Yes" : "No"}

Box Specs Reference:
- FreshBox S (SupplAI Small): payload cap = 25 kg, volume cap = 70 L, rental rate = Rp35,000/day. Best for small batch, sample products, or last-mile.
- FreshBox M (SupplAI Medium): payload cap = 60 kg, volume cap = 165 L, rental rate = Rp60,000/day. Best for standard storage and distribution.
- FreshBox L (SupplAI Large): payload cap = 250 kg, volume cap = 750 L, rental rate = Rp125,000/day. Best for warehouse and large batch.

Requirements:
1. Select the most efficient and cost-effective box size (S, M, or L) and calculate the necessary quantity to hold the total payload weight and volume safely.
2. Determine capacity utilization percentage (utilizationRate) which is the higher percentage of weight vs. payload capacity, or volume vs. volume capacity.
3. Compute total estimated rental cost based on rental price per day, quantity, and duration (Rp[total] for [X] days).
4. Outline the recommended microclimate settings (temperature, relative humidity) based on cold chain science.
5. Detail a custom reasoning summary using SupplAI Small/Medium/Large naming and provide alternate options (e.g. if they could use fewer of a larger box, or split into smaller boxes for distribution modularity).
6. Return a warning (specialWarning) if the product is highly perishable (like seafood/meat) or sensitive to chilling injuries (like tomatoes/tropical fruit under 10°C).`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedBoxType: {
              type: Type.STRING,
              description: "Must be exactly 'FreshBox S', 'FreshBox M', or 'FreshBox L'",
            },
            recommendedQuantity: {
              type: Type.INTEGER,
              description: "Total count of recommended boxes",
            },
            estimatedCapacityUsed: {
              type: Type.STRING,
              description: "Format: 'X kg / Y kg (A L / B L)' showing weight capacity and volume capacity",
            },
            utilizationRate: {
              type: Type.STRING,
              description: "E.g., '85%' or '100%'",
            },
            estimatedRentalCost: {
              type: Type.STRING,
              description: "E.g., 'Rp720,000 for 2 days'",
            },
            microclimateSummary: {
              type: Type.STRING,
              description: "Specific temperature & humidity recommendations for this product",
            },
            usageModeRecommendation: {
              type: Type.STRING,
              description: "Explanation on how to use the selected mode (Storage/Distribution)",
            },
            alternativeOption: {
              type: Type.STRING,
              description: "Alternative configuration suggestion (e.g. consolidation or multi-point modularity)",
            },
            reasoningSummary: {
              type: Type.STRING,
              description: "Strategic cold chain and logistics rationale for this exact choice",
            },
            specialWarning: {
              type: Type.STRING,
              description: "Optional. Critical warning for chilling injuries, spoilage, high sensitivity, etc.",
            },
          },
          required: [
            "recommendedBoxType",
            "recommendedQuantity",
            "estimatedCapacityUsed",
            "utilizationRate",
            "estimatedRentalCost",
            "microclimateSummary",
            "usageModeRecommendation",
            "alternativeOption",
            "reasoningSummary"
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const result = JSON.parse(text.trim());
    return NextResponse.json({ result, method: "ai" });

  } catch (error) {
    console.error("Error in box-recommendation API route:", error);
    // Fall back to rule-based recommendation on error
    try {
      const fallbackResult = getRuleBasedRecommendation(input);
      return NextResponse.json({ result: fallbackResult, method: "rule-based-fallback" });
    } catch (fallbackError) {
      return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
    }
  }
}
