export interface FunctionContract {
    pre?: (...args: any[]) => Boolean;
    post?: (result: any) => Boolean;
    rescue?: (error: Error) => unknown;
}
export declare type Target = Function;
export interface ClassContract {
    [field: string]: FunctionContract | undefined | Function;
    construct?: (...args: any[]) => Boolean;
    invariant?: {
        [prop: string]: (value: unknown, oldValue?: unknown) => boolean;
    };
}
export declare type Contract<T> = T extends Function ? FunctionContract : ClassContract;
