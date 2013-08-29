/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

// Broken AMDs
require("../../shims/can.view.mustache");
require("sockjs");

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
    _ = require("lodash"),
    can = require("../../shims/can"),
    insertCss = require("insert-css"),
    viewCss = require("./chat.styl"),
    {addLine} = require("../../models/chatlog"),
    fs = require("fs"),
    chatTemplateText = fs.readFileSync(__dirname + "/chat.mustache");

insertCss(viewCss);

/**
 * Chat Controller
 *
 */
let Chat = clone();

/*
 * Init
 */
addMethod(init, [Chat], function(chat, el, chatlog) {
  chat.el = el;
  chat.log = chatlog;
  initControl(chat);
});

let chatTemplate = can.view.mustache(chatTemplateText);
function initControl(chat) {
  chat.el.html(chatTemplate({ log: chat.log }));
  chat.control = new Control(chat.el, { chat: chat, log: chat.log });
}

/*
 * Chat message handling
 */
function sendMessage(chat, _el, event) {
  event.preventDefault();
  let input = chat.el.find("input[type=text]");
  addLine(chat.log, input.val());
  input.val("");
}

/*
 * DOM event handling
 */

let events = _.each({
  "form submit": sendMessage
}, _wrapCallback);

var Control = can.Control.extend({}, events);
function _wrapCallback(callback, pattern, evs) {
  evs[pattern] = function() {
    callback.apply(this, [this.options.chat].concat([].slice.call(arguments)));
  };
}

/*
 * Exports
 */
module.exports.Chat = Chat;
