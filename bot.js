'use strict';
const Bot = require('./src/SlackBot.js');
const VError = require('verror');

let token = process.env.token;
if (!token) {
  throw new VError('Error: Missing \'token\' in environment. Try to run: "export token=<token_string>"');
}

const SlackBot = new Bot(token);

SlackBot.startRtm();

SlackBot.on('error', (err) => {
  console.log('error', err.message);
});

SlackBot.on('reconnecting', (err) => {
  console.log('reconnecting', err);
});

SlackBot.on('hello', () => {
  console.log('connected');
});

SlackBot.on('disconected', () => {
  console.log('disconected');
});
