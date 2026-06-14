const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export interface ScanResult {
  docType: 'invoice' | 'device' | 'document';
  // Invoice fields
  type?: string;
  company?: string;
  date?: string;
  amount?: string;
  category?: 'maintenance' | 'renovation' | 'utility' | 'insurance' | 'other';
  // Device fields
  deviceName?: string;
  brand?: string;
  model?: string;
  installedYear?: string;
  warrantyYears?: number;
  // Document fields
  docName?: string;
  docCategory?: string;
  confidence: number;
}

const DEVICE_KEYWORDS = ['serienummer', 'serial', 'modell', 'model nr', 'garanti', 'manual', 'bruksanvisning', 'art.nr', 'eaN'];
const DOCUMENT_KEYWORDS = ['skjøte', 'forsikringsbevis', 'energimerking', 'energisertifikat', 'brukstillatelse', 'tinglyst', 'polise'];
const INVOICE_KEYWORDS = ['faktura', 'kvittering', 'beløp', 'å betale', 'fakturanr', 'ordrenr', 'totalt'];

export async function scanDocument(base64Image: string): Promise<ScanResult> {
  try {
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
    const extractedText: string = visionData.responses?.[0]?.fullTextAnnotation?.text ?? '';

    if (!extractedText) {
      return { docType: 'invoice', type: 'Faktura', category: 'maintenance', confidence: 40 };
    }

    const lines = extractedText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const text = extractedText.toLowerCase();

    // Score each doc type by keyword matches
    let deviceScore = DEVICE_KEYWORDS.filter(k => text.includes(k)).length;
    let documentScore = DOCUMENT_KEYWORDS.filter(k => text.includes(k)).length;
    let invoiceScore = INVOICE_KEYWORDS.filter(k => text.includes(k)).length;

    // Amount/currency presence strongly suggests invoice
    const amountMatch = extractedText.match(/(?:kr|NOK|€)\s*[\d\s,.]+/i);
    if (amountMatch) invoiceScore += 2;

    // Date detection (used by all types)
    const dateMatch = extractedText.match(/\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}/);
    const date = dateMatch ? dateMatch[0] : '';

    // Decide doc type
    let docType: ScanResult['docType'] = 'invoice';
    if (deviceScore > invoiceScore && deviceScore > documentScore) docType = 'device';
    else if (documentScore > invoiceScore && documentScore >= deviceScore) docType = 'document';
    else docType = 'invoice';

    if (docType === 'device') {
      // Try to find brand (common appliance brands)
      const brands = ['bosch', 'siemens', 'electrolux', 'samsung', 'lg', 'whirlpool', 'miele', 'aeg', 'vaillant', 'daikin', 'mitsubishi', 'panasonic', 'ifö', 'geberit'];
      const foundBrand = brands.find(b => text.includes(b));
      const brand = foundBrand ? foundBrand[0].toUpperCase() + foundBrand.slice(1) : '';

      // Model number — look for alphanumeric patterns near "modell" or "model"
      const modelMatch = extractedText.match(/(?:modell|model)[\s:]*([A-Za-z0-9\-]+)/i);
      const model = modelMatch ? modelMatch[1] : '';

      // Device name guess from first meaningful line or brand context
      const deviceName = lines.find(l => l.length > 3 && !/^\d/.test(l) && !l.toLowerCase().includes('serienummer')) || 'Ny enhet';

      const currentYear = new Date().getFullYear();
      return {
        docType: 'device',
        deviceName: deviceName.slice(0, 40),
        brand,
        model,
        installedYear: currentYear.toString(),
        warrantyYears: 2,
        confidence: 75,
      };
    }

    if (docType === 'document') {
      let docCategory = 'Annet';
      if (text.includes('skjøte') || text.includes('tinglyst')) docCategory = 'Skjøte';
      else if (text.includes('forsikring') || text.includes('polise')) docCategory = 'Forsikring';
      else if (text.includes('energimerking') || text.includes('energisertifikat')) docCategory = 'Energisertifikat';
      else if (text.includes('brukstillatelse')) docCategory = 'Brukstillatelse';
      else if (text.includes('byggetillatelse')) docCategory = 'Byggetillatelse';

      const docName = lines.find(l => l.length > 3 && !/^\d/.test(l)) || docCategory;

      return {
        docType: 'document',
        docName: docName.slice(0, 50),
        docCategory,
        date,
        confidence: 80,
      };
    }

    // Invoice
    const amount = amountMatch ? amountMatch[0].trim() : '';
    const company = lines.find(l => l.length > 3 && !/^\d/.test(l)) || '';

    let category: ScanResult['category'] = 'maintenance';
    if (text.includes('strøm') || text.includes('energi') || text.includes('kraft')) category = 'utility';
    else if (text.includes('forsikring') || text.includes('polise')) category = 'insurance';
    else if (text.includes('reparasjon') || text.includes('service') || text.includes('vedlikehold')) category = 'maintenance';
    else if (text.includes('renovering') || text.includes('oppussing') || text.includes('maling')) category = 'renovation';

    const typeLabels: Record<string, string> = {
      utility: 'Strømfaktura',
      insurance: 'Forsikringspolise',
      maintenance: 'Vedlikeholdsfaktura',
      renovation: 'Renoveringsfaktura',
      other: 'Faktura',
    };

    return {
      docType: 'invoice',
      type: typeLabels[category],
      company,
      date,
      amount,
      category,
      confidence: 85,
    };
  } catch (error) {
    console.error('Scan error:', error);
    return { docType: 'invoice', type: 'Faktura', category: 'maintenance', confidence: 50 };
  }
}