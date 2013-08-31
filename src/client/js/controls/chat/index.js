/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

// Broken AMDs
require("../../shims/can.view.mustache");

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
    can = require("../../shims/can"),
    insertCss = require("insert-css"),
    viewCss = require("./chat.styl"),
    {addLine} = require("../../models/chatlog"),
    {EventListener, listen} = require("../../lib/eventListener"),
    fs = require("fs"),
    chatTemplateText = fs.readFileSync(__dirname + "/chat.mustache");

/**
 * Chat Controller
 *
 */
let Chat = clone(),
    chatTemplate = can.view.mustache(chatTemplateText),
    events = { "form submit": sendMessage },
    listener = clone(EventListener, events),
    cssInserted = false;

/*
 * Init
 */
addMethod(init, [Chat], function(chat, el, chatlog) {
  chat.el = el;
  chat.log = chatlog;
  initDom(chat);
  if (!cssInserted) {
    insertCss(viewCss);
    cssInserted = true;
  }
});

function initDom(chat) {
  chat.el.html(chatTemplate({ log: chat.log }, { isEntryType: isEntryType }));
  chat.listenerHandle = listen(listener, chat, chat.el);
}

function isEntryType(entryType, options) {
  /*jshint validthis: true*/
  if (this.entryType === entryType) {
    return options.fn(this);
  } else {
    return false;
  }
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
 * Exports
 */
module.exports.Chat = Chat;
