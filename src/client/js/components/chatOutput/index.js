"use strict";

let element = require("../../lib/customElement");

let ChatOutput = element.define("chat-output", {
  style: require("./chatOutput.styl"),
  template: require("./chatOutput.mustache"),
  scope: {
    log: [],
    debug: false
  },
  helpers: {
    renderEntryGroup: renderEntryGroup
  }
});

let entryTemplates = {
  system: require("./entries/system.mustache"),
  dialogue: require("./entries/dialogue.mustache"),
  action: require("./entries/action.mustache"),
  slug: require("./entries/slug.mustache"),
  heading: require("./entries/heading.mustache"),
  ooc: require("./entries/ooc.mustache")
};

function renderEntryGroup(opts) {
  let group = opts.context;
  return (entryTemplates[group.firstEntry.entryType] || entryWarn)(group);
}

function entryWarn(ctx) {
  console.warn("No template for entry type: ", ctx.entryType);
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  element.install(ChatOutput, tag);
};
