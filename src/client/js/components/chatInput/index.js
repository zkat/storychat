"use strict";

let {extend, forEach, find, findIndex} = require("lodash");

let can = require("../../shims/can"),
    element = require("../../lib/customElement");

let {submitEntry} = require("../../models/chatlog");

let inputs = [
  {name: "dialogue", template: require("./inputs/dialogue.mustache")},
  {name: "action", template: require("./inputs/action.mustache")},
  {name: "ooc", template: require("./inputs/ooc.mustache")}
];

/**
 * ChatInput Controller
 */
let ChatInput = element.define("chat-input", {
  style: require("./chatInput.styl"),
  template: require("./chatInput.mustache"),
  events: {
    "form submit": sendMessage,
    "form keydown": keyPressed,
    init: function(chatInput) {
      chatInput.element.find("form [name=content]").focus();
    }
  },
  scope: {
    log: [],
    type: inputs[0].name,
    inputs: inputs,
    actor: "Mr.名無しさん",
    defaults: {}
  },
  helpers: {
    renderInput: renderInput
  }
});

/*
 * Chat message handling
 */
function sendMessage(chatInput, _el, event) {
  event.preventDefault();
  let formVals = can.deparam(chatInput.element.find("form").serialize());
  if (!formVals.content) { return; }
  formVals.actor = formVals.actor || chatInput.scope.actor;
  submitEntry(chatInput.scope.log, chatInput.scope.type, formVals);
  chatInput.element.find("form")[0].reset();
}

/*
 * Cycle between input types
 */
const TAB = 9;
function keyPressed(chatInput, _el, event) {
  if (event.keyCode === TAB) {
    console.log("tabity tab");
    event.preventDefault();
    cycleInputType(chatInput, !event.shiftKey);
  }
}

function cycleInputType(chatInput, goForward) {
  let typeIndex = findIndex(inputs, {name: chatInput.scope.type}),
      form = chatInput.element.find("form");
  extend(chatInput.scope.defaults, can.deparam(form.serialize()));
  chatInput.scope.attr(
    "type",
    inputs[(typeIndex + (goForward ? 1 : inputs.length - 1)) %
           inputs.length].name);
  forEach(chatInput.scope.defaults, function(v, k) {
    form.find("[name="+k+"]").val(v);
  });
  chatInput.element.find("form [name=content]").focus();
}

/*
 * Mustache helpers
 */
function renderInput(scope) {
  return find(inputs, {name: scope.type}).template(scope);
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  element.install(ChatInput, tag);
};
