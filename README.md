## Installation

Clone this repository and install it's dependencies.

```bash
git clone https://github.com/saviogl/slack-rtm-bot.git && npm install
```

## Sample Bot

Go to Slack and get a Bot token at http://my.slack.com/services/new/bot, and export the token to an environment variable 'token'
```bash
export token=BOTTOKEN
```

Execute the command
```bash
node bot.js
```

This bot will listen to some Slack events and console.log some information received.
It will also reply to any messages which contain the text 'hello' on any channel that the bot is in, and reply with the time if mentioned directed,
or talked directed with the text 'what time is it'

## SlackBot
Instantiate a new SlackBot passing the Bot token retrieved from Slack

```bash
const Bot = require('./src/SlackBot.js');
const SlackBot = new Bot(TOKEN);
```

To start the connection with the RTM execute the startRTM method

```bash
SlackBot.startRtm({ reconnect: true });
```

If the connection was successfull you will receive an 'hello' event which is Slack acknowledging the connection

```bash
SlackBot.on('hello', () => {
  // Successfull connection
});
```

All the events emited from Slack are parsed and sent to the SlackBot. All Slack events are listed [here](https://api.slack.com/rtm)
```bash
SlackBot.on('hello', () => {
  // Successfull connection
});

SlackBot.on('message', () => {
  // Successfull connection
});

SlackBot.on('user_typing', () => {
  // Successfull connection
});

...
```
### 'listen' method
SlackBot provides a **listen** method which allow you to bind multiple an array of regular expression to match the message text with 
so you can react to specific words/phrases.

```bash
// Listen for the text 'hello' or 'ola' and reply 'Hello you too!'
SlackBot.listen(['hello', 'ola'], (bot) => {
  bot.reply('Hello you too!');
});
```

You can also bind specific message type
```bash
// Listen for the text 'hello', but only if it was a direct message, or someone mentioned the bot in a channel that it is part of
SlackBot.listen(['hello'], ['direct_message', 'direct_mention'], (bot) => {
  bot.reply('Hello you too!');
});
```

The events type are:

direct_message
direct_mention
mention // A mention by @channel or @here
ambient // Any message