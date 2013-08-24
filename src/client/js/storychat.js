/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let Genfun = require("genfun"),
    {addMethod} = Genfun,
    $ = require("jquery"),
    _ = require("lodash");
// There's something wrong with the AMD for this, so we use the global one. :(
require("sockjs");
let sock = SockJS;

/*
 * Utils
 *
 * These should probably like in a protos.js module or something.
 */

/**
 * Like `new`, but doesn't work off constructor functions and is more
 * prototype-y.
 */
function clone(parent) {
  let obj = Object.create(parent || Object.prototype),
      initRet = init.apply(obj, arguments);
  return typeof initRet === "object" ? initRet : obj;
}

function parent(obj) {
  return Object.getPrototypeOf(obj);
}

let init = new Genfun();
addMethod(init, [], function(){});

/*
 * Chat manager
 *
 * Toplevel controller for the chat.
 */
let Chat = clone();

let onmessage = new Genfun(),
    onopen = new Genfun(),
    onclose = new Genfun();

addMethod(onmessage, [], function() {});
addMethod(onopen, [], function() {});
addMethod(onclose, [], function() {});

addMethod(init, [Chat], function(chat) {
  chat.socket = new sock("http://localhost:8080/ws");
  chat.socket.onopen = _.partial(onopen, chat);
  chat.socket.onmessage = _.partial(onmessage, chat);
  chat.socket.onclose = _.partial(onclose, chat);
});

addMethod(onmessage, [Chat], function(chat, line) {
  console.log("Got a line from server: ", line);
});

$(function() {
  console.log("Running ready!");
  window.chat = clone(Chat);
});
