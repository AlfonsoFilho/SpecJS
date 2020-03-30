const SpecJS = require('@alfonsofilho/specjs')

const ExampleContract = {
  pre(a) {
    return typeof a === 'number'
  }
}

function Example(a) {
  return a + 1
}

const ExampleWithContract = SpecJS.bindSpec(Example, ExampleContract)

const result = ExampleWithContract(3)

console.log('Result', result)
