'use strict';
const request = require('request');
const queryString = require('querystring');
const VError = require('verror');
const EventEmitter = require('events');
const util = require('util');
const WS = require('ws');
const uuid = require('uuid');

const SlackBot = function (token) {
    EventEmitter.call(this);
    this.token = token;
    this.reconnectCount = 0;
}

// Inherit EventEmitter Prototype
util.inherits(SlackBot, EventEmitter);

// Slack Real Time Messaging API Endpoint
SlackBot.prototype.rtmApiUrl = 'https://slack.com/api/rtm.start';
SlackBot.prototype.startRtm = function (options) {
    options = options || {};
    
    this.reconnect = options.reconnect || this.reconnect;
    this.reconnectionInterval = options.reconnectionInterval || this.reconnectionInterval;
    
    let rtmUrl = this.rtmApiUrl + '?' + queryString.stringify({token: this.token});
	
    //Get WebSocket Url 
    request.get(rtmUrl, (err, res, body) => {
        if (err) {
            let error = new VError(err, 'Slack rtm API call failed');
            return this.emit('error', error);
        }
        try {
            let slackMetadata = JSON.parse(body);
            this.metadata = slackMetadata;
            return this.connectWebSocket(this.metadata.url);
        } catch (e){
            let error = new VError(e, 'JSON parse failed');
            return this.emit('error', error);
        }
    });
    
}

SlackBot.prototype.metadata = {};
SlackBot.prototype.connectWebSocket = function (url) {
    let slack = this.slackWS = new WS(url);
    slack.on('message', (msg) => {
        try {
          msg = JSON.parse(msg);  
        } catch(e) {
          return this.emit(new VError(e, 'JSON parse failed'));
        }
        
        let type = msg.type;
        delete msg.type;
        this.emit(type, msg);
    });
    
    slack.on('error', (err) => {
        this.emit('error', err);
    });
    
    slack.on('close', (err) => {
        this.emit('disconected', err || null);
    });
    
    slack.on('ping', () => {
        this.emit('ping');
    });
}

SlackBot.prototype.reconnect = false;
SlackBot.prototype.reconnectionInterval = 3000;

// Getters fot metadata object
Object.defineProperties(SlackBot.prototype, {
    'id': {
        get: function () { return this.metadata.self.id }
    },
    'name': {
        get: function () { return this.metadata.self.name }
    },
    'teamId': {
        get: function () { return this.metadata.team.id }
    },
    'teamName': {
        get: function () { return this.metadata.team.name }
    }
});

SlackBot.prototype.listen = function (array, type, cb) {
    this.on('message', (msg) => {
        let messageType = helper.parseMessageType(msg);
        // if (type.indexOf(messageType) > -1 && msg.text.)
    });
}


module.exports = SlackBot;