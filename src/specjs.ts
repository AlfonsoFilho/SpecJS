import { Contract, ClassContract, FunctionContract, Target } from './specjs.types'

/**
 * Type guard
 * @param contractType
 */
function isClass(contractType: FunctionContract | ClassContract, obj?: any, parent?: any): contractType is ClassContract {
  if ((!!obj && !!parent) && obj instanceof parent) {
    return true
  }
  return (contractType as ClassContract).construct !== undefined
}

/**
 * Class Decorator
 * @param contract
 */
export function BindClassSpec(contract: ClassContract) {
  return (target: any) => {
    return Sign(target, contract)
  }
}

const PRE_ERROR = 'Precondition fails'
const POST_ERROR = 'Postcondition fails'

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
  const handler: ProxyHandler<any> = {

    /**
     * Trap function calls
     */
    apply(cb: any, thisArg, args) {

      const { pre, post, rescue } = contract(...args)

      let result: unknown

      try {
        // Precondition
        runCondition(pre, args, PRE_ERROR)

        result = cb.apply(thisArg, args)

        // Postcondition
        runCondition(post, [result], POST_ERROR)
      } catch (error) {
        console.log('err', error)
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
      if (isClass(contract)) {
        if (!(contract?.construct?.apply(null, args) ?? true)) {
          throw Error('Precondition on constructor fails')
        }
      }

      const instance = new Target(...args)
      return new Proxy(instance, handler)
    },

    /**
     * Trap object property change
     */
    set(target2, prop: string, value) {
      if (isClass(contract, target2, target)) {
        if (!(contract?.invariant?.[prop](value, target2[prop]) ?? true)) {
          throw Error(`Prop ${String(prop)} is invalid`)
        }
      }
      Reflect.set(target2, prop, value)
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
