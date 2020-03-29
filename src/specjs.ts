import { Contract, ClassContract, FunctionContract } from './specjs.types'

/**
 * Type guard
 * @param contractType
 */
function isClass(contractType: FunctionContract | ClassContract): contractType is ClassContract {
  return (contractType as ClassContract).construct !== undefined
}

/**
 * Class Decorator
 * @param contract
 */
export function BindClassSpec(contract: ClassContract) {
  return (target: any) => {
    return bindSpec<typeof target>(target, contract)
  }
}

/**
 * Creates a new contract
 * @param target
 * @param spec
 */
export function bindSpec<T extends Function>(target: T, spec: Contract<T>) {
  const handler: ProxyHandler<any> = {

    /**
     * Trap function calls
     */
    apply(cb: T, _this, args) {
      let result: unknown
      try {
        if (!(spec?.pre?.apply?.(null, args) ?? true)) {
          throw Error('Precondition fails')
        }

        result = cb.apply(_this, args)

        if (!(spec?.post?.(result) ?? true)) {
          throw Error('Postcondition fails')
        }
      } catch (error) {
        if (typeof spec.rescue === 'function') {
          result = spec.rescue(error)
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
      if (isClass(spec)) {
        if (!(spec?.construct?.apply(null, args) ?? true)) {
          throw Error('Precondition on constructor fails')
        }
      }

      const instance = new Target(...args)
      return new Proxy(instance, handler)
    },

    /**
     * Trap object property change
     */
    set(target, prop: string, value) {
      if (isClass(spec)) {
        if (!(spec?.invariant?.[prop](value, target[prop]) ?? true)) {
          throw Error(`Prop ${String(prop)} is invalid`)
        }
      }
      Reflect.set(target, prop, value)
      return true
    }
  }
  return new Proxy<T>(target, handler)
}
