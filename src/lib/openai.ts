const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export interface ScanResult {
  type: string;
  company?: string;
  date?: string;
  amount?: string;
  category: 'maintenance' | 'renovation' | 'utility' | 'insurance' | 'other';
  confidence: number;
  rawText?: string;
}

export async function scanDocument(base64Image: string): Promise<ScanResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'low',
                },
              },
              {
                type: 'text',
                text: `Analyze this home document/invoice and extract information. 
                Respond ONLY with valid JSON, no markdown, no explanation:
                {
                  "type": "document type in Norwegian (e.g. Faktura, Kvittering, Forsikringspolise)",
                  "company": "company name if visible",
                  "date": "date in format DD.MM.YYYY if visible",
                  "amount": "amount with currency if visible (e.g. kr 4 890)",
                  "category": "one of: maintenance, renovation, utility, insurance, other",
                  "confidence": number between 0-100,
                  "rawText": "brief summary of what you see"
                }`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    // Parse JSON response
    const cleaned = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed as ScanResult;
  } catch (error) {
    console.error('Scan error:', error);
    // Return mock result for demo if API fails
    return {
      type: 'Faktura',
      company: 'Ukjent firma',
      date: new Date().toLocaleDateString('no-NO'),
      amount: '',
      category: 'maintenance',
      confidence: 60,
    };
  }
}
