/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

require("sockjs");
let Sock = window.SockJS,
    {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
    _ = require("lodash"),
    can = require("../../shims/can");

/**
 * Chatlog Model
 */
let Chatlog = clone();

/*
 * Init
 */
addMethod(init, [Chatlog], function(log, url) {
  initSocket(log, url);
  initModelList(log);
});

function initSocket(log, url) {
  log.socket = new Sock(url);
  log.socket.onopen = _.partial(onOpen, log);
  log.socket.onmessage = _.partial(onMessage, log);
  // TODO - this is probably a pretty naive way to go about reconnecting...
  log.socket.onclose = _.partial(initSocket, log);
}

function initModelList(log) {
  log.lines = new LogLine.List([]);
}

function onOpen(log) {
  addEntry(log, {entryType: "system", text: "Connected"});
}

function addEntry(log, entryInfo) {
  log.lines.push(new LogLine(entryInfo));
}

function onMessage(log, message) {
  addEntry(log, JSON.parse(message.data));
}

function addLine(log, line) {
  log.socket.send(JSON.stringify({entryType: "line", text: line}));
}

/*
 * Canjs Model
 */
var LogLine = can.Model.extend({},{});

module.exports.Chatlog = Chatlog;
module.exports.addLine = addLine;
