"use strict";

var fiber = require("fibers"),
    promises = require("node-promise");

function spawn(cb) {
  let cbArgs = [].slice.call(arguments, 1),
      deferred = promises.defer();
  function execCallback() {
    try {
      deferred.resolve(cb.apply(this, arguments));
    } catch(e) {
      deferred.reject(e);
    }
  }
  let fib = fiber(execCallback.bind.apply(execCallback, [this].concat(cbArgs)));
  process.nextTick(fib.run.bind(fib));
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

function wrap(fn) {
  return function() {
    return _yield(fn.apply(this, arguments));
  };
}

function isInTask() {
  return typeof fiber.current !== "undefined";
}

module.exports = {
  spawn: spawn,
  yield: _yield,
  sleep: sleep,
  wrap: wrap,
  isInTask: isInTask
};
