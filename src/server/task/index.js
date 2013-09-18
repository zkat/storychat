/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var fiber = require("fibers"),
    promises = require("node-promise");

function spawn(cb) {
  let deferred = promises.defer();
  fiber(function() {
    try {
      deferred.resolve(cb());
    } catch(e) {
      deferred.reject(e);
    }
  }).run();
  return deferred.promise;
}

function _yield(val) {
  let curr = fiber.current,
      e = {};
  if (typeof val.then === "function") {
    val.then(function(res) {
      curr.run(res);
    }, function(err) {
      e.err = err;
      curr.run(e);
    });
  } else {
    setTimeout(function() {
      curr.run(val);
    }, 0);
  }
  let res = fiber.yield();
  if (res === e) {
    throw res.err;
  } else {
    return res;
  }
}

function sleep(ms) {
  let curr = fiber.current;
  setTimeout(function() {
    curr.run();
  }, ms);
  fiber.yield();
}

module.exports = {
  spawn: spawn,
  yield: _yield,
  sleep: sleep
};
