'use strict';

/*
Author: Scott Beaudreau
Date:   09/01/2015
*/

var _ = require('underscore');
var spoken = require('spoken-numbers');


var normalizeTextValue = function (value) {
  return (value + '').toLocaleLowerCase().trim();
};
var replaceTopicReferenceWithValue = function (model, topicReference, value, isFinal) {
  var topicReferenceToken = '{' + (isFinal ? '* | ' : '') + topicReference + '}';
  var valueToken = '{' + normalizeTextValue(value) + ' | ' + topicReference + '}';
  return model.replace(topicReferenceToken, valueToken);
};
var getTopicReferences = function (model, isFinal) {
  var topics = [];
  var isCapturing = false;
  var start = 0;
  var stop = 0;
  for (var i = 0; i < model.length; i++) {
    var char = model[i];
    if (!isCapturing) {
      if (char === '{') {
        isCapturing = true;
        start = i + 1;
      }
    }
    else {
      if (char === '}') {
        stop = i - 1;
        if ((stop - start) > 0) {
          var topic = model.slice(start, stop + 1);
          if (topic.indexOf('|') < 0) {
            topics.push(topic);
          }
          else if (isFinal && (topic.indexOf('*') >= 0)) {
            var actualTopic = topic.split('|').pop().trim();
            topics.push(actualTopic);
          }
          isCapturing = false;
        }
      }
    }
  }
  return topics;
};
var getNextTopicReference = function (model, isFinal) {
  return getTopicReferences(model, isFinal)[0];
};
var getOptionalElements = function (model) {
  var options = [];
  var isCapturing = false;
  var start = 0;
  var depth = 0;
  var stop = 0;
  for (var i = 0; i < model.length; i++) {
    var char = model[i];
    if (!isCapturing) {
      if (char === '[') {
        isCapturing = true;
        start = i + 1;
        depth++;
      }
    } else {
      if (char === '[') {
        depth++;
      } else if (char === ']') {
        depth--;
        if (depth <= 0) {
          stop = i - 1;
          if ((stop - start) > 0) {
            var option = model.slice(start, stop + 1);
            options.push(option);
            isCapturing = false;
          }
        }
      }
    }
  }
  return options;
};
var getNextOptionalElement = function (model) {
  return getOptionalElements(model)[0];
};
var replaceOptionWithValue = function (model, optionalReference, value) {
  var referenceToken = '[' + optionalReference + ']';
  return model.replace(referenceToken, value).replace(/ {2}/g, ' ');
};
var replaceChoiceWithValue = function (model, choiceReference, value) {
  var referenceToken = '<' + choiceReference + '>';
  return model.replace(referenceToken, value).replace(/ {2}/g, ' ');
};
var getChoiceElements = function (model) {
  var options = [];
  var isCapturing = false;
  var start = 0;
  var depth = 0;
  var stop = 0;
  for (var i = 0; i < model.length; i++) {
    var char = model[i];
    if (!isCapturing) {
      if (char === '<') {
        isCapturing = true;
        start = i + 1;
        depth++;
      }
    }
    else {
      if (char === '<') {
        depth++;
      } else if (char === '>') {
        depth--;
        if (depth <= 0) {
          stop = i - 1;
          if ((stop - start) > 0) {
            var option = model.slice(start, stop + 1);
            options.push(option);
            isCapturing = false;
          }
        }
      }
    }
  }
  return options;
};
var getNextChoiceElement = function (model) {
  return getChoiceElements(model)[0];
};
var parseChoices = function (model) {
  var finalChoices = [];
  var embeddedChoiceElements = getChoiceElements(model);
  var tempModel = model;
  var i;
  var key;

  for (i = 0; i < embeddedChoiceElements.length; i++) {
    tempModel = replaceChoiceWithValue(tempModel, embeddedChoiceElements[i], '(%1)');
  }
  var choices = _.map(tempModel.split('|'), function (s) {
    return s.trim();
  });

  _.each(choices, function (choice) {
    var finalChoice = choice;
    for (i = 0; i < embeddedChoiceElements.length; i++) {
      key = '(%' + i + ')';
      if (finalChoice.indexOf(key) >= 0) {
        finalChoice = finalChoice.replace(key, '<' + embeddedChoiceElements[i] + '>');
      }
    }
    finalChoices.push(finalChoice);
  });

  return finalChoices;
};
var bindModel = function (results, model, topics, isFinal) {
  var num;
  var formattedNumber;
  var count;
  var item;
  var i;

  var topicReference = getNextTopicReference(model);
  if (topicReference) {
    var topicReferenceKey = (topicReference[0] === '{') ? topicReference.slice(1, topicReference.length - 1) : topicReference;
    var topicCategory = (topics || {})[topicReferenceKey];
    if (topicCategory) {
      if (topicCategory.random) {
        count = topicCategory.count || 1;
        for (i = 0; i < count; i++) {
          item = replaceTopicReferenceWithValue(model, topicReference, '*');
          bindModel(results, item, topics, isFinal);
          //results.push(item);
        }
      }
      else {
        if (topicCategory.type === 'dictionary') {
          count = topicCategory.count || 0;
          var prob = count ? (count / ((topicCategory.entries || []).length || 1)) : 1.0;
          _.each(topicCategory.entries, function (topic) {
            var topicValues = _.isObject(topic) ? (_.isArray(topic) ? topic : (_.isArray(topic.values) ? topic.values : [topic])) : [topic];
            _.each(topicValues, function (topicValue) {
              if (prob >= Math.random()) {
                item = replaceTopicReferenceWithValue(model, topicReference, topicValue);
                bindModel(results, item, topics, isFinal);
              }
            });
          });
        }
        else if (topicCategory.type === 'number') {
          var min = topicCategory.min || 0;
          var max = topicCategory.max || 9;
          var step = topicCategory.step || 1;
          count = topicCategory.count || 0;
          var format = topicCategory.format || 'decimal';
          if (count > 0) {
            var randomNumbers = [];
            for (i = 0; i < count; i++) {
              num = Math.floor((Math.random() * (max - min))) + min;
              if (randomNumbers.indexOf(num) < 0) {
                randomNumbers.push(num);
                if (format === 'spelled') {
                  formattedNumber = spoken.toSpoken(num, 'dd:o');
                }
                else {
                  formattedNumber = num;
                }
                item = replaceTopicReferenceWithValue(model, topicReference, formattedNumber);
                bindModel(results, item, topics, isFinal);
              }
            }
          }
          else {
            for (num = min; num <= max; num += step) {
              if (format === 'spelled') {
                formattedNumber = spoken.toSpoken(num, 'dd:o');
              }
              else {
                formattedNumber = num;
              }
              item = replaceTopicReferenceWithValue(model, topicReference, formattedNumber);
              bindModel(results, item, topics, isFinal);
            }
          }
        }
      }
    }
  }
  else {
    results.push(model);
  }
};
var bindModels = function (models, topics, isFinal) {
  var results = [];
  var modelArray = _.isArray(models) ? models : [models];
  _.each(modelArray, function (model) {
    bindModel(results, model, topics, isFinal);
  });
  return results;
};
var postProcessModel = function (results, model, topics) {
  var num;
  var formattedNumber;
  var item;

  var topicReference = getNextTopicReference(model, true);
  if (topicReference) {
    var topicReferenceKey = topicReference;
    var topicCategory = (topics || {})[topicReferenceKey];
    if (topicCategory) {
      if (topicCategory.type === 'dictionary') {
        var topicIndex = Math.floor((Math.random() * topicCategory.entries.length));
        var topic = topicCategory.entries[topicIndex];
        var topicValues = _.isObject(topic) ? (_.isArray(topic) ? topic : (_.isArray(topic.values) ? topic.values : [topic])) : [topic];
        var valueIndex = Math.floor((Math.random() * topicValues.length));
        var topicValue = topicValues[valueIndex];
        item = replaceTopicReferenceWithValue(model, topicReference, topicValue, true);
        //results.push(item);
        postProcessModel(results, item, topics);
      }
      else if (topicCategory.type === 'number') {
        var min = topicCategory.min || 0;
        var max = topicCategory.max || 9;
        var format = topicCategory.format || 'decimal';
        num = Math.floor((Math.random() * (max - min))) + min;
        if (format === 'spelled') {
          formattedNumber = spoken.toSpoken(num, 'dd:o');
        }
        else {
          formattedNumber = num;
        }
        item = replaceTopicReferenceWithValue(model, topicReference, formattedNumber, true);
        //console.log('$: %s\n%s', topicReference, item);
        //results.push(item);
        postProcessModel(results, item, topics);
      }
    }
  }
  else {
    results.push(model);
  }
};
var postProcessModels = function (models, topics) {
  var results = [];
  var modelArray = _.isArray(models) ? models : [models];
  _.each(modelArray, function (model) {
    postProcessModel(results, model, topics);
  });
  return results;
};
var expandModel = function (results, model) {
  var option = getNextOptionalElement(model);
  if (option) {
    var itemDisabled = replaceOptionWithValue(model, option, '').trim();
    var itemEnabled = replaceOptionWithValue(model, option, option).trim();
    expandModel(results, itemDisabled);
    expandModel(results, itemEnabled);
  } else {
    var choices = getNextChoiceElement(model);
    if (choices) {
      var choiceArray = parseChoices(choices);
      _.each(choiceArray, function (choice) {
        var item = replaceChoiceWithValue(model, choices, choice).trim();
        expandModel(results, item);
      });
    } else {
      results.push(model);
    }
  }
};
var expandModels = function (models) {
  var results = [];
  var modelArray = _.isArray(models) ? models : [models];
  _.each(modelArray, function (model) {
    expandModel(results, model);
  });
  return results;
};
var compile = function (models, topics) {
  var expandedModels = expandModels(models);
  var boundModels = bindModels(expandedModels, topics);
  return postProcessModels(boundModels, topics);
};

module.exports = {
  compile: compile
};

/*

var topics = {
  airline: {
    type: 'dictionary',
    count: 3,
    random: true,
    entries: [
      { id: 'aal', values: ['aa', 'american airlines', 'american'] },
      { id: 'dal', values: ['dl', 'delta airlines', 'delta'] },
      { id: 'ual', values: ['ua', 'united airlines', 'united'] },
      { id: 'asa', values: ['as', 'alaska airlines', 'alaska'] }
    ]
  },
  airports: {
    type: 'dictionary',
    count: 2,
    random: true,
    entries: [
      { id: 'dfw', values: ['dfw'] },
      { id: 'sea', values: ['sea'] },
      { id: 'sfo', values: ['sfo'] },
      { id: 'jfk', values: ['jfk'] }
    ]
  },
  flightNumber: {type: 'number', min: 120, max: 320, step: 100, count: 10, random: true, format: 'digits'}
};

var models = {flights: [
  //'{flightNumber} at {airports} on {airline}'
  //'{airline} on {airports}'
  //'{flightNumber} on {airline}'
  '{airports} {flightNumber} {airline}'
  //'{airline} {flightNumber}'
]};

var results = compile(models.flights, topics);
console.log(require('util').inspect(results, {showHidden: true}));
*/
