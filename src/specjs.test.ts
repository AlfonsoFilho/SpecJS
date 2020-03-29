/* eslint-env jest */

import { bindSpec, BindClassSpec } from "./specjs"
import { ClassContract } from "./specjs.types"


type IToUpper = (str: string) => string

function ToUpper(str: string) {
  return str.toUpperCase()
}

describe('when contract is empty', () => {

  const ToUpperEmptyContract = {}
  const ToUpperWithContract = bindSpec<IToUpper>(ToUpper, ToUpperEmptyContract)

  it('should return the result', () => {
    expect(ToUpperWithContract('test')).toBe('TEST')
  })

  it('should work as the original function', () => {
    expect(ToUpperWithContract('test')).toBe(ToUpper('test'))
  })

})


describe('when precondition is set', () => {

  const ToUpperContract = {
    pre(str: string) {
      return str.length > 0
    }
  }

  const ToUpperWithContract = bindSpec<IToUpper>(ToUpper, ToUpperContract)

  it('should return the result if the condition is satisfied', () => {
    expect(ToUpperWithContract('test')).toBe('TEST')
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => ToUpperWithContract('')).toThrow('Precondition fails')
  })
})

describe('when postcondition is set', () => {

  const ToUpperContract = {
    post(result: string) {
      return result.split('').every((char) => /[A-Z]/.test(char))
    }
  }

  function Wrong(str: string) {
    return 'test'
  }

  const ToUpperWithContract = bindSpec<IToUpper>(ToUpper, ToUpperContract)
  const WrongWithContract = bindSpec<IToUpper>(Wrong, ToUpperContract)

  it('should return the result if the condition is satisfied', () => {
    expect(ToUpperWithContract('test')).toBe('TEST')
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => WrongWithContract('')).toThrow('Postcondition fails')
  })
})

describe('when precondition is set to class constructor', () => {

  const TestClassContract: ClassContract = {
    construct(int: number) {
      return int > 0
    },

    // invariant: {
    //   data(value, old) {
    //     console.log(value, old)
    //     // return value !== old
    //     return value > 0 && value < 10
    //   }
    // }

    // rescue(error) {
    //     console.log('SHit', error)
    //     return 'DEFAULT'
    // }
  }

  @BindClassSpec(TestClassContract)
  class TestClass {
    data: Number

    constructor(val: number) {
      this.data = val
    }

    setData(val: number) {
      this.data = val
    }
  }

  it('should init the class if condition is satisfied', () => {
    const instance = new TestClass(1)
    expect(instance).toBeDefined()
    expect(instance.data).toBe(1)
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => {
      const instance = new TestClass(0)
    }).toThrow('Precondition on constructor fails')
  })
})

