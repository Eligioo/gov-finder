/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E40AF',
          secondary: '#3B82F6',
          cta: '#F59E0B',
          bg: '#F8FAFC',
          text: '#1E3A8A',
        },
        municipality: {
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
        },
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
