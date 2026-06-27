import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { getFallbackRecommendation } from '@/lib/recommendationFallback';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productName,
      productCategory,
      quantityKg,
      estimatedShelfLifeDays,
      dateStored,
      expectedDeliveryDate,
      usageMode,
      assignedBoxId,
    } = body;

    // A check to handle client requests
    if (!productCategory) {
      return NextResponse.json({ error: 'productCategory is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

    // If Gemini API Key is missing or empty, gracefully run the fallback engine
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      console.log('Gemini API key is not configured or placeholder. Using fallback rule engine.');
      const fallback = getFallbackRecommendation(productCategory, productName || 'Product');
      return NextResponse.json(fallback);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are an expert cold chain logistics specialist and agricultural scientist.
Generate precise, optimized microclimate recommendations for storing or distributing a food product inside a modular smart FreshBox cold container.

Product Information:
- Name: ${productName || 'Unspecified'}
- Category: ${productCategory}
- Quantity: ${quantityKg} kg
- Estimated Shelf Life: ${estimatedShelfLifeDays} days
- Date Stored: ${dateStored}
- Expected Delivery Date: ${expectedDeliveryDate}
- Usage Mode: ${usageMode}
- Assigned Box ID: ${assignedBoxId}

Analyze the respiration rates, ethylene sensitivities, moisture requirements, and thermal degradation profiles for this item.
Provide practical cold-chain handling rules. Be realistic. For frozen foods, note any temperature warnings if appropriate.
Your output must conform EXACTLY to the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedTemperature: {
                type: Type.STRING,
                description: 'The optimal temperature range, e.g. 10–13°C',
              },
              recommendedHumidity: {
                type: Type.STRING,
                description: 'The optimal relative humidity range, e.g. 85–90% RH',
              },
              airflowLevel: {
                type: Type.STRING,
                description: 'The recommended circulation fan airflow level: Low, Medium, or High',
              },
              storageDurationLimit: {
                type: Type.STRING,
                description: 'The estimated safety storage limit duration under these conditions, e.g. 5–7 days',
              },
              spoilageRisk: {
                type: Type.STRING,
                description: 'The calculated spoilage risk classification: Low, Medium, or High',
              },
              handlingRecommendation: {
                type: Type.STRING,
                description: 'Detailed handling guide, thermal protection tips, ethylene sensitivities, and sanitation notes.',
              },
              energyOptimizationTip: {
                type: Type.STRING,
                description: 'How to reduce power consumption for this microclimate setting inside a logistics trailer or warehouse.',
              },
              reasoningSummary: {
                type: Type.STRING,
                description: 'A 1-2 sentence scientific explanation justifying why these specific temperature and humidity levels are selected.',
              },
            },
            required: [
              'recommendedTemperature',
              'recommendedHumidity',
              'airflowLevel',
              'storageDurationLimit',
              'spoilageRisk',
              'handlingRecommendation',
              'energyOptimizationTip',
              'reasoningSummary',
            ],
          },
        },
      });

      const text = response.text;
      if (text) {
        const result = JSON.parse(text.trim());
        return NextResponse.json(result);
      } else {
        throw new Error('Empty response from Gemini API');
      }
    } catch (apiError) {
      console.error('Gemini API call or JSON parsing failed. Switching to fallback recommendation engine:', apiError);
      const fallback = getFallbackRecommendation(productCategory, productName || 'Product');
      return NextResponse.json({
        ...fallback,
        reasoningSummary: `${fallback.reasoningSummary} (Generated via local rule engine due to API timeout or error).`,
      });
    }
  } catch (error: any) {
    console.error('General route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
