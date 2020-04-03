/* eslint-env jest */

import { Sign, SignClass, conditions, check, invariant, isRange, isRequired } from "./specjs"
import { CONTRACT_UNDEFINED_ERROR, PRE_CLASS_ERROR, POST_CLASS_ERROR, PRE_METHOD_ERROR, POST_METHOD_ERROR, PRE_ERROR, IS_REQUIRED_ERROR, IS_RANGE_ERROR } from "./constants"


function Slice(str: string, start: number, end: number) {
  return str.slice(start, end)
}

class BaseClass {
  data: number

  constructor(val: number) {
    this.data = val
  }

  setData(val: number) {
    this.data = val
  }

  increment(amount: number) {
    this.data = this.data + amount
    return `Data: ${this.data}`
  }
}

describe('when contract is undefined or null', () => {

  it('should throw an error if contract is undefined', () => {
    expect(() => {
      const TestUndefined = Sign(() => { }, undefined)
    }).toThrow(CONTRACT_UNDEFINED_ERROR)

    expect(() => {
      const TestNull = Sign(() => { }, null)
    }).toThrow(CONTRACT_UNDEFINED_ERROR)

    expect(() => {
      @SignClass(undefined as any)
      class Empty { }
      const instance = new Empty()
    }).toThrow(CONTRACT_UNDEFINED_ERROR)

  })
})

describe('when contract is empty', () => {

  const EmptyClassContract = {}
  const EmptyContract = (str: string, start: number, end: number) => { }
  const SliceWithContract = Sign(Slice, EmptyContract)
  @SignClass(EmptyClassContract)
  class Test extends BaseClass { }

  it('should work as the original function', () => {
    expect(SliceWithContract('test', 0, 2)).toBe(Slice('test', 0, 2))
  })

  it('should work as the original function', () => {
    const instanceBase = new BaseClass(1)
    const instanceTest = new Test(1)
    expect(instanceTest.data).toBe(instanceBase.data)
    instanceTest.increment(1)
    instanceBase.increment(1)
    expect(instanceTest.data).toBe(instanceBase.data)
  })

})


describe('when function has precondition set', () => {

  const Contract = (str: string, start: number, end: number) => ({
    pre: conditions(
      check(() => str.length > 0)
    )
  })

  const ContractWithCustomError = (str: string, start: number, end: number) => ({
    pre: conditions(
      check(() => str.length > 0, 'should have one char at least')
    )
  })

  const SliceWithContract = Sign(Slice, Contract)
  const SliceWithCustomErrorContract = Sign(Slice, ContractWithCustomError)

  it('should have the same result as original function', () => {
    expect(SliceWithContract('test', 0, 2)).toBe(Slice('test', 0, 2))
  })

  it('should return the result if the condition IS satisfied', () => {
    expect(SliceWithContract('test', 0, 2)).toBe('te')
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => SliceWithContract('')).toThrow('Precondition fails')
  })

  it('should throw an custom error if condition is NOT satisfied', () => {
    expect(() => SliceWithCustomErrorContract('')).toThrow('should have one char at least')
  })
})

describe('when function has postcondition set', () => {

  function Wrong(str: string) {
    return undefined
  }

  const Contract = (str: string, start: number, end: number) => ({
    post: conditions(
      check((result: string) => typeof result !== 'undefined')
    )
  })

  const ContractWithCustomError = (str: string, start: number, end: number) => ({
    post: conditions(
      check((result: string) => typeof result !== 'undefined', 'must return a value')
    )
  })

  const SliceWithContract = Sign(Slice, Contract)
  const WrongWithContract = Sign(Wrong, Contract)
  const WrongWithContractWithCustomError = Sign(Wrong, ContractWithCustomError)

  it('should have the same result as original function', () => {
    expect(SliceWithContract('test', 0, 2)).toBe(Slice('test', 0, 2))
  })

  it('should return the result if the condition IS satisfied', () => {
    expect(SliceWithContract('test', 0, 2)).toBe('te')
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => WrongWithContract('')).toThrow('Postcondition fails')
  })

  it('should throw an custom error if condition is NOT satisfied', () => {
    expect(() => WrongWithContractWithCustomError('')).toThrow('must return a value')
  })
})

describe('when function has a rescue set', () => {

  function Wrong(str: string) {
    if (str === 'error') {
      throw new Error('body error')
    }
    return undefined
  }

  const Contract = (str: string, start: number, end: number) => ({
    pre: conditions(
      check(() => str.length > 0, 'pre error')
    ),
    post: conditions(
      check((result: string) => typeof result !== 'undefined', 'post error')
    ),
    rescue: (error: Error) => 'Something when wrong: ' + error
  })

  const WrongWithContract = Sign(Wrong, Contract)

  it('should catch precondition failures', () => {
    expect(WrongWithContract('')).toBe('Something when wrong: Error: pre error')
  })
  it('should catch postcondition failures', () => {
    expect(WrongWithContract('test')).toBe('Something when wrong: Error: post error')
  })
  it('should catch function\'s body failures', () => {
    expect(WrongWithContract('error')).toBe('Something when wrong: Error: body error')
  })
})

