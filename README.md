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