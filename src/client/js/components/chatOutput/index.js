"use strict";

let can = require("../../shims/can");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./chatOutput.styl");

let chatTemplate = require("./chatOutput.mustache");
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

function install(tag) {
  tag = tag || "chat-output";
  style(viewCss);
  can.Component.extend({
    tag: "chat-output",
    template: chatTemplate,
    scope: {
      log: [],
      debug: false
    },
    helpers: {
      renderEntryGroup: renderEntryGroup
    }
  });
}

/*
 * Exports
 */
module.exports.install = install;
