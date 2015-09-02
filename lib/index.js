'use strict';

/*
Author: Scott Beaudreau
Date:   09/01/2015
*/


var _ = require('underscore');
var spoken = require('spoken-numbers');


// Class: FullContactConnectorService
// Purpose: Static class for managing dashboard API interactions.
function GrammarGenerator() {
  //(function constructor(self) {})(this);
}
GrammarGenerator.prototype.normalizeTextValue = function (value) {
  return (value + '').toLocaleLowerCase().trim();
};
GrammarGenerator.prototype.replaceTopicReferenceWithValue = function (model, topicReference, value) {
  var self = this;
  var topicReferenceToken = '{' + topicReference + '}';
  var valueToken = '{' + self.normalizeTextValue(value) + ' | ' + topicReference + '}';
  return model.replace(topicReferenceToken, valueToken);
};
GrammarGenerator.prototype.getNextTopicReference = function (model) {
  return this.getTopicReferences(model)[0];
};
GrammarGenerator.prototype.getTopicReferences = function (model) {
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
    } else {
      if (char === '}') {
        stop = i - 1;
        if ((stop - start) > 0) {
          var topic = model.slice(start, stop + 1);
          if (topic.indexOf('|') < 0) {
            topics.push(topic);
          }
          isCapturing = false;
        }
      }
    }
  }
  return topics;
};
GrammarGenerator.prototype.generateModels = function (models, topics) {
  var self = this;
  var results = [];
  var modelArray = _.isArray(models) ? models : [models];
  _.each(modelArray, function (model) {
    self.generateModel(results, model, topics);
  });
  return results;
};
GrammarGenerator.prototype.generateModel = function (results, model, topics) {
  var self = this;
  var num;
  var formattedNumber;
  var count;
  var item;

  var topicReference = self.getNextTopicReference(model);
  if (topicReference) {
    var topicCategory = topics[topicReference];
    if (topicCategory) {
      if (topicCategory.type === 'dictionary') {
        count = topicCategory.count || 0;
        var prob = count ? (count / ((topicCategory.entries || []).length || 1)) : 1.0;
        _.each(topicCategory.entries, function (topic) {
          var topicValues = _.isObject(topic) ? (_.isArray(topic) ? topic : (_.isArray(topic.values) ? topic.values : [topic])) : [topic];
          _.each(topicValues, function (topicValue) {
            if (prob >= Math.random()) {
              item = self.replaceTopicReferenceWithValue(model, topicReference, topicValue);
              self.generateModel(results, item, topics);
            }
          });
        });
      } else if (topicCategory.type === 'number') {
        var min = topicCategory.min || 0;
        var max = topicCategory.max || 9;
        var step = topicCategory.step || 1;
        count = topicCategory.count || 0;
        var format = topicCategory.format || 'decimal';
        if (count > 0) {
          var randomNumbers = [];
          for (var i = 0; i < count; i++) {
            num = Math.floor((Math.random() * (max - min))) + min;
            if (randomNumbers.indexOf(num) < 0) {
              randomNumbers.push(num);
              if (format === 'spelled') {
                formattedNumber = spoken.toSpoken(num, 'dd:o');
              } else {
                formattedNumber = num;
              }
              item = self.replaceTopicReferenceWithValue(model, topicReference, formattedNumber);
              self.generateModel(results, item, topics);
            }
          }
        } else {
          for (num = min; num <= max; num += step) {
            if (format === 'spelled') {
              formattedNumber = spoken.toSpoken(num, 'dd:o');
            } else {
              formattedNumber = num;
            }
            item = self.replaceTopicReferenceWithValue(model, topicReference, formattedNumber);
            self.generateModel(results, item, topics);
          }
        }
      }
    }
  } else {
    results.push(model);
  }
};

module.exports = {
  GrammarGenerator: GrammarGenerator
};
