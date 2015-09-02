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

## Introduction to Alexa Skills
Alexa, the voice service that powers Echo, provides a set of built-in abilities, or skills, that enable customers to interact with devices in a more intuitive way using voice. 
Examples of these skills include the ability to play music, answer general questions, set an alarm or timer and more. 
With the Alexa Skills Kit, you can easily build and add your own skills to Alexa. 
Customers can access these new skills simply by asking Alexa a question or making a command.

Developers can create their own implementations of Alexa skills. This involves building and packaging an Alexa skill as a configuration and implementing a backend service that interacts based on this definition.

The configuration for an Alexa skill must include the following components to define the voice interface:

An Intent Schema: A JSON structure which declares the set of intents your service can accept and process.
A set of Sample Utterances: A structured text file that connects the intents to likely spoken phrases and containing as many representative phrases as possible.
These inputs are entered in the Interaction Model section of an Alexa skill configuration.

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
