import type { VacancyListResponse } from '@application-finder/shared/src/types.js';
type __VLS_Props = {
    filters: VacancyListResponse['filters'];
    municipality: string[];
    education: string[];
    employmentType: string[];
    activeCount: number;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    clear: () => any;
    setFilter: (key: string, value: string[]) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClear?: (() => any) | undefined;
    onSetFilter?: ((key: string, value: string[]) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
//# sourceMappingURL=FilterBar.vue.d.ts.map