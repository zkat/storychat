/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let Genfun = require("genfun"),
    addMethod = Genfun.addMethod;

let init = new Genfun();
addMethod(init, [], function(){});

/**
 * Like `new`, but doesn't work off constructor functions and is more
 * prototype-y.
 */
function clone(parent) {
  let initargs = [].slice.call(arguments, 1),
      obj = Object.create(parent || Object.prototype),
      initRet = init.apply(parent, [obj].concat(initargs));
  return typeof initRet === "object" ? initRet : obj;
}

function parent(obj) {
  return Object.getPrototypeOf(obj);
}

module.exports = {
  clone: clone,
  parent: parent,
  init: init
};
