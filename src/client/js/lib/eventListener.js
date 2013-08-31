/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let can = require("../shims/can"),
    _ = require("lodash"),
    {addMethod} = require("genfun"),
    {clone, init} = require("./proto");

let EventListener = clone();

addMethod(init, [EventListener], function(ctrl, events) {
  events = _.each(_.extend({}, events), wrapCallback);
  ctrl._canControl = can.Control.extend({}, events);
});
init(EventListener, {});

function listen(listener, observer, domNode, extraData) {
  return new (listener._canControl)(domNode,
                                    _.extend({__observer: observer},
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