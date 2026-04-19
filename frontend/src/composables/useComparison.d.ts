export declare function useComparison(): {
    compareIds: import("@vueuse/shared").RemovableRef<number[]>;
    toggleCompare: (id: number) => void;
    isComparing: (id: number) => boolean;
    clearCompare: () => void;
    count: import("vue").ComputedRef<number>;
    canAdd: import("vue").ComputedRef<boolean>;
};
//# sourceMappingURL=useComparison.d.ts.map