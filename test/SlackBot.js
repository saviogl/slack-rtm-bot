'use strict';
const assert = require('assert');
const SlackBot = require('../');

describe('Basic Tests', () => {
  it('should have a slack token', () => {
    assert.ok(process.env.token, 'Missing slack token \"process.env.token\"');
  });

  it('shold have a SlackBot instance', () => {
    let slackBot = new SlackBot(process.env.token);
    assert.ok(slackBot);
    assert.ok(slackBot.startRtm, 'Missing startRtm function');
  });
});

describe('SlackBot', () => {
  it('should start connection', (done) => {
    let slackBot = new SlackBot(process.env.token);
    slackBot.startRtm();
    slackBot.on('hello', () => {
      done();
    });
  });

  it('should fail with false token', (done) => {
    let slackBot = new SlackBot('false');
    slackBot.startRtm();
    slackBot.on('error', (error) => {
      assert.ok(error);
      assert.equal(error.message, 'invalid_auth');
      done();
    });
  });
});