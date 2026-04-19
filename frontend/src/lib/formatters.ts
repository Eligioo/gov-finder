export function formatSalary(min?: number, max?: number, raw?: string): string {
  if (min && max) {
    return `€${min.toLocaleString('nl-NL')} - €${max.toLocaleString('nl-NL')}`;
  }
  if (min) {
    return `€${min.toLocaleString('nl-NL')}`;
  }
  if (raw) return raw;
  return '';
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const deadline = new Date(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function deadlineStatus(iso?: string): 'expired' | 'urgent' | 'soon' | 'open' | null {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days < 0) return 'expired';
  if (days <= 7) return 'urgent';
  if (days <= 14) return 'soon';
  return 'open';
}

export function deadlineLabel(iso?: string): string {
  const days = daysUntil(iso);
  if (days === null) return '';
  if (days < 0) return 'Verlopen';
  if (days === 0) return 'Vandaag';
  if (days === 1) return 'Morgen';
  return `${days} dagen`;
}

export const MUNICIPALITY_HEX: Record<string, string> = {
  zwolle: '#0047bb',
  kampen: '#1a8f3c',
  zwartewaterland: '#d4380d',
  dronten: '#7c3aed',
  noordoostpolder: '#0891b2',
  dalfsen: '#059669',
  oldebroek: '#b45309',
  hattem: '#be185d',
  heerde: '#4338ca',
  'od-ijsselland': '#0369a1',
  'od-twente': '#9333ea',
  'od-veluwe': '#15803d',
  'od-de-vallei': '#c2410c',
  'od-groene-metropool': '#047857',
  ofgv: '#6d28d9',
  'od-drenthe': '#0e7490',
  'pijnacker-nootdorp': '#e11d48',
  lansingerland: '#16a34a',
  delft: '#1d4ed8',
  westland: '#ea580c',
  'den-haag': '#c026d3',
  zoetermeer: '#0d9488',
  rijswijk: '#ca8a04',
  'leidschendam-voorburg': '#db2777',
  dcmr: '#334155',
  'od-haaglanden': '#65a30d',
  'od-west-holland': '#7e22ce',
};

export const MUNICIPALITY_COLORS: Record<string, string> = {
  zwolle: 'bg-municipality-zwolle',
  kampen: 'bg-municipality-kampen',
  zwartewaterland: 'bg-municipality-zwartewaterland',
  dronten: 'bg-municipality-dronten',
  noordoostpolder: 'bg-municipality-noordoostpolder',
  dalfsen: 'bg-municipality-dalfsen',
  oldebroek: 'bg-municipality-oldebroek',
  hattem: 'bg-municipality-hattem',
  heerde: 'bg-municipality-heerde',
  'od-ijsselland': 'bg-municipality-od-ijsselland',
  'od-twente': 'bg-municipality-od-twente',
  'od-veluwe': 'bg-municipality-od-veluwe',
  'od-de-vallei': 'bg-municipality-od-de-vallei',
  'od-groene-metropool': 'bg-municipality-od-groene-metropool',
  ofgv: 'bg-municipality-ofgv',
  'od-drenthe': 'bg-municipality-od-drenthe',
  'pijnacker-nootdorp': 'bg-municipality-pijnacker-nootdorp',
  lansingerland: 'bg-municipality-lansingerland',
  delft: 'bg-municipality-delft',
  westland: 'bg-municipality-westland',
  'den-haag': 'bg-municipality-den-haag',
  zoetermeer: 'bg-municipality-zoetermeer',
  rijswijk: 'bg-municipality-rijswijk',
  'leidschendam-voorburg': 'bg-municipality-leidschendam-voorburg',
  dcmr: 'bg-municipality-dcmr',
  'od-haaglanden': 'bg-municipality-od-haaglanden',
  'od-west-holland': 'bg-municipality-od-west-holland',
};

export const MUNICIPALITY_TEXT_COLORS: Record<string, string> = {
  zwolle: 'text-municipality-zwolle',
  kampen: 'text-municipality-kampen',
  zwartewaterland: 'text-municipality-zwartewaterland',
  dronten: 'text-municipality-dronten',
  noordoostpolder: 'text-municipality-noordoostpolder',
  dalfsen: 'text-municipality-dalfsen',
  oldebroek: 'text-municipality-oldebroek',
  hattem: 'text-municipality-hattem',
  heerde: 'text-municipality-heerde',
  'od-ijsselland': 'text-municipality-od-ijsselland',
  'od-twente': 'text-municipality-od-twente',
  'od-veluwe': 'text-municipality-od-veluwe',
  'od-de-vallei': 'text-municipality-od-de-vallei',
  'od-groene-metropool': 'text-municipality-od-groene-metropool',
  ofgv: 'text-municipality-ofgv',
  'od-drenthe': 'text-municipality-od-drenthe',
  'pijnacker-nootdorp': 'text-municipality-pijnacker-nootdorp',
  lansingerland: 'text-municipality-lansingerland',
  delft: 'text-municipality-delft',
  westland: 'text-municipality-westland',
  'den-haag': 'text-municipality-den-haag',
  zoetermeer: 'text-municipality-zoetermeer',
  rijswijk: 'text-municipality-rijswijk',
  'leidschendam-voorburg': 'text-municipality-leidschendam-voorburg',
  dcmr: 'text-municipality-dcmr',
  'od-haaglanden': 'text-municipality-od-haaglanden',
  'od-west-holland': 'text-municipality-od-west-holland',
};

export function relativeTime(iso?: string): string {
  if (!iso) return 'Onbekend';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Zojuist';
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.floor(hours / 24);
  return `${days} dag${days > 1 ? 'en' : ''} geleden`;
}
