import { bindSpec } from '../dist/specjs'
import { Contract, FunctionContract } from '../specjs.types'

const ExampleContract: FunctionContract = {
  pre(a: number) {
    return a > 0 && a < 10
  }
}

function Example(a: number) {
  return a + 1
}

const ExampleWithContract = bindSpec(Example, ExampleContract)

const r = ExampleWithContract(9)
r //?
