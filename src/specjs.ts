import { Contract, ClassContract, FunctionContract, Target } from './specjs.types'
import { INVARIANT, PRE_ERROR, POST_ERROR, PRE_CLASS_ERROR, POST_CLASS_ERROR, PRE_METHOD_ERROR, POST_METHOD_ERROR, CONTRACT_UNDEFINED_ERROR, UNDEFINED, IS_REQUIRED_ERROR, IS_RANGE_ERROR } from './constants';

/**
 * Class Decorator
 * @param contract
 */
export function SignClass(contract: ClassContract) {
  return (target: any) => {
    return Sign(target, contract)
  }
}

/**
 * Execute condition and throw proper error message
 * @param cond
 * @param condArgs
 * @param defaultMsg
 */
function runCondition(cond: Function, condArgs: any[], defaultMsg: string): void {
  if (typeof cond === 'function') {
    const condResult = cond.apply(null, condArgs);
    if (condResult !== true) {
      throw Error(typeof condResult === 'string' ? condResult : defaultMsg)
    }
  }
}

/**
 * Bind a contract with a function, class or object.
 * @param target
 * @param contract
 */
export function Sign(target: Target, contract: any) {

  if (contract === UNDEFINED || contract === null) {
    throw new Error(CONTRACT_UNDEFINED_ERROR)
  }

  const invariants: { [key: string]: [Function, string | undefined] } = {}

  for (const key in contract) {
    let val = contract[key][INVARIANT];
    if (val) {
      invariants[key] = val
    }
  }

  const handler: ProxyHandler<any> = {

    /**
     * Trap function calls
     */
    apply(cb: any, thisArg, args) {

      const { pre, post, rescue } = contract(...args) ?? {}

      let result: unknown

      try {
        // Precondition
        runCondition(pre, args, PRE_ERROR)

        result = cb.apply(thisArg, args)

        // Postcondition
        runCondition(post, [result], POST_ERROR)
      } catch (error) {

        if (typeof rescue === 'function') {
          result = rescue(error)
        } else {
          throw error
        }
      }

      return result
    },

    /**
     * Trap classes initialization
     */
    construct(Target, args) {

      const { pre, post } = contract?.constructor(...args) ?? {}

      // Precondition
      runCondition(pre, args, PRE_CLASS_ERROR)

      const instance = new Target(...args)

      // Postcondition
      runCondition(post, [instance], POST_CLASS_ERROR)

      return new Proxy(instance, handler)
    },

    /**
     * Trap methods
     * @param target
     * @param prop
     * @param receiver
     */
    get(target, prop, receiver) {
      const targetValue = Reflect.get(target, prop, receiver);

      if (typeof targetValue === 'function') {
        return function (this: any, ...args: any[]) {
          const { pre, post } = contract[prop]?.(...args) ?? {}

          let result

          // Precondition
          runCondition(pre, [target], PRE_METHOD_ERROR)

          result = targetValue.apply(target, args);

          // Postcondition
          runCondition(post, [result, target], POST_METHOD_ERROR)

          return result
        }
      } else {
        return targetValue;
      }
    },

    /**
     * Trap object property change
     */
    set(target, prop: string, value) {

      if (!invariants[prop]?.[0](value, target[prop])) {
        const msg = invariants[prop]?.[1] || `Prop ${String(prop)} is invalid`
        // const msg = invariants?.[prop]?.[1] ?? `Prop ${String(prop)} is invalid`
        throw Error(msg)
      }
      Reflect.set(target, prop, value)
      return true
    }
  }
  return new Proxy<any>(target, handler)
}

/**
 * Compose conditions
 * @param conds
 */
export const conditions = (...conds: Array<[Function, string | undefined]>) => (...args: any[]) => {
  let result: string | boolean | undefined = true

  for (const [cond, errorMsg] of conds) {
    let temp = cond(...args)
    if (!temp) {
      result = errorMsg;
      break
    }
  }

  return result
}

/**
 * Set a invariant for a field
 * @param fn
 * @param errorMsg
 */
export const invariant = (fn: Function, errorMsg?: string) => ({ [INVARIANT]: [fn, errorMsg] })

/**
 * Take a regular function as condition
 * @param fn
 * @param errorMsg
 */
export const check = (fn: Function, errorMsg?: string): [Function, string | undefined] => [fn, errorMsg]

/**
 * Check if fields are defined
 * @param args
 */
export const isRequired = (...args: any[]): [Function, string | undefined] => [() => {
  for (const value of args) {
    if (value === undefined || value === null) {
      return false
    }
  }

  return true
}, IS_REQUIRED_ERROR]

/**
 * Check if value is within a range
 * @param value
 * @param min
 * @param max
 */
export const isRange = (value: number, min: number, max: number): [Function, string | undefined] => [
  () => value >= min && value <= max
  , IS_RANGE_ERROR
]

