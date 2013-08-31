/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./chatInput.styl");

require("../../shims/can.view.mustache");

let {addLine} = require("../../models/chatlog"),
    {EventListener, listen} = require("../../lib/eventListener");

/**
 * ChatInput Controller
 */
let ChatInput = clone();

let chatInputTemplate = require("./chatInput.mustache"),
    listener = clone(EventListener, { "form submit": sendMessage });

addMethod(init, [ChatInput], function(input, el, chatlog) {
  input.el = el;
  input.log = chatlog;
  initDom(input);
  style(viewCss);
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
