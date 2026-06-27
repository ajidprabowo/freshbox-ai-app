import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, category, productName } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No product photo provided" }, { status: 400 });
    }

    // Default fallback response if Gemini is not configured
    const getFallbackAnalysis = () => ({
      detectedProduct: productName || category || "Detected Product",
      visualQuality: "Unknown",
      ripenessLevel: "Unknown",
      visibleRiskSigns: ["analysis unavailable"],
      estimatedSpoilageRisk: "Unknown",
      handlingRecommendation: "AI photo analysis is unavailable. Product photo has been saved for documentation.",
      confidenceLevel: "Low",
      disclaimer: "AI photo analysis is an estimate and should be validated by human inspection."
    });

    if (!process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY is not defined. Returning offline fallback for photo analysis.");
      return NextResponse.json({ result: getFallbackAnalysis(), method: "fallback-offline" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";

    // Standardize Base64 and MimeType
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.includes(";base64,")) {
      const parts = image.split(";base64,");
      const mimePart = parts[0]; // e.g. "data:image/png"
      mimeType = mimePart.replace("data:", "");
      base64Data = parts[1];
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptString = `You are an expert agricultural and cold chain food safety inspector powered by FreshBox AI.
Analyze the provided product photo.
The user declared:
- Declared Product Name: ${productName || "Unknown"}
- Declared Category: ${category || "Unknown"}

Evaluate the visual quality, ripeness, physical risk signs, and estimated spoilage risk based on the visual state of the product.
Recommend suitable handling or storage steps based on what is visible.

Ensure to output strict JSON matching the requested schema. Never state absolute certainty. Always include the disclaimer emphasizing human inspection.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [imagePart, { text: promptString }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedProduct: {
              type: Type.STRING,
              description: "The name of the detected crop or item, e.g. 'Tomatoes' or 'Spinach'",
            },
            visualQuality: {
              type: Type.STRING,
              description: "Must be one of: 'Good', 'Moderate', 'Poor', 'Unknown'",
            },
            ripenessLevel: {
              type: Type.STRING,
              description: "Must be one of: 'Unripe', 'Semi-ripe', 'Ripe', 'Overripe', 'Unknown'",
            },
            visibleRiskSigns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "E.g. ['bruising', 'mold', 'wilting', 'discoloration']",
            },
            estimatedSpoilageRisk: {
              type: Type.STRING,
              description: "Must be one of: 'Low', 'Medium', 'High', 'Unknown'",
            },
            handlingRecommendation: {
              type: Type.STRING,
              description: "Actionable storage or shipping tip based on the product state",
            },
            confidenceLevel: {
              type: Type.STRING,
              description: "Must be one of: 'Low', 'Medium', 'High'",
            },
            disclaimer: {
              type: Type.STRING,
              description: "Always remind the user that AI analysis is an estimation only and must be validated by food inspectors.",
            },
          },
          required: [
            "detectedProduct",
            "visualQuality",
            "ripenessLevel",
            "visibleRiskSigns",
            "estimatedSpoilageRisk",
            "handlingRecommendation",
            "confidenceLevel",
            "disclaimer",
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
    console.error("Error in analyze-product-photo route:", error);
    // Graceful fallback to avoid breaking registration flow
    const fallbackResponse = {
      detectedProduct: "Product Item",
      visualQuality: "Unknown",
      ripenessLevel: "Unknown",
      visibleRiskSigns: ["failed to connect to AI server"],
      estimatedSpoilageRisk: "Unknown",
      handlingRecommendation: "AI photo analysis is unavailable. Product photo has been saved for documentation.",
      confidenceLevel: "Low",
      disclaimer: "AI photo analysis is unavailable. Product photo has been saved for documentation."
    };
    return NextResponse.json({ result: fallbackResponse, method: "fallback-error" });
  }
}
