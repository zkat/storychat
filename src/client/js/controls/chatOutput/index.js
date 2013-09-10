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
  dialogue: require("./entries/dialogue.mustache"),
  action: require("./entries/action.mustache"),
  slug: require("./entries/slug.mustache"),
  heading: require("./entries/heading.mustache"),
  ooc: require("./entries/ooc.mustache")
};

/*
 * Init
 */
addMethod(init, [ChatOutput], function(chatOutput, el, chatlog) {
  chatOutput.el = el;
  chatOutput.log = chatlog;
  chatOutput.debug = true;
  initDom(chatOutput);
  style(viewCss);
});

function initDom(chatOutput) {
  chatOutput.el.html(chatTemplate(
    { log: chatOutput.log, debug: chatOutput.debug },
    { renderEntry: renderEntry }));
}

function renderEntry(opts) {
  /*jshint validthis: true*/
  let obj = this;
  return function(el) {
    $(el).html((entryTemplates[obj.entryType] || entryWarn)(obj))
      .addClass(obj.entryType)
      .data("entry", obj);
    if (opts.contexts[0].debug && obj._sent) {
      let diff = obj._received - obj._sent;
      $("<span class=debug>").text(diff).appendTo(el);
    }
  };
}

function entryWarn(ctx) {
  console.warn("No template for entry type: ", ctx.entryType);
}

/*
 * Exports
 */
module.exports.ChatOutput = ChatOutput;
