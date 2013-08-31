/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

// Broken AMDs
require("../../shims/can.view.mustache");

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
    can = require("../../shims/can"),
    $ = require("jquery"),
    insertCss = require("insert-css"),
    viewCss = require("./chat.styl"),
    _ = require("lodash"),
    {addLine} = require("../../models/chatlog"),
    {EventListener, listen} = require("../../lib/eventListener"),
    fs = require("fs"),
    chatTemplateText = fs.readFileSync(__dirname + "/chat.mustache"),
    systemTemplateText =
      fs.readFileSync(__dirname + "/entries/system.mustache"),
    lineTemplateText =
      fs.readFileSync(__dirname + "/entries/line.mustache");

/**
 * Chat Controller
 *
 */
let Chat = clone(),
    chatTemplate = can.view.mustache(chatTemplateText),
    events = { "form submit": sendMessage },
    listener = clone(EventListener, events),
    cssInserted = false;

Chat.entryTemplates = _.each({
  system: systemTemplateText,
  line: lineTemplateText
}, function(val, key, tbl) {
  tbl[key] = can.view.mustache(val);
});

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
  chat.el.html(chatTemplate({ log: chat.log }, { renderEntry: renderEntry }));
  chat.listenerHandle = listen(listener, chat, chat.el);
}

function renderEntry() {
  /*jshint validthis: true*/
  let obj = this;
  return function(el) {
    $(el).html(Chat.entryTemplates[obj.entryType](obj))
      .addClass(obj.entryType)
      .data("entry", obj);
  };
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
