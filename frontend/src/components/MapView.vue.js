import { ref, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import { fetchMunicipalities } from '@/lib/api';
import { useRouter } from 'vue-router';
const router = useRouter();
const mapContainer = ref();
let map = null;
const municipalityColorHex = {
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
function createMarkerIcon(color, count) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      background: ${color};
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">${count}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
}
onMounted(async () => {
    if (!mapContainer.value)
        return;
    map = L.map(mapContainer.value).setView([52.2, 5.3], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
    }).addTo(map);
    try {
        const municipalities = await fetchMunicipalities();
        const latLngs = [];
        for (const m of municipalities) {
            const mData = m;
            if (!mData.lat || !mData.lng)
                continue;
            const color = municipalityColorHex[mData.id] || '#6b7280';
            const icon = createMarkerIcon(color, mData.vacancyCount ?? 0);
            const marker = L.marker([mData.lat, mData.lng], { icon }).addTo(map);
            latLngs.push([mData.lat, mData.lng]);
            marker.bindPopup(`
        <div style="text-align:center; min-width:120px;">
          <strong>${mData.name}</strong><br/>
          <span style="font-size:18px; font-weight:bold;">${mData.vacancyCount ?? 0}</span> vacatures<br/>
          <a href="/?municipality=${mData.id}" style="color:#2563eb; font-size:13px;">Bekijk vacatures &rarr;</a>
        </div>
      `);
        }
        if (latLngs.length > 0) {
            map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
        }
    }
    catch {
        // silently fail
    }
});
onUnmounted(() => {
    map?.remove();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "mapContainer",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.mapContainer} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            mapContainer: mapContainer,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MapView.vue.js.map