"use strict";

let can = require("../shims/can"),
    {forEach} = require("lodash"),
    Genfun = require("genfun"),
    {addMethod} = Genfun,
    {clone, init} = require("./proto");

let CustomElement = clone();

let style = require("./ensureStyle");

addMethod(init, [CustomElement], function(customEl, tagName, opts) {
  opts = opts || {};
  customEl.style = opts.style;
  customEl.events = forEach(opts.events, wrapCallback);
  customEl.tagName = tagName;
  customEl.template = opts.template;
  customEl.scope = opts.scope;
  customEl.helpers = opts.helpers;
});

function install(customEl, tagName) {
  if (customEl.style) {
    style(customEl.style);
  }
  can.Component.extend({
    tag: tagName || customEl.tagName,
    template: customEl.template,
    scope: customEl.scope,
    helpers: customEl.helpers,
    events: customEl.events
  });
}

function wrapCallback(callback, pattern, evs) {
  evs[pattern] = function() {
    callback.apply(
      this, [this].concat([].slice.call(arguments)));
  };
}

module.exports.define = function(tagName, opts) {
  return clone(CustomElement, tagName, opts);
};
module.exports.install = install;
