'use strict';
const request = require('request');
const queryString = require('querystring');
const VError = require('verror');
const EventEmitter = require('events');
const util = require('util');
const WS = require('ws');
const helper = require('./helper');
const Replyer = require('./replyer');

const SlackBot = function (token) {
  EventEmitter.call(this);
  this.token = token;
  this.reconnectCount = 0;
  this.middleware = [];

  this.sendInterval = setInterval(this.sendMessages.bind(this), 1000);
};

//  Inherit EventEmitter Prototype
util.inherits(SlackBot, EventEmitter);

// Slack Real Time Messaging API Endpoint
SlackBot.prototype.rtmApiUrl = 'https://slack.com/api/rtm.start';
SlackBot.prototype.startRtm = function (options) {
  options = options || {};

  this.reconnect = options.reconnect || this.reconnect;
  this.reconnectionInterval = options.reconnectionInterval || this.reconnectionInterval;

  let rtmUrl = this.rtmApiUrl + '?' + queryString.stringify({token: this.token});

  // Get WebSocket Url
  request.get(rtmUrl, (err, res, body) => {
    if (err) {
      let error = new VError(err, 'Slack rtm API call failed');
      this.emit('error', error);
      if (this.reconnect) {
        this.tryReconnect();
      } else {
        clearInterval(this.sendInterval);
      }
      return;
    }
    try {
      let slackMetadata = JSON.parse(body);
      if (!slackMetadata.ok) {
        let error = new VError(slackMetadata.error, 'Slack returned error message');
        this.emit('error', error);
        clearInterval(this.sendInterval);
        return;
      }
      this.metadata = slackMetadata;
      return this.connectWebSocket(this.metadata.url);
    } catch (e) {
      let error = new VError(e, 'JSON parse failed');
      this.emit('error', error);
      if (this.reconnect) {
        this.tryReconnect();
      } else {
        clearInterval(this.sendInterval);
      }
      return;
    }
  });
};

SlackBot.prototype.metadata = {};
SlackBot.prototype.connectWebSocket = function (url) {
  let slack = this.slackWS = new WS(url);
  slack.on('message', (msg) => {
    try {
      msg = JSON.parse(msg);
    } catch (e) {
      return this.emit(new VError(e, 'JSON parse failed'));
    }

    // Get message type
    let type = msg.type;
    delete msg.type;
    // Emit message to SlackBot by Slack message type
    this.emit(type, msg);
    // Slack text message
    if (type === 'message') this.notifyObserves(msg);
  });

  slack.on('error', (err) => {
    this.emit('error', err);
  });

  slack.on('close', (err) => {
    this.emit('disconected', err || null);
    if (this.reconnect) this.tryReconnect();
  });

  slack.on('open', () => {
    this.detectDesconnection();
  });
};

// Getters fot metadata object
Object.defineProperties(SlackBot.prototype, {
  'id': {
    get: function () { return this.metadata.self.id; }
  },
  'name': {
    get: function () { return this.metadata.self.name; }
  },
  'teamId': {
    get: function () { return this.metadata.team.id; }
  },
  'teamName': {
    get: function () { return this.metadata.team.name; }
  }
});

SlackBot.prototype.listen = function (listen, events, cb) {
  // Validate listen arguments if false throw
  helper.validateListen.apply(this, Array.prototype.slice.call(arguments, 0));
  if (!cb) {
    cb = events;
    events = undefined;
  }

  this.middleware.push({listen, events, cb});
};

SlackBot.prototype.notifyObserves = function (message) {
  if (this.middleware.length === 0) {
    return;
  }

  if (message.subtype === 'message_changed') {
    message.text = message.message.text;
  }

  let event = helper.parseEvent.call(this, message);
  let text = message.text;

  let bot = new Replyer(message.channel, this);

  for (let i = 0; i < this.middleware.length; i++) {
    if (this.middleware[i].events && this.middleware[i].events.indexOf(event) === -1) continue;
    if (!helper.hasMatch(this.middleware[i].listen, text)) continue;
    this.middleware[i].cb(bot);
  }
};

SlackBot.prototype.reconnect = false;
SlackBot.prototype.reconnectionInterval = 3000;

SlackBot.prototype.tryReconnect = function () {
  this.reconnectCount++;
  this.slackWS.removeAllListeners();
  this.emit('reconnecting', util.format('reconnecting: %s attempt in %s seconds', this.reconnectCount, this.reconnectionInterval));
  setTimeout(this.startRtm.bind(this), this.reconnectionInterval);
};

SlackBot.prototype.detectDesconnection = function () {
  this.on('pong', function (msg) {
    clearTimeout(this.timeout);
  });

  let pingInterval = setInterval(function (params) {
    let pinger = new Replyer(null, this);
    pinger.ping();
    this.timeout = setTimeout(function () {
      this.emit('disconnected');
      clearInterval(pingInterval);
      if (this.reconnect) {
        return this.tryReconnect();
      }
      process.exit();
    }.bind(this), 10000);
  }.bind(this), 10000);
};

SlackBot.prototype.queue = [];
SlackBot.prototype.sendMessages = function () {
  if (this.queue.length === 0) return;
  let message = this.queue.shift();
  this.slackWS.send(message);
};

module.exports = SlackBot;
