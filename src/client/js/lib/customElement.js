"use strict";

let can = require("../shims/can"),
    {forEach, extend} = require("lodash"),
    Genfun = require("genfun"),
    {addMethod} = Genfun,
    {clone, init} = require("./proto");

let CustomElement = clone();

let style = require("./ensureStyle");

addMethod(init, [CustomElement], function(customEl, tagName, opts) {
  opts = opts || {};
  customEl.style = opts.style;
  customEl.events = forEach(extend({}, opts.events), wrapCallback);
  customEl.tagName = tagName;
  customEl.template = opts.template;
  customEl.attributes = processAttributes(opts.scope||opts.attributes);
  customEl.helpers = opts.helpers;
});

function install(customEl, tagName) {
  if (customEl.style) {
    style(customEl.style);
  }
  can.Component.extend({
    tag: tagName || customEl.tagName,
    template: customEl.template,
    scope: makeScopeFun(customEl),
    helpers: customEl.helpers,
    events: customEl.events
  });
}

function processAttributes(attrs) {
  let ret = {};
  forEach(attrs, function(opts, name) {
    /* jshint eqeqeq: false, eqnull: true */
    ret[name] = {
      observe: opts.observe == null || opts.observe,
      default: opts.default,
      defaultMaker: opts.defaultMaker,
      required: opts.required,
      type: opts.type ||
        (opts.default != null && typeof opts.default) ||
        "lookup",
      internal: opts.internal
    };
  });
  return ret;
}

function attrSet(x, key, val) {
  x.attr(key, val);
}

function normalSet(x, key, val) {
  x[key] = val;
}

function makeScopeFun(customEl) {
  return function scope(attributes, _hookupScope, el) {
    let map = new can.Map({});
    forEach(customEl.attributes, function(config, name) {
      let defaultVal = config.defaultMaker ?
            config.defaultMaker(customEl, attributes[name]) :
            config.default,
          elHasAttribute = el.hasAttribute(name),
          setter = config.observe ? attrSet : normalSet;
      // TODO - these two will not be observed. Need to figure out a way to get
      // Map#attr() to not convert objects into maps automatically.
      if (config.internal) {
        setter(map, name, defaultVal);
      } else if (attributes.hasOwnProperty(name) && config.type === "lookup") {
        setter(map, name, attributes[name]);
      } else if (elHasAttribute && config.type === "string") {
        setter(map, name, el.getAttribute(name));
      } else if (elHasAttribute && config.type === "number") {
        setter(map, name, Number(el.getAttribute(name)));
      } else if (elHasAttribute && config.type === "boolean") {
        setter(map, name, Boolean(el.getAttribute(name)));
      } else if (config.required &&
                 !el.hasAttribute(name) &&
                 !attributes.hasOwnProperty(name)) {
        throw new Error("Missing required property "+name+
                       " in instance of <"+customEl+">");
      }

      if (!map.hasOwnProperty(name)) {
        // TODO - this will not be observed. Address after figuring out
        // can.Map#attr on objects.
        setter(map, name, defaultVal);
      }
    });
    return map;
  };
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
