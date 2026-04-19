export declare function formatSalary(min?: number, max?: number, raw?: string): string;
export declare function formatDate(iso?: string): string;
export declare function daysUntil(iso?: string): number | null;
export declare function deadlineStatus(iso?: string): 'expired' | 'urgent' | 'soon' | 'open' | null;
export declare function deadlineLabel(iso?: string): string;
export declare const MUNICIPALITY_HEX: Record<string, string>;
export declare const MUNICIPALITY_COLORS: Record<string, string>;
export declare const MUNICIPALITY_TEXT_COLORS: Record<string, string>;
export declare function relativeTime(iso?: string): string;
//# sourceMappingURL=formatters.d.ts.map