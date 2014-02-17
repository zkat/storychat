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
  forEach(mutations, function(mutation) {
    let el = $(mutation.target);
    assignAttribute(el, el.props(), mutation.attributeName, false);
  });
}

function assignAttribute(el, props, name, fillDefaults) {
  el = $(el);
  let config = el.data("__customEl").attributes[name],
      hookupScope = el.data("__customElHookupScope");
  if (!config) { return; }
  
  let setter = config.observe ? attrSet : normalSet,
      value = el.attr(name),
      elHasAttribute = el[0].hasAttribute(name),
      defaultVal = fillDefaults && (config.defaultMaker ?
                                    config.defaultMaker(props, value) :
                                    config.default);
  if (config.internal && fillDefaults) {
    setter(props, name, defaultVal);
  } else if (elHasAttribute && config.type === "lookup") {
    let compute = hookupScope.computeData(value, { args: []}).compute;
    setter(props, name, compute());
  } else if (elHasAttribute && config.type === "string") {
    setter(props, name, value);
  } else if (elHasAttribute && config.type === "number") {
    setter(props, name, Number(value));
  } else if (elHasAttribute && config.type === "boolean") {
    setter(props, name, Boolean(value));
  } else if (config.required &&
             !elHasAttribute &&
             value === undefined) {
    throw new Error("Missing required property "+name+
                    " in instance of <"+el[0].tagName+">");
  }
  if (!props.hasOwnProperty(name) && fillDefaults) {
    setter(props, name, defaultVal);
  }
}

function makeScopeFun(customEl) {
  return function(attributes, hookupScope, el) {
    let props = new can.Map({});
    $(el).data("__customEl", customEl);
    $(el).data("__customElHookupScope", hookupScope);
    forEach(customEl.attributes, function(_c, name) {
      assignAttribute(el, props, name, true);
    });
    observer.observe(el, {attributes: true});
    return props;
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
