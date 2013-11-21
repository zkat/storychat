"use strict";

let {forEach} = require("lodash");
let element = require("../../lib/customElement");
let can = require("../../shims/can");
let $ = require("jquery");

let ChatOutput = element.define("chat-output", {
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  attributes: {
    log: { type: "lookup", required: true, observe: false },
    debug: { type: "boolean", default: false }
  },
  events: {
    "{log.entryGroups} change": scrollChat
  },
  helpers: {
    renderGroup: renderGroup
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

let entryGroups = {};
forEach(entryTemplates, function(template, name) {
  entryGroups[name] = element.define(name+"-entry-group", {
    template: template,
    attributes: {
      entries: { required: true }
    }
  });
});

function scrollChat(chatOutput) {
  chatOutput.element.scrollTop(chatOutput.element.height());
}

function renderGroup(entryType, opts) {
  return function(tempTag) {
    $(tempTag).html(can.view.mustache(
      "<"+entryType()+"-entry-group entries='entries'/>")(opts.context));
  };
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  forEach(entryGroups, function(group) { element.install(group); });
  element.install(ChatOutput, tag);
};
