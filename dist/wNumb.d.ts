interface WNumbOptions {
    decimals: number;
    mark: string;
    thousand: string;
    prefix: string;
    suffix: string;
    negative: string;
    negativeBefore: string;
    encoder: (value: number) => number;
    decoder: (value: number) => number;
    edit: (value: string, originalInput: number) => string;
    undo: (value: string) => string;
}
export declare function strReverse(a: string): string;
export declare function strStartsWith(input: string, match: string): boolean;
export declare function strEndsWith(input: string, match: string): boolean;
export declare function throwEqualError(F: WNumbOptions, a: keyof WNumbOptions, b: keyof WNumbOptions, message?: string): void;
export declare function isValidNumber(input: unknown): boolean;
export declare function toFixed(value: number, exp: number): string;
export declare class wNumb {
    private _options;
    constructor(options: Partial<WNumbOptions>);
    private formatTo;
    private formatFrom;
    private defaultDecimals;
    validate(inputOptions: Partial<WNumbOptions>): WNumbOptions;
    get options(): WNumbOptions;
    set options(nOpt: Partial<WNumbOptions>);
    to(input: number): string | undefined;
    from(input: string): number | undefined;
}
declare const _default: (options: Partial<WNumbOptions>) => wNumb;
export default _default;
