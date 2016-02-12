'use strict';
const Bot = require( './src/SlackBot.js');
const VError = require( 'verror');

// if (!process.env.token) {
//     console.log('Error: Missing specific token in environment');
//     process.exit(1);
// }

const SlackBot = new Bot('xoxb-21223842357-Y4PJeuIUxy2mMDtygEZcRrHF');
SlackBot.startRtm({reconnect: true});
SlackBot.on('error', (err) => {
  console.log('error', err.message);
});

SlackBot.on('recconecting', (err) => {
  console.log('error', err.message);
});

SlackBot.on('hello', () => {
    console.log('connected');
    console.log(SlackBot.id);
    console.log(SlackBot.name);
});

SlackBot.on('disconected', () => {
    console.log('disconected')
})

SlackBot.on('message', (msg) => {
    console.log('msg', msg);
});

SlackBot.on('ping', () => {
    console.log('ping');
});