const DUTCH_MONTHS: Record<string, string> = {
  januari: '01', februari: '02', maart: '03', april: '04',
  mei: '05', juni: '06', juli: '07', augustus: '08',
  september: '09', oktober: '10', november: '11', december: '12',
};

export function extractSalary(text: string): { min?: number; max?: number; scale?: string; raw: string } {
  const raw = text;

  // Match salary scale: "schaal 9" or "schaal 9-10"
  const scaleMatch = text.match(/schaal\s+(\d+(?:\s*[-–]\s*\d+)?)/i);
  const scale = scaleMatch ? scaleMatch[1].replace(/\s/g, '') : undefined;

  // Match euro amounts: "€ 3.524" or "€3524" or "€ 3.524,-"
  const euroPattern = /€\s*([\d.]+)(?:,-)?/g;
  const amounts: number[] = [];
  let match;
  while ((match = euroPattern.exec(text)) !== null) {
    const num = parseFloat(match[1].replace(/\./g, ''));
    if (num > 100) amounts.push(num); // filter out tiny numbers
  }

  const min = amounts.length >= 2 ? Math.min(...amounts) : amounts[0];
  const max = amounts.length >= 2 ? Math.max(...amounts) : undefined;

  return { min, max, scale, raw };
}

export function extractHours(text: string): number | undefined {
  // "36 uur" or "32-36 uur" or "36-urige werkweek"
  const match = text.match(/(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*(?:uur|urige)/i);
  if (match) {
    return match[2] ? parseInt(match[2]) : parseInt(match[1]);
  }
  return undefined;
}

export function extractEducationLevel(text: string): string | undefined {
  const upper = text.toUpperCase();
  const levels: string[] = [];

  if (/\bWO\b/.test(upper)) levels.push('WO');
  if (/\bHBO\b/.test(upper)) levels.push('HBO');
  if (/\bMBO\b/.test(upper)) levels.push('MBO');

  if (levels.length > 0) return levels.join('/');
  return undefined;
}

export function extractEmploymentType(text: string): string | undefined {
  const lower = text.toLowerCase();

  if (/\bstage\b|\bstageplek\b|\bstagiair\b/.test(lower)) return 'stage';
  if (/\btijdelijk\b|\bjaarcontract\b|\bbepaalde tijd\b/.test(lower)) return 'tijdelijk';
  if (/\bvast(?:e)?\s*(?:dienst(?:verband)?|aanstelling)\b|\bonbepaalde tijd\b/.test(lower)) return 'vast';

  return undefined;
}

export function parseDutchDate(text: string): string | undefined {
  // DD-MM-YYYY
  const dmy = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }

  // "8 april 2026" or "woensdag 8 april 2026"
  const dutchDate = text.match(/(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/i);
  if (dutchDate) {
    const day = dutchDate[1].padStart(2, '0');
    const month = DUTCH_MONTHS[dutchDate[2].toLowerCase()];
    const year = dutchDate[3];
    return `${year}-${month}-${day}`;
  }

  return undefined;
}

export function parseRfc822Date(dateStr: string): string | undefined {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}
