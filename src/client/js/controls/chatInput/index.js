/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
    {extend, forEach} = require("lodash");

let can = require("../../shims/can");
require("../../shims/can.view.mustache");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./chatInput.styl");

let {submitEntry} = require("../../models/chatlog"),
    {EventListener, listen} = require("../../lib/eventListener");

/**
 * ChatInput Controller
 */
let ChatInput = clone();

let listener = clone(EventListener, {
  "form submit": sendMessage,
  "form keydown": keyPressed,
  "select change": selectChanged,
  "[name=actor] input": actorChanged
});

// NOTE: Yeah, it has to be added in multiple places.
let inputTypes = ["dialogue", "action", "slug", "heading", "ooc"];
let inputTemplates = {
  dialogue: require("./inputs/dialogue.mustache"),
  action: require("./inputs/action.mustache"),
  slug: require("./inputs/slug.mustache"),
  heading: require("./inputs/heading.mustache"),
  ooc: require("./inputs/ooc.mustache")
};

let chatInputTemplate = require("./chatInput.mustache");

addMethod(init, [ChatInput], function(chatInput, el, chatlog) {
  chatInput.el = el;
  chatInput.log = chatlog;
  chatInput.type = can.compute(inputTypes[0]);
  chatInput.actor = can.compute("Mr.名無しさん");
  chatInput.defaults = {};
  initDom(chatInput);
  style(viewCss);
});

function initDom(chatInput) {
  chatInput.el.html(
    chatInputTemplate({
      types: inputTypes,
      type: chatInput.type,
      actor: chatInput.actor,
      defaults: chatInput.defaults
    }, {
      renderInput: renderInput,
      isSelected: isSelected
    }));
  chatInput.listenerHandle = listen(listener, chatInput, chatInput.el);
  chatInput.el.find("form [name=content]").focus();
}

/*
 * Chat message handling
 */
function sendMessage(chatInput, _el, event) {
  event.preventDefault();
  let formVals = can.deparam(chatInput.el.find("form").serialize());
  if (!formVals.content) { return; }
  formVals.actor = formVals.actor || chatInput.actor();
  submitEntry(chatInput.log, chatInput.type(), formVals);
  chatInput.el.find("form").get(0).reset();
}

/*
 * Cycle between input types
 */
const TAB = 9;
function keyPressed(chatInput, _el, event) {
  if (event.keyCode === TAB) {
    event.preventDefault();
    cycleInputType(chatInput, !event.shiftKey);
  }
}

function cycleInputType(chatInput, goForward) {
  let typeIndex = inputTypes.indexOf(chatInput.type()),
      form = chatInput.el.find("form");
  extend(chatInput.defaults, can.deparam(form.serialize()));
  chatInput.type(
    inputTypes[(typeIndex + (goForward ? 1 : inputTypes.length - 1)) %
               inputTypes.length]);
  forEach(chatInput.defaults, function(v, k) {
    form.find("[name="+k+"]").val(v);
  });
  chatInput.el.find("form [name=content]").focus();
}

function selectChanged(chatInput, select) {
  chatInput.type(select.val());
}

function actorChanged(chatInput, inputEl) {
  chatInput.actor(inputEl.val());
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
