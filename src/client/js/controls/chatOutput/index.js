/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let $ = require("jquery");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./chatOutput.styl");

require("../../shims/can.view.mustache");

/**
 * ChatOutput Controller
 *
 */
let ChatOutput = clone();

let chatTemplate = require("./chatOutput.mustache");
let entryTemplates = {
  system: require("./entries/system.mustache"),
  dialogue: require("./entries/dialogue.mustache")
};

/*
 * Init
 */
addMethod(init, [ChatOutput], function(chatOutput, el, chatlog) {
  chatOutput.el = el;
  chatOutput.log = chatlog;
  initDom(chatOutput);
  style(viewCss);
});

function initDom(chatOutput) {
  chatOutput.el.html(chatTemplate(
    { log: chatOutput.log },
    { renderEntry: renderEntry }));
}

function renderEntry() {
  /*jshint validthis: true*/
  let obj = this;
  return function(el) {
    $(el).html((entryTemplates[obj.entryType] || entryWarn)(obj))
      .addClass(obj.entryType)
      .data("entry", obj);
  };
}

function entryWarn(ctx) {
  console.warn("No template for entry type: ", ctx.entryType);
}

/*
 * Exports
 */
module.exports.ChatOutput = ChatOutput;
