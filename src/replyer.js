'use strict';
const uuid = require('uuid');

const Replyer = function (channel, SlackBot) {
  this.id = uuid.v1();
  this.channel = channel;
  this.slack = SlackBot;
};

Replyer.prototype.reply = function (text) {
  let message = { id: this.id, type: 'message', channel: this.channel, text };
  this.slack.queue.push(JSON.stringify(message));
};

Replyer.prototype.ping = function (text) {
  let message = {id: this.id, type: 'ping'};
  this.slack.slackWS.send(JSON.stringify(message));
};

module.exports = Replyer;
