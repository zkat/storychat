/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

require("../../shims/can.view.mustache");

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let can = require("../../shims/can");

let insertCss = require("insert-css"),
    viewCss = require("./chatInput.styl");

let fs = require("fs"),
    chatInputTemplateText = fs.readFileSync(__dirname + "/chatInput.mustache");

let {addLine} = require("../../models/chatlog"),
    {EventListener, listen} = require("../../lib/eventListener");

/*
 * ChatInput
 */
let ChatInput = clone();

let events = { "form submit": sendMessage },
    listener = clone(EventListener, events),
    chatInputTemplate = can.view.mustache(chatInputTemplateText),
    cssInserted = false;

addMethod(init, [ChatInput], function(input, el, chatlog) {
  input.el = el;
  input.log = chatlog;
  initDom(input);
  if (!cssInserted) {
    insertCss(viewCss);
    cssInserted = true;
  }
});

function initDom(input) {
  input.el.html(chatInputTemplate());
  input.listenerHandle = listen(listener, input, input.el);
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
module.exports.ChatInput = ChatInput;
