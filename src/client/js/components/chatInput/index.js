"use strict";

let {forEach, find, findIndex} = require("lodash");

let can = require("../../shims/can"),
    $ = require("jquery"),
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
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  events: {
    "form submit": sendMessage,
    "form keydown": keyPressed,
    "select change": typeSelectorChanged,
    "[name=actor] input": actorNameChanged,
    "{scope} type": typeChanged,
    inserted: function(chatInput) {
      chatInput.element.find("form [name=content]").focus();
    }
  },
  attributes: {
    log: { type: "lookup", required: true, observe: false },
    type: { type: "string", default: inputs[0].name },
    inputs: { default: inputs },
    actor: { type: "string", default: "Mr.名無しさん"},
    defaults: { internal: true, defaultMaker: Object.create }
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
    event.preventDefault();
    cycleInputType(chatInput, !event.shiftKey);
  }
}

function cycleInputType(chatInput, goForward) {
  let typeIndex = findIndex(inputs, {name: chatInput.scope.type});
  chatInput.scope.attr(
    "type",
    inputs[(typeIndex + (goForward ? 1 : inputs.length - 1)) %
           inputs.length].name);
  chatInput.element.find("form [name=content]").focus();
}

function typeChanged(chatInput, scope) {
  let form = chatInput.element.find("form");
  chatInput.element.find("select").val(scope.type);
  chatInput.scope.attr("defaults", can.deparam(form.serialize()));
  forEach(chatInput.scope.defaults, function(v, k) {
    form.find("[name="+k+"]").val(v);
  });
}

function typeSelectorChanged(chatInput, el) {
  chatInput.scope.attr("type", el.val());
}

function actorNameChanged(chatInput, el) {
  chatInput.scope.attr("actor", el.val());
}

/*
 * Mustache helpers
 */
function renderInput(type, opts) {
  let scope = opts.scope;
  function render(el) {
    $(el).html(find(inputs, {name: type()}).template(scope));
  }
  return function(el) {
    render(el);
    type.bind("change", function() {
      render(el);
    });
  };
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  element.install(ChatInput, tag);
};
