/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let can = require("../../shims/can");
require("../../shims/can.view.mustache");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./chatInput.styl");

let {submitMessage} = require("../../models/chatlog"),
    {EventListener, listen} = require("../../lib/eventListener");

/**
 * ChatInput Controller
 */
let ChatInput = clone();

let listener = clone(EventListener, {
  "form submit": sendMessage,
  "form keydown": keyPressed,
  "select change": selectChanged
});

// NOTE: Yeah, it has to be added in multiple places.
let inputTypes = ["line", "system"];
let inputTemplates = {
  line: require("./inputs/line.mustache"),
  system: require("./inputs/system.mustache")
};

let chatInputTemplate = require("./chatInput.mustache");

addMethod(init, [ChatInput], function(chatInput, el, chatlog) {
  chatInput.el = el;
  chatInput.log = chatlog;
  chatInput.type = can.compute(inputTypes[0]);
  chatInput.actor = can.compute("Mr. 名無しさん");
  initDom(chatInput);
  style(viewCss);
});

function initDom(chatInput) {
  chatInput.el.html(
    chatInputTemplate({
      types: inputTypes,
      type: chatInput.type,
      actor: chatInput.actor
    }, {
      renderInput: renderInput,
      isSelected: isSelected
    }));
  chatInput.listenerHandle = listen(listener, chatInput, chatInput.el);
  chatInput.el.find(".content").focus();
}

/*
 * Chat message handling
 */
function sendMessage(chatInput, _el, event) {
  event.preventDefault();
  let input = chatInput.el.find(".content");
  submitMessage(chatInput.log, chatInput.type(), {
    content: input.val(),
    actor: chatInput.actor()
  });
  input.val("");
}

/*
 * Cycle between input types
 */
const TAB = 9;
function keyPressed(chatInput, _el, event) {
  if (event.keyCode === TAB) {
    event.preventDefault();
    cycleInputType(chatInput);
  }
}

function cycleInputType(chatInput) {
  let typeIndex = inputTypes.indexOf(chatInput.type());
  chatInput.type(inputTypes[(typeIndex + 1) % inputTypes.length]);
  chatInput.el.find(".content").focus();
}

function selectChanged(chatInput, select) {
  chatInput.type(select.val());
}

/*
 * Mustache helpers
 */
function isSelected(type) {
  /*jshint validthis:true*/
  return this === type() ? "selected" : "";
}

function renderInput(opts) {
  return inputTemplates[opts.contexts[0].type()](opts.contexts[0]);
}

/*
 * Exports
 */
module.exports.ChatInput = ChatInput;
