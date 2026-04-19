import { ref, computed } from 'vue';
const REGIONS = [
    {
        id: 'zwolle',
        label: 'Regio Zwolle',
        municipalityIds: [
            'zwolle', 'kampen', 'zwartewaterland', 'dronten', 'noordoostpolder',
            'dalfsen', 'oldebroek', 'hattem', 'heerde',
            'od-ijsselland', 'od-twente', 'od-veluwe', 'od-de-vallei',
            'od-groene-metropool', 'ofgv', 'od-drenthe',
        ],
    },
    {
        id: 'pijnacker-nootdorp',
        label: 'Regio Pijnacker-Nootdorp',
        municipalityIds: [
            'pijnacker-nootdorp', 'lansingerland', 'delft', 'westland',
            'den-haag', 'zoetermeer', 'rijswijk', 'leidschendam-voorburg',
            'dcmr', 'od-haaglanden', 'od-west-holland',
        ],
    },
];
const props = defineProps();
const emit = defineEmits();
const sections = ref({
    region: true,
    municipality: true,
    education: true,
    employmentType: true,
});
function regionState(regionId) {
    const region = REGIONS.find(r => r.id === regionId);
    if (!region)
        return 'none';
    const selected = new Set(props.municipality);
    const hits = region.municipalityIds.filter(id => selected.has(id)).length;
    if (hits === 0)
        return 'none';
    if (hits === region.municipalityIds.length)
        return 'all';
    return 'some';
}
function toggleRegion(regionId) {
    const region = REGIONS.find(r => r.id === regionId);
    if (!region)
        return;
    const state = regionState(regionId);
    const current = new Set(props.municipality);
    if (state === 'all') {
        for (const id of region.municipalityIds)
            current.delete(id);
    }
    else {
        for (const id of region.municipalityIds)
            current.add(id);
    }
    emit('setFilter', 'municipality', [...current]);
}
const regionStates = computed(() => ({
    zwolle: regionState('zwolle'),
    'pijnacker-nootdorp': regionState('pijnacker-nootdorp'),
}));
function toggleMunicipality(id) {
    const current = [...props.municipality];
    const idx = current.indexOf(id);
    if (idx >= 0)
        current.splice(idx, 1);
    else
        current.push(id);
    emit('setFilter', 'municipality', current);
}
function toggleEducation(val) {
    const current = [...props.education];
    const idx = current.indexOf(val);
    if (idx >= 0)
        current.splice(idx, 1);
    else
        current.push(val);
    emit('setFilter', 'education', current);
}
function toggleEmploymentType(val) {
    const current = [...props.employmentType];
    const idx = current.indexOf(val);
    if (idx >= 0)
        current.splice(idx, 1);
    else
        current.push(val);
    emit('setFilter', 'employment_type', current);
}
const municipalityColors = {
    zwolle: 'border-municipality-zwolle text-municipality-zwolle bg-blue-50',
    kampen: 'border-municipality-kampen text-municipality-kampen bg-green-50',
    zwartewaterland: 'border-municipality-zwartewaterland text-municipality-zwartewaterland bg-red-50',
    dronten: 'border-municipality-dronten text-municipality-dronten bg-purple-50',
    noordoostpolder: 'border-municipality-noordoostpolder text-municipality-noordoostpolder bg-cyan-50',
    'pijnacker-nootdorp': 'border-municipality-pijnacker-nootdorp text-municipality-pijnacker-nootdorp bg-rose-50',
    lansingerland: 'border-municipality-lansingerland text-municipality-lansingerland bg-green-50',
    delft: 'border-municipality-delft text-municipality-delft bg-blue-50',
    westland: 'border-municipality-westland text-municipality-westland bg-orange-50',
    'den-haag': 'border-municipality-den-haag text-municipality-den-haag bg-fuchsia-50',
    zoetermeer: 'border-municipality-zoetermeer text-municipality-zoetermeer bg-teal-50',
    rijswijk: 'border-municipality-rijswijk text-municipality-rijswijk bg-yellow-50',
    'leidschendam-voorburg': 'border-municipality-leidschendam-voorburg text-municipality-leidschendam-voorburg bg-pink-50',
    dcmr: 'border-municipality-dcmr text-municipality-dcmr bg-slate-50',
    'od-haaglanden': 'border-municipality-od-haaglanden text-municipality-od-haaglanden bg-lime-50',
    'od-west-holland': 'border-municipality-od-west-holland text-municipality-od-west-holland bg-purple-50',
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "px-4 py-3 flex items-center justify-between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "text-sm font-semibold text-brand-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "px-4 py-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.sections.region = !__VLS_ctx.sections.region;
        } },
    'aria-expanded': (__VLS_ctx.sections.region),
    ...{ class: "flex items-center justify-between w-full text-left cursor-pointer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-xs font-semibold text-gray-700 uppercase tracking-wider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    ...{ class: "w-4 h-4 text-gray-400 transition-transform duration-200" },
    ...{ class: ({ 'rotate-180': __VLS_ctx.sections.region }) },
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M19 9l-7 7-7-7",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-3 flex flex-col gap-2" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sections.region) }, null, null);
for (const [r] of __VLS_getVForSourceType((__VLS_ctx.REGIONS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleRegion(r.id);
            } },
        key: (r.id),
        'aria-pressed': (__VLS_ctx.regionStates[r.id] === 'all'),
        ...{ class: "text-xs px-3 py-2 rounded-lg border font-medium transition-colors cursor-pointer text-left" },
        ...{ class: ({
                'border-brand-secondary text-brand-primary bg-blue-50 shadow-sm': __VLS_ctx.regionStates[r.id] === 'all',
                'border-brand-secondary/50 text-brand-primary bg-blue-50/40': __VLS_ctx.regionStates[r.id] === 'some',
                'border-gray-200 text-gray-600 hover:border-gray-300': __VLS_ctx.regionStates[r.id] === 'none',
            }) },
    });
    (r.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-[10px] text-gray-500" },
    });
    (r.municipalityIds.length);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "px-4 py-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.sections.municipality = !__VLS_ctx.sections.municipality;
        } },
    'aria-expanded': (__VLS_ctx.sections.municipality),
    ...{ class: "flex items-center justify-between w-full text-left cursor-pointer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5" },
});
if (__VLS_ctx.municipality.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-brand-secondary text-white rounded-full" },
    });
    (__VLS_ctx.municipality.length);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    ...{ class: "w-4 h-4 text-gray-400 transition-transform duration-200" },
    ...{ class: ({ 'rotate-180': __VLS_ctx.sections.municipality }) },
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M19 9l-7 7-7-7",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-3 flex flex-wrap gap-2 overflow-hidden" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sections.municipality) }, null, null);
for (const [m] of __VLS_getVForSourceType((__VLS_ctx.filters.municipalities))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleMunicipality(m.id);
            } },
        key: (m.id),
        'aria-pressed': (__VLS_ctx.municipality.includes(m.id)),
        ...{ class: "text-xs px-2.5 py-1 rounded-full border font-medium transition-colors cursor-pointer" },
        ...{ class: (__VLS_ctx.municipality.includes(m.id)
                ? __VLS_ctx.municipalityColors[m.id] || 'border-brand-secondary text-brand-primary bg-blue-50'
                : 'border-gray-200 text-gray-600 hover:border-gray-300') },
    });
    (m.name?.replace('Gemeente ', ''));
    (m.count);
}
if (__VLS_ctx.filters.educationLevels.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "px-4 py-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.filters.educationLevels.length > 0))
                    return;
                __VLS_ctx.sections.education = !__VLS_ctx.sections.education;
            } },
        'aria-expanded': (__VLS_ctx.sections.education),
        ...{ class: "flex items-center justify-between w-full text-left cursor-pointer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5" },
    });
    if (__VLS_ctx.education.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-brand-secondary text-white rounded-full" },
        });
        (__VLS_ctx.education.length);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "w-4 h-4 text-gray-400 transition-transform duration-200" },
        ...{ class: ({ 'rotate-180': __VLS_ctx.sections.education }) },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M19 9l-7 7-7-7",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-3 flex flex-wrap gap-2 overflow-hidden" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sections.education) }, null, null);
    for (const [e] of __VLS_getVForSourceType((__VLS_ctx.filters.educationLevels))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filters.educationLevels.length > 0))
                        return;
                    __VLS_ctx.toggleEducation(e.value);
                } },
            key: (e.value),
            'aria-pressed': (__VLS_ctx.education.includes(e.value)),
            ...{ class: "text-xs px-2.5 py-1 rounded-full border font-medium transition-colors cursor-pointer" },
            ...{ class: (__VLS_ctx.education.includes(e.value)
                    ? 'border-brand-secondary text-brand-primary bg-blue-50 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300') },
        });
        (e.value);
        (e.count);
    }
}
if (__VLS_ctx.filters.employmentTypes.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "px-4 py-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.filters.employmentTypes.length > 0))
                    return;
                __VLS_ctx.sections.employmentType = !__VLS_ctx.sections.employmentType;
            } },
        'aria-expanded': (__VLS_ctx.sections.employmentType),
        ...{ class: "flex items-center justify-between w-full text-left cursor-pointer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5" },
    });
    if (__VLS_ctx.employmentType.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-brand-secondary text-white rounded-full" },
        });
        (__VLS_ctx.employmentType.length);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "w-4 h-4 text-gray-400 transition-transform duration-200" },
        ...{ class: ({ 'rotate-180': __VLS_ctx.sections.employmentType }) },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M19 9l-7 7-7-7",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-3 flex flex-wrap gap-2 overflow-hidden" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sections.employmentType) }, null, null);
    for (const [t] of __VLS_getVForSourceType((__VLS_ctx.filters.employmentTypes))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filters.employmentTypes.length > 0))
                        return;
                    __VLS_ctx.toggleEmploymentType(t.value);
                } },
            key: (t.value),
            'aria-pressed': (__VLS_ctx.employmentType.includes(t.value)),
            ...{ class: "text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize cursor-pointer" },
            ...{ class: (__VLS_ctx.employmentType.includes(t.value)
                    ? 'border-brand-secondary text-brand-primary bg-blue-50 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300') },
        });
        (t.value);
        (t.count);
    }
}
if (__VLS_ctx.activeCount > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeCount > 0))
                    return;
                __VLS_ctx.emit('clear');
            } },
        ...{ class: "w-full py-2.5 px-4 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer" },
    });
    (__VLS_ctx.activeCount);
}
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-brand-text']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-brand-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-brand-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-brand-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-50']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            REGIONS: REGIONS,
            emit: emit,
            sections: sections,
            toggleRegion: toggleRegion,
            regionStates: regionStates,
            toggleMunicipality: toggleMunicipality,
            toggleEducation: toggleEducation,
            toggleEmploymentType: toggleEmploymentType,
            municipalityColors: municipalityColors,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=FilterBar.vue.js.map