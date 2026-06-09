const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export interface ScanResult {
  type: string;
  company?: string;
  date?: string;
  amount?: string;
  category: 'maintenance' | 'renovation' | 'utility' | 'insurance' | 'other';
  confidence: number;
}

export async function scanDocument(base64Image: string): Promise<ScanResult> {
  try {
    // Step 1: Extract text with Google Vision
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          }],
        }),
      }
    );

    const visionData = await visionResponse.json();
    const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text ?? '';

    if (!extractedText) {
      return { type: 'Faktura', category: 'maintenance', confidence: 40 };
    }

    // Step 2: Parse the extracted text
    const lines = extractedText.split('\n').map((l: string) => l.trim()).filter(Boolean);

    // Detect amount
    const amountMatch = extractedText.match(/(?:kr|NOK|€)\s*[\d\s,.]+/i);
    const amount = amountMatch ? amountMatch[0].trim() : '';

    // Detect date
    const dateMatch = extractedText.match(/\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}/);
    const date = dateMatch ? dateMatch[0] : '';

    // Detect company (first meaningful line)
    const company = lines.find(l => l.length > 3 && !/^\d/.test(l)) || '';

    // Detect category
    const text = extractedText.toLowerCase();
    let category: ScanResult['category'] = 'other';
    if (text.includes('strøm') || text.includes('energi') || text.includes('kraft')) category = 'utility';
    else if (text.includes('forsikring') || text.includes('polise')) category = 'insurance';
    else if (text.includes('reparasjon') || text.includes('service') || text.includes('vedlikehold')) category = 'maintenance';
    else if (text.includes('renovering') || text.includes('oppussing') || text.includes('maling')) category = 'renovation';
    else category = 'maintenance';

    const typeLabels: Record<string, string> = {
      utility: 'Strømfaktura',
      insurance: 'Forsikringspolise',
      maintenance: 'Vedlikeholdsfaktura',
      renovation: 'Renoveringsfaktura',
      other: 'Faktura',
    };

    return {
      type: typeLabels[category],
      company,
      date,
      amount,
      category,
      confidence: 85,
    };
  } catch (error) {
    console.error('Scan error:', error);
    return { type: 'Faktura', category: 'maintenance', confidence: 50 };
  }
}