"use strict";

let can = require("../shims/can"),
    {forEach, extend} = require("lodash"),
    Genfun = require("genfun"),
    {clone, init} = require("proto");

let EventListener = clone(),
    teardown = new Genfun();

teardown.addMethod([], function() {});

init.addMethod([EventListener], function(ctrl, events) {
  events = forEach(extend({destroy: teardown}, events), wrapCallback);
  ctrl._canControl = can.Control.extend({}, events);
});
init(EventListener, {});

function listen(listener, observer, domNode, extraData) {
  return new (listener._canControl)(domNode,
                                    extend({__observer: observer},
                                           extraData));
  
}

function wrapCallback(callback, pattern, evs) {
  evs[pattern] = function() {
    callback.apply(
      this, [this.options.__observer].concat([].slice.call(arguments)));
  };
}

module.exports.EventListener = EventListener;
module.exports.listen = listen;
module.exports.teardown = teardown;
