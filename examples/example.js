let SpecJS = require('../dist/specjs');

const ExampleContract = {
  pre(a) {
    return typeof a === 'number'
  }
}

function Example(a) {
  return a + 1
}

const ExampleWithContract = SpecJS.bindSpec(Example, ExampleContract)

r = ExampleWithContract(3)

r
