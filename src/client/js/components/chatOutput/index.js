"use strict";

let {forEach, defer} = require("lodash");
let element = require("../../lib/customElement");
let can = require("can");
let $ = require("jquery");

let ChatOutput = element.define("chat-output", {
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  properties: {
    log: { type: "lookup", required: true, observe: false },
    debug: { type: "boolean", default: false }
  },
  events: {
    "{scope.log.entryGroups} change": setSizeAndScroll,
    "{window} resize": setSizeAndScroll,
    inserted: setSizeAndScroll
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
    properties: {
      entries: { required: true }
    }
  });
});

function scrollChat(el) {
  let newTop = el.children().height();
  defer(function() {
    el.scrollTop(newTop);
  });
}

function setSizeAndScroll(el) {
  let elHeight = el.height(),
      winHeight = $(window).height(),
      bodHeight = $("body").height();
  el.height(winHeight - (bodHeight - elHeight));
  scrollChat(el);
}

function renderGroup(_props, entryType, opts) {
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
