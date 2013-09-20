"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

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
  chatOutput.el.addClass("chat-output").html(chatTemplate(
    { log: chatOutput.log, debug: chatOutput.debug },
    { renderEntryGroup: renderEntryGroup }));
}

function renderEntryGroup() {
  /*jshint validthis:true*/
  return (entryTemplates[this.firstEntry.entryType] || entryWarn)(this);
}

function entryWarn(ctx) {
  console.warn("No template for entry type: ", ctx.entryType);
}

/*
 * Exports
 */
module.exports.ChatOutput = ChatOutput;
