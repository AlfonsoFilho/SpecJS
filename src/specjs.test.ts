/* eslint-env jest */

import { Sign, BindClassSpec } from "./specjs"
import { ClassContract, FunctionContract } from "./specjs.types"


function ToUpper(str: string): string {
  return str.toUpperCase()
}

class TestClass {
  public data: number;
  constructor(initialData: number) {
    this.data = initialData
  }
}

/*

  function Slice(str: string, start: number, length: number) {
    return str.slice(start, length)
  }


  const contract = (str: string, start: number, length: number) => ({
    pre: () => str.length > 0,
    post: (result: number) => result > 0
  })

  const contract = (str: string, start: number, length: number) => ({
    pre: conditions(
      isRequired(str, start),
      inRange(start, 0, 10),
      check(() => str != 'skip')
    ),
    post: (result: number) => result > 0
  })

  const classContract = {
    field: invariant((value, old) => value > old),
    setField: (a: string) => ({
      pre: () => typeof a === 'string'
    }),
    contructor: pre
  }

*/

describe('when contract is empty', () => {

  const ClassEmptyContract = {}
  const FunctionEmptyContract = () => ({ pre: () => false })
  const ToUpperWithContract = Sign(ToUpper, FunctionEmptyContract)
  const TestClassWithContract = Sign(TestClass, ClassEmptyContract)

  it.skip('should throw an exception', () => {
    expect(ToUpperWithContract('test')).toBe('TEST')
  })

  it('should work as the original function', () => {
    expect(ToUpperWithContract('test')).toBe(ToUpper('test'))
  })

})


describe.skip('when precondition is set', () => {

  const ToUpperContract: FunctionContract = {
    pre(str: string) {
      return str.length > 0
    }
  }

  const ToUpperWithContract = Sign(ToUpper, ToUpperContract)

  it('should return the result if the condition is satisfied', () => {
    expect(ToUpperWithContract('test')).toBe('TEST')
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => ToUpperWithContract('')).toThrow('Precondition fails')
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => ToUpperWithContract('')).toThrow('Precondition fails')
  })
})

describe.skip('when postcondition is set', () => {

  const ToUpperContract = {
    post(result: string) {
      return result.split('').every((char) => /[A-Z]/.test(char))
    }
  }

  function Wrong(str: string) {
    return 'test'
  }

  const ToUpperWithContract = Sign(ToUpper, ToUpperContract)
  const WrongWithContract = Sign(Wrong, ToUpperContract)

  it('should return the result if the condition is satisfied', () => {
    expect(ToUpperWithContract('test')).toBe('TEST')
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => WrongWithContract('')).toThrow('Postcondition fails')
  })
})


describe.skip('when function throw an exception', () => {
  it('should catch and run the rescue', () => {

    const rescueFn = jest.fn().mockReturnValue('Error caught')
    const TestContract: FunctionContract = {
      // rescue: rescueFn as () => any
    }

    function Test() {
      return JSON.parse('')
    }

    const TestWithContract = Sign(Test, TestContract)

    expect(TestWithContract()).toBe('Error caught')
    expect(rescueFn).toBeCalled()

  })
})

describe.skip('when precondition is set to class constructor', () => {

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

describe.skip('when class contract is empty', () => {

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


describe.skip('when invariant is set', () => {
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
