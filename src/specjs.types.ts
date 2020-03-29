export interface FunctionContract {
  pre?: (...args: any[]) => Boolean,
  post?: (result: any) => Boolean,
  rescue?: (error: Error) => unknown
}

export type Target = Function

export interface ClassContract {
  [field: string]: FunctionContract | undefined
  construct?: FunctionContract;
  invariant?: {
    [prop: string]: (value: unknown, oldValue?: unknown) => boolean
  };
}

export type Contract<T> = T extends Function ? FunctionContract : ClassContract
