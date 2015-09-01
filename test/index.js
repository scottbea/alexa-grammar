'use strict';

var alexaGrammar = require('../lib');
var _ = require('underscore');
var assert = require('assert');
//var util = require('util');


describe('alexa-grammar', function () {
  var grammarGenerator = null;

  describe('alexa-grammar.library', function () {
    it('should have unit test!', function () {
      grammarGenerator = new alexaGrammar.GrammarGenerator();
    });
  });
  describe('alexa-grammar.basic', function () {
    it('should be able to instantiate the helper object', function () {
      assert(grammarGenerator !== null, 'We should have a valid object');
    });
    it('should support generating a grammar with a literal model and no topics', function () {
      var results = grammarGenerator.generateModels('Mary had a little lamb');
      assert(results.length === 1, 'There should be 1 results');
    });
    it('should support generating a grammar with a literal model', function () {
      var results = grammarGenerator.generateModels('Mary had a little lamb', []);
      assert(results.length === 1, 'There should be 1 results');
    });
    it('should support generating a grammar with an array of literal models', function () {
      var results = grammarGenerator.generateModels(['Mary had a little lamb', 'Whose fleece was white as snow'], []);
      assert(results.length === 2, 'There should be 2 results');
    });
    it('should support generating a grammar with an array of dictionary models and a single topic', function () {
      var results = grammarGenerator.generateModels(['{name} had a little lamb', 'Everywhere that {name} went the lamb was sure to go'], {name: {type: 'dictionary', entries: ['Mary']}});
      assert(results.length === 2, 'There should be 2 results');
    });
    it('should support generating a grammar with an array of dictionary models and multiple topic entries', function () {
      var results = grammarGenerator.generateModels(['{name} had a little lamb', 'Everywhere that {name} went the lamb was sure to go'], {name: {type: 'dictionary', entries: ['Mary', 'Joseph']}});
      assert(results.length === 4, 'There should be 4 results');
    });
    it('should support generating a grammar with a single model and multiple topic entries', function () {
      var results = grammarGenerator.generateModels('{name} had a little lamb', {name: {type: 'dictionary', entries: ['Mary', 'Joseph']}});
      assert(results.length === 2, 'There should be 2 results');
    });
    it('should support a number with sequencing', function () {
      var topics = {
        number: {type: 'number', min: 0, max: 100, step: 5, format: 'digits'}
      };
      var results = grammarGenerator.generateModels('{number}', topics);
      //console.log(util.inspect(results, {showHidden: true}));
      assert(results.length === 21, 'There have 21 results');
    });
    it('should support a number with sequencing and formatted with spoken form', function () {
      var topics = {
        number: {type: 'number', min: 0, max: 100, step: 2, format: 'spelled'}
      };
      var results = grammarGenerator.generateModels('{number}', topics);
      //console.log(util.inspect(results, {showHidden: true}));
      assert(results.length === 51, 'There have 51 results');
    });
  });
  describe('alexa-grammar.advanced', function () {
    it('should support generating a grammar with a single model and multiple topic entries with multiple surface forms', function () {
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
      assert(results.length === 12, 'There should be 12 results');
    });
    it('should support generating a grammar with multiple dictionary slots with some having multiple surface forms', function () {
      var topics = {
        letter: {type: 'dictionary', entries: ['A', 'B', 'C', 'D', 'E']},
        color: {type: 'dictionary', entries: [{id: 'red', values: ['red', 'roho']}, {id: 'yellow', values: ['yellow']}, {id: 'blue', values: ['blue']}]}
      };

      var models = {utterances: [
        '{color}{letter}'
      ]};
      var results = grammarGenerator.generateModels(models.utterances, topics);
      assert(results.length === 20, 'There should be 20 results');
    });
    it('should support generating a grammar with dictionary and number slots', function () {
      var broker = {airlinesDB: { aal: ['aa', 'american airlines', 'american'] }};
      var airlineEntries = _.map(broker.airlinesDB, function (airline, key) {
        return {id: key, values: airline};
      });

      var topics = {
        airline: {type: 'dictionary', count: 100, entries: airlineEntries},
        flightNumber: {type: 'number', min: 10, max: 2000, count: 3, format: 'spelled'}
      };

      var models = {flights: [
        'what is the status of {airline} {flightNumber}'
      ]};

      var results = grammarGenerator.generateModels(models.flights, topics);
      assert(results.length === 9, 'There should be 9 results total');
    });
    it('should support generating a grammar with multiple models having both dictionary and number slots with multiple topics', function () {
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
        },
        flightNumber: {type: 'number', min: 24, max: 2000, step: 25, format: 'spelled'}
      };

      var models = {flights: [
        '{airline} {flightNumber}',
        '{airline} flight # {flightNumber}',
        '{flightNumber} on {airline}'
      ]};

      var results = grammarGenerator.generateModels(models.flights, topics);
      //console.log(util.inspect(results, {showHidden: true}));
      assert(results.length === 2880, 'There should be 2880 results total');
    });
    it('should support generating a grammar with 3 different number slots using sampling for each', function () {
      var topics = {
        areaCode: {type: 'number', min: 100, max: 999, count: 10, format: 'digits'},
        prefix: {type: 'number', min: 100, max: 999, count: 10, format: 'digits'},
        suffix: {type: 'number', min: 1000, max: 9999, count: 100, format: 'digits'}
      };

      var results = grammarGenerator.generateModels('{areaCode}-{prefix}-{suffix}', topics);
      //console.log(util.inspect(results, {showHidden: true}));
      assert(results.length > 9000, 'There should be over 9000 results (some are duplicates)');
    });
  });
});
