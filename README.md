# alexa-grammar [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
- - -
> Utilities and framework code for building valid grammars and skill kits for Amazon&#39;s Alexa voice agent service.


## Install

```sh
$ npm install --save alexa-grammar
```


## Usage

```js
var alexaGrammar = require('alexa-grammar');

var grammarGenerator = new alexaGrammar.GrammarGenerator();
var topics = {
  airline: {
    type: 'dictionary',
    count: 100,
    entries: [
      { id: 'aal', values: ['aa', 'american airlines', 'american'] },
      { id: 'dal', values: ['dl', 'delta airlines', 'delta'] },
      { id: 'ual', values: ['ua', 'united airlines', 'united'] },
      { id: 'asa', values: ['as', 'alaska airlines', 'alaska'] }
    ]
  }
};
var results = grammarGenerator.generateModels('Find flights from {airline} ', topics);


```

## License
This code is licensed under the MIT license for [Scott Beaudreau](). For more
information, please refer to the [LICENSE](/LICENSE) file.


[npm-image]: https://badge.fury.io/js/alexa-grammar.svg
[npm-url]: https://npmjs.org/package/alexa-grammar
[travis-image]: https://travis-ci.org/scottbea/alexa-grammar.svg?branch=master
[travis-url]: https://travis-ci.org/scottbea/alexa-grammar
[daviddm-image]: https://david-dm.org/scottbea/alexa-grammar.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/scottbea/alexa-grammar
[coveralls-image]: https://coveralls.io/repos/scottbea/alexa-grammar/badge.svg
[coveralls-url]: https://coveralls.io/r/scottbea/alexa-grammar
