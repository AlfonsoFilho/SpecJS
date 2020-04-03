export type FunctionContract = () => ({
  pre?: () => Boolean
  post?: (result: any) => Boolean
  rescue?: (error: Error) => unknown
}) | {}

export type Target = Function

export interface ClassContract {
  [field: string]: FunctionContract | undefined | Function | {},
  construct?: (...args: any[]) => Boolean,
  invariant?: {
    [prop: string]: (value: any, oldValue?: any) => boolean
  };
}

export type Contract = FunctionContract | ClassContract
