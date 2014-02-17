"use strict";

let can = require("../shims/can"),
    {forEach, extend} = require("lodash"),
    {clone, init} = require("./proto");

let $ = require("jquery");
$.fn.props = function(attr, val) {
  let props = this.data("scope");
  switch (arguments.length) {
  case 0:
    return props;
  case 1:
    return props.attr(attr);
  case 2:
  default:
    props.attr(attr, val);
    return this;
  }
};

let CustomElement = clone();

let style = require("./ensureStyle");

let MO = (window.MutationObserver ||
          window.WebKitMutationObserver ||
          window.MozMutationObserver);
let observer = new MO(handleAttributeChanges);

init.addMethod([CustomElement], function(customEl, tagName, opts) {
  opts = opts || {};
  customEl.style = opts.style;
  customEl.events = forEach(extend({}, opts.events), wrapCallback);
  customEl.tagName = tagName;
  customEl.template = opts.template;
  customEl.attributes = processAttributes(opts.scope||opts.attributes);
  customEl.helpers = opts.helpers;
});

function install(customEl, tagName) {
  tagName = tagName || customEl.tagName;
  style(tagName + " {\n  display:block;\n}\n" + (customEl.style || ""));
  can.Component.extend({
    tag: tagName,
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
    if (typeof opts === "string") {
      opts = {
        type: opts
      };
    }
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

function handleAttributeChanges(mutations) {
  console.log(mutations);
}

function makeScopeFun(customEl) {
  return function(attributes, _hookupScope, el) {
    let map = new can.Map({});
    forEach(customEl.attributes, function(config, name) {
      let defaultVal = config.defaultMaker ?
            config.defaultMaker(map, attributes[name]) :
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
    observer.observe(el, {attributes: true});
    return map;
  };
}

function wrapCallback(callback, pattern, evs) {
  evs[pattern] = function() {
    callback.apply(
      this.element,
      [this.element].concat([].slice.call(arguments)));
  };
}

module.exports.define = function(tagName, opts) {
  return clone(CustomElement, tagName, opts);
};
module.exports.install = install;
