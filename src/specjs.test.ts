/* eslint-env jest */

import { bindSpec } from "./specjs"


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
