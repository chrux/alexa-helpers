/**
 * Alexa Reply
 *
 * See message-renderer to see the msg structure that
 * Reply expects.
 *
 * TODO: validate that no more text is appeneded after
 * has yielded.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash')
    , S = require("string")
    , _ = require('lodash')
  ;

var SSML = "SSML";

function Reply(msg) {
  this.msg = {
    statements: [],
    reprompt: '',
    card: null,
    yield: false,
    hasAnAsk: false
  };
  this.append(msg);
}

Reply.prototype.append = function (msg) {
  if (!msg) return this;
  var statement = msg.ask || msg.tell || msg.say;
  if (statement) this.msg.statements.push(statement);
  this.msg.reprompt = msg.reprompt || this.msg.reprompt;
  this.msg.card = msg.card || this.msg.card;
  this.msg.yield = this.msg.yield || !!(msg.ask || msg.tell);
  this.msg.hasAnAsk = this.msg.hasAnAsk || !!msg.ask;
  return this;
};

Reply.prototype.end = function () {
  this.yield = true;
  return this;
};

Reply.prototype.isYielding = function () {
  return this.msg.yield;
};

Reply.prototype.render = function () {
  var say = wrapSpeech(toSSML(this.msg.statements.join('\n'))),
      reprompt = wrapSpeech(toSSML(this.msg.reprompt));
  return { say: say, reprompt: reprompt };
};

Reply.prototype.write = function (response) {
  var rendered = this.render();
  if (this.msg.hasAnAsk) response.ask(rendered.say, rendered.reprompt, this.msg.card);else response.tell(rendered.say, this.msg.card);
  return this;
};

function toSSML(statement) {
  if (!statement) return null;
  if (S(statement).startsWith('<speak>')) return statement;
  statement = statement.replace(/&/g, '&amp;'); //Hack. Full xml escaping would be better, but the & is currently the only special character used.
  return '<speak>' + statement + '</speak>';
}

function wrapSpeech(statement) {
  if (!statement) return null;
  return { speech: statement, type: SSML };
}

module.exports = Reply;
