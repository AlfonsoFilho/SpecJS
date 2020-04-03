import { Contract, ClassContract, FunctionContract, Target } from './specjs.types'

/**
//  * Type guard
//  * @param contractType
//  */
// function isClass(contractType: FunctionContract | ClassContract, obj?: any, parent?: any): contractType is ClassContract {
//   if ((!!obj && !!parent) && obj instanceof parent) {
//     return true
//   }
//   return (contractType as ClassContract).construct !== undefined
// }

/**
 * Class Decorator
 * @param contract
 */
export function SignClass(contract: ClassContract) {
  return (target: any) => {
    return Sign(target, contract)
  }
}

const PRE_ERROR = 'Precondition fails'
const POST_ERROR = 'Postcondition fails'
const PRE_CLASS_ERROR = 'Precondition of constructor fails'
const POST_CLASS_ERROR = 'Postcondition of constructor fails'
const PRE_METHOD_ERROR = 'Precondition of method fails'
const POST_METHOD_ERROR = 'Postcondition of method fails'


const INVARIANT = Symbol()

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
 * Creates a new contract
 * @param target
 * @param contract
 */
export function Sign(target: Target, contract: any) {

  const invariants: { [key: string]: [Function, string | undefined] } = {}

  for (const key in contract) {
    let val = contract[key][INVARIANT];
    if (val) {
      invariants[key] = val
    }
  }

  console.log('invariant', invariants)


  const handler: ProxyHandler<any> = {

    /**
     * Trap function calls
     */
    apply(cb: any, thisArg, args) {
      console.log('apply?')
      const { pre, post, rescue } = contract(...args)

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

      const { pre, post } = contract?.constructor(...args)

      runCondition(pre, args, PRE_CLASS_ERROR)

      const instance = new Target(...args)

      runCondition(post, [instance], POST_CLASS_ERROR)
      console.log(Object.getOwnPropertyNames(instance))
      console.log(instance.prototype)
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
        return function (...args: any[]) {
          const { pre, post } = contract?.[prop](...args)

          let result

          runCondition(pre, args, PRE_METHOD_ERROR)

          result = targetValue.apply(target, args); // (A)

          runCondition(post, [result], POST_METHOD_ERROR)

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
      console.log('prop', prop)
      if (!invariants[prop][0](value, target[prop])) {
        const msg = invariants[prop][1] || `Prop ${String(prop)} is invalid`
        throw Error(msg)
      }
      Reflect.set(target, prop, value)
      return true
    }
  }
  return new Proxy<any>(target, handler)
}


export const check = (fn: Function, errorMsg?: string): [Function, string | undefined] => [fn, errorMsg]

export const isRequired = (...args: any[]): [Function, string | undefined] => [() => {
  for (const value of args) {
    if (value === undefined || value === null) {
      return false
    }
  }

  return true
}, 'is required']

export const isRange = (value: number, min: number, max: number): [Function, string | undefined] => [
  () => value >= min && value <= max, 'not in range'
]

export const conditions = (...conds: Array<[Function, string | undefined]>) => (...args: any[]) => {
  let result: string | boolean | undefined = true
  console.log('?', conds)
  for (const [cond, errorMsg] of conds) {
    let temp = cond(...args)
    if (!temp) {
      result = errorMsg;
      break
    }
  }

  return result
}

export const invariant = (fn: Function, errorMsg: string) => ({ [INVARIANT]: [fn, errorMsg] })
