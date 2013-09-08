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

let chatInputTemplate = require("./chatInput.mustache"),
    listener = clone(EventListener, { "form submit": sendMessage,
                                      keydown: keyPressed});

let inputTypes = ["line", "system"];
let inputTemplates = {
  line: require("./inputs/line.mustache"),
  system: require("./inputs/system.mustache")
};

addMethod(init, [ChatInput], function(input, el, chatlog) {
  input.el = el;
  input.log = chatlog;
  input.typeInfo = new can.Observe({type: inputTypes[0]});
  initDom(input);
  style(viewCss);
});

function initDom(input) {
  input.el.html(chatInputTemplate(input.typeInfo,
                                  { renderInput: renderInput }));
  input.listenerHandle = listen(listener, input, input.el);
}

/*
 * Chat message handling
 */
function sendMessage(chatInput, _el, event) {
  event.preventDefault();
  let input = chatInput.el.find(".content");
  submitMessage(chatInput.log, chatInput.typeInfo.attr("type"), input.val());
  input.val("");
}

/*
 * Toggle between input types
 */
const TAB = 9;
function keyPressed(chatInput, _el, event) {
  if (event.keyCode === TAB) {
    event.preventDefault();
    cycleInputType(chatInput);
  }
}

function cycleInputType(chatInput) {
  let typeIndex = inputTypes.indexOf(chatInput.typeInfo.attr("type"));
  chatInput.typeInfo.attr("type",
                          (inputTypes[(typeIndex + 1) % inputTypes.length]));
  chatInput.el.find(".content").focus();
}

function renderInput(type) {
  return inputTemplates[type()]();
}

/*
 * Exports
 */
module.exports.ChatInput = ChatInput;
