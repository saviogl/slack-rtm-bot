/*
This is a sample Slack bot built with SlackBot.

To run the bot you'll need a Bot token from slack http://my.slack.com/services/new/bot, and export the variable to 'token'; i.e: export token='mytoken'

# On the command line execute
node bot.js

# When you start RTM connection you get an EventEmitter object which will emit some Slack events that you can listen to

# The same object provides a 'listen' interface which you can pass an array of strings to match 'sponken text' on slack messages and reply to

*/

'use strict';
const Bot = require('./src/SlackBot.js');
const VError = require('verror');

let token = process.env.token;
if (!token) {
  throw new VError('Error: Missing \'token\' in environment. Try to run: "export token=<token_string>"');
}

const SlackBot = new Bot(token);

SlackBot.startRtm();

// Listen for 'error' events
SlackBot.on('error', (err) => {
  console.log('error', err);
});

// Listen for reconnections attempts
SlackBot.on('reconnecting', (err) => {
  console.log('reconnecting', err);
});

// Listen for the Slack 'hello' event
SlackBot.on('hello', () => {
  console.log('connected');
});

// Listen for disconnections event
SlackBot.on('disconnected', () => {
  console.log('disconnected');
});

// Listen for any message
SlackBot.on('message', (msg) => {
  console.log('message', msg);
});

// Listen for the text 'hello' and reply 'Hello you too!'
SlackBot.listen(['hello'], (bot) => {
  bot.reply('Hello you too!');
});

// Listen for the text 'what time is it' and reply with the current time
SlackBot.listen(['what time is it'], ['direct_message', 'direct_mention'], (bot) => {
  bot.reply(new Date().toString());
});
