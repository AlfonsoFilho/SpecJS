# SpecJS
> Design by contract javascript library

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.com/AlfonsoFilho/specjs.svg?branch=master)](https://travis-ci.com/AlfonsoFilho/specjs)
[![npm version](https://badge.fury.io/js/%40alfonsofilho%2Fspecjs.svg)](https://badge.fury.io/js/%40alfonsofilho%2Fspecjs)
[![Try match-toy on RunKit](https://badge.runkitcdn.com/%40alfonsofilho%2Fspecjs.svg)](https://npm.runkit.com/%40alfonsofilho%2Fspecjs)

> **THIS LIBRARY STILL IN EARLY DEVELOPMENT, IT'S NOT STABLE, AND USAGE IN PRODUCTION IS NOT RECOMMENDED YET.**

[SpecJS](https://github.com/AlfonsoFilho/specjs#readme) is a tiny (≈0.7KB) to implement design by contract in Javascript and Typescript projects. To start learning how to use the library, take a look at the [usage section](#Usage). Afterward you'll find more information in the [examples](./examples) and [reading the tests](./src).

[Try it now](https://npm.runkit.com/%40alfonsofilho%2Fspecjs).


## Installation
#### From NPM
```sh
$ npm install @alfonsofilho/specjs --save
```
Or yarn:
```sh
$ yarn add @alfonsofilho/specjs
```
Then import/require the module.
```javascript
const SpecJS = require('@alfonsofilho/specjs');
// or
import { bindSpec } from '@alfonsofilho/specjs';
```

#### From CDN
Place the snippet into your html:
```html
<script src="https://unpkg.com/@alfonsofilho/specjs@0.0.1/dist/specjs.umd.js"></script>
```

This file is a bundle in the [UMD](https://github.com/umdjs/umd) format. In the browser's environments, the module name is in available in `window.SpecJS`.


See more in [examples](./examples).

## Usage
Most basic usage:
```javascript
// TBD
```

### Built with
- [Typescript](https://www.typescriptlang.org/)
- [Jest](https://facebook.github.io/jest/)
- [Microbundle](https://github.com/developit/microbundle)

## Other nice JavaScript libraries:
There are many interesting projects out there implementing design by contract. [Search more in NPM](https://www.npmjs.com/search?q=design%20by%20contract).

## Learn more about design by contract
- https://en.wikipedia.org/wiki/Design_by_contract
- https://www.sciencedirect.com/topics/computer-science/design-by-contract
- https://www.eiffel.org/doc/solutions/Design_by_Contract_and_Assertions
- https://www.eiffel.com/values/design-by-contract/
- https://www.leadingagile.com/2018/05/design-by-contract-part-one/
- https://www.microsoft.com/en-us/research/project/spec/

## Contributing
- Improving or correcting the documentation.
- Translating.
- Finding bugs
- Sharing this project.
- PRs are very welcome.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog
See [CHANGELOG](CHANGELOG.md) file for details.
