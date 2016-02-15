'use strict';
const VError = require('verror');
const _ = require('lodash');

exports.parseEvent = function (message) {
  if (message.channel.charAt(0) === 'D') {
    return 'direct_message';
  }

  if (message.text.match(this.id)) {
    return 'direct_mention';
  }

  if (message.text.match('channel|here')) {
    return 'mention';
  }

  return 'ambient';
};

exports.hasMatch = function (listen, text) {
  for (let i = 0; i < listen.length; i++) {
    if (text.match(listen[i])) return true;
  }
  return false;
};

exports.validateListen = function () {
  let args = Array.prototype.slice.call(arguments, 0);
  // Check number of arguments
  if (args.length < 2 || args.length > 3) {
    let err = new VError('Invalid number of arguments');
    err.name = 'RangeError';
    throw err;
  }

    // Check first parameter if it's an array
  if (!_.isArray(args[0])) {
    let err = new VError('Argument \'listen\' must be an array');
    err.propertyName = 'listen';
    err.propertyValue = args[0];
    err.name = 'TypeError';
    throw err;
  }

  if (args.length === 2) {
    // Check second parameter if it's a function (callback function)
    if (!_.isFunction(args[1])) {
      let err = new VError('Argument \'callback\' must be a function');
      err.propertyName = 'callback';
      err.propertyValue = args[1];
      err.name = 'TypeError';
      throw err;
    }
    return;
  }

  // Check second parameter if it's an array
  if (!_.isArray(args[1])) {
    let err = new VError('Argument \'events\' must be an array');
    err.propertyName = 'events';
    err.propertyValue = args[1];
    err.name = 'TypeError';
    throw err;
  }

  // Check third parameter if it's a function (callback function)
  if (!_.isFunction(args[2])) {
    let err = new VError('Argument \'callback\' must be a function');
    err.propertyName = 'callback';
    err.propertyValue = args[2];
    err.name = 'TypeError';
    throw err;
  }
  return;
};