describe('when class constructor has precondition set', () => {

  const TestClassContract = {
    constructor: (int: number) => ({
      pre: conditions(
        check(() => int > 5)
      )
    })
  }

  const TestClassContractWithCustomError = {
    constructor: (int: number) => ({
      pre: conditions(
        check(() => int > 5, 'should be more than 5')
      )
    })
  }


  @SignClass(TestClassContract)
  class TestClass extends BaseClass { }

  @SignClass(TestClassContractWithCustomError)
  class TestCustomClass extends BaseClass { }

  it('should instantiate the class if condition IS satisfied', () => {
    const instance = new TestClass(6)
    expect(instance).toBeDefined()
    expect(instance.data).toBe(6)
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => {
      const instance = new TestClass(0)
    }).toThrow(PRE_CLASS_ERROR)
  })

  it('should throw an custom error if condition is NOT satisfied', () => {
    expect(() => {
      const instance = new TestCustomClass(0)
    }).toThrow('should be more than 5')
  })
})


describe('when class constructor has postcondition set', () => {

  const TestClassContract = {
    constructor: (int: number) => ({
      post: conditions(
        check((instance: TestClass) => instance.data > 3)
      )
    })
  }

  const TestClassContractWithCustomError = {
    constructor: (int: number) => ({
      post: conditions(
        check((instance: TestClass) => instance.data > 3, 'custom error message')
      )
    })
  }

  @SignClass(TestClassContract)
  class TestClass extends BaseClass { }

  @SignClass(TestClassContractWithCustomError)
  class TestCustomClass extends BaseClass { }

  it('should instantiate the class if condition IS satisfied', () => {
    const instance = new TestClass(6)
    expect(instance).toBeDefined()
    expect(instance.data).toBe(6)
  })

  it('should throw an error if condition is NOT satisfied', () => {
    expect(() => {
      const instance = new TestClass(3)
    }).toThrow(POST_CLASS_ERROR)
  })

  it('should throw an custom error if condition is NOT satisfied', () => {
    expect(() => {
      const instance = new TestCustomClass(3)
    }).toThrow('custom error message')
  })
})

describe('when class field has an invariant set', () => {
  const TestContract = {
    data: invariant((value: number, old: number) => value < 10)
  }

  @SignClass(TestContract)
  class TestClass extends BaseClass { }

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
      instance.data = 11
    }).toThrow('Prop data is invalid')
  })
})

describe('when a class method has a precondition', () => {

  const TestContract = {
    setData: (value: number) => ({
      pre: conditions(check(() => value !== undefined))
    }),
    increment: (amount: number) => ({
      pre: conditions(check((instance: TestClass) => instance.data > 4))
    })


  }

  @SignClass(TestContract)
  class TestClass extends BaseClass { }


  it('should run if precondition IS satisfied', () => {
    const instance = new TestClass(3)
    expect(instance.data).toBe(3)
    instance.setData(4)
    expect(instance.data).toBe(4)
  })
  it('should run if precondition is NOT satisfied', () => {
    expect(() => {
      const instance = new TestClass(3)
      instance.setData(undefined as any)
    }).toThrow(PRE_METHOD_ERROR)
  })
  it('should run if precondition 2 is NOT satisfied', () => {
    expect(() => {
      const instance = new TestClass(3)
      instance.increment(3)
    }).toThrow(PRE_METHOD_ERROR)
  })
})

describe('when a class method has a postcondition', () => {


  const TestContract = {
    setData: (value: number) => ({
      post: conditions(check((result: number) => result !== undefined))
    }),
    increment: (amount: number) => ({
      post: conditions(
        check((result: string, instance: TestClass) =>
          result === ('Data: ' + String(instance.data)) && instance.data <= 6
        )
      )
    })
  }

  @SignClass(TestContract)
  class TestClass extends BaseClass { }

  it('should run if precondition IS satisfied', () => {
    const instance = new TestClass(5)
    expect(instance.data).toBe(5)
    instance.increment(1)
    expect(instance.data).toBe(6)
  })
  it('should run if precondition is NOT satisfied', () => {
    expect(() => {
      const instance = new TestClass(5)
      instance.increment(3)
    }).toThrow(POST_METHOD_ERROR)
  })
})

describe('when using isRequired', () => {

  const Contract = (str: string, start: number, end: number) => ({
    pre: conditions(isRequired(str, start, end))
  })
  const Test = Sign(Slice, Contract)

  it('should run the function', () => {
    expect(Test('test', 0, 2)).toBe('te')
  });
  it('should throw an error', () => {
    expect(() => {
      Test('test')
    }).toThrow(IS_REQUIRED_ERROR)
  })
})


describe('when using isRange', () => {

  const Contract = (str: string, start: number, end: number) => ({
    pre: conditions(isRange(start, 1, 3))
  })
  const Test = Sign(Slice, Contract)

  it('should run the function', () => {
    expect(Test('test', 1, 3)).toBe('es')
    expect(Test('testing', 3, 7)).toBe('ting')
  });

  it('should throw an error if is less than min', () => {
    expect(() => {
      const r = Test('test', 0, 3)
    }).toThrow(IS_RANGE_ERROR)
  })

  it('should throw an error if is more than max', () => {
    expect(() => {
      Test('test', 4, 3)
    }).toThrow(IS_RANGE_ERROR)
  })
})


// Helpers
// Object
// React

