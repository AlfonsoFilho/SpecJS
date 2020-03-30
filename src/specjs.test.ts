/* eslint-env jest */

import { bindSpec, BindClassSpec } from "./specjs"
import { ClassContract, FunctionContract } from "./specjs.types"


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


describe('when function throw an exception', () => {
  it('should catch and run the rescue', () => {

    const rescueFn = jest.fn().mockReturnValue('Error caught')
    const TestContract: FunctionContract = {
      rescue: rescueFn
    }

    function Test() {
      return JSON.parse('')
    }

    const TestWithContract = bindSpec(Test, TestContract)

    expect(TestWithContract()).toBe('Error caught')
    expect(rescueFn).toBeCalled()

  })
})

describe('when precondition is set to class constructor', () => {

  const TestClassContract: ClassContract = {
    construct(int: number) {
      return int > 0
    }
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

  it('should instantiate the class if condition is satisfied', () => {
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

describe('when class contract is empty', () => {

  const TestClassEmptyContract = {}

  @BindClassSpec(TestClassEmptyContract)
  class TestClass {
    data: Number

    constructor(val: number) {
      this.data = val
    }

    setData(val: number) {
      this.data = val
    }
  }

  class TestNoSpecClass {
    data: Number

    constructor(val: number) {
      this.data = val
    }

    setData(val: number) {
      this.data = val
    }
  }

  it('should return the result', () => {
    const instance = new TestClass(2)
    expect(instance.data).toBe(2)
  })

  it('should update object state', () => {
    const instance = new TestClass(2)
    expect(instance.data).toBe(2)
    instance.setData(0)
    expect(instance.data).toBe(0)
  })

  it('should work as a regular class', () => {
    const instance = new TestClass(2)
    const instance2 = new TestNoSpecClass(2)
    expect(instance.data).toBe(instance2.data)
  })

})


describe('when invariant is set', () => {
  const TestContract: ClassContract = {
    invariant: {
      data(value, old) {
        return value > 1 && value < 5 && value !== old
      }
    }
  }

  @BindClassSpec(TestContract)
  class TestClass {
    data: Number

    constructor(val: number) {
      this.data = val
    }

    setData(val: number) {
      this.data = val
    }
  }

  it('should update the property', () => {
    const instance = new TestClass(3)
    expect(instance.data).toBe(3)
    instance.data = 2
    expect(instance.data).toBe(2)
  })

  it('should throw an error if invariant fails', () => {
    expect(() => {
      const instance = new TestClass(3)
      expect(instance.data).toBe(3)
      instance.data = 6
    }).toThrow('Prop data is invalid')
  })
})
