/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let {onOpen,onMessage,onClose,listen,send} = require("../../lib/socketConn"),
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
addMethod(init, [Chatlog], function(log, conn, ns) {
  log.conn = conn;
  log.namespace = ns;
  listen(conn, log, ns);
  initModelList(log);
});

function initModelList(log) {
  log.lines = new LogLine.List([]);
}

/*
 * Event handling
 */
addMethod(onOpen, [Chatlog], function(log) {
  addEntry(log, {entryType: "system", content: "Connected"});
});

addMethod(onMessage, [Chatlog], function(log, data) {
  addEntry(log, data);
});

addMethod(onClose, [Chatlog], function(log) {
  addEntry(log, {entryType: "system", content: "Disconnected..."});
});

function submitMessage(log, type, opts) {
  let msg = _.extend({}, {entryType: type }, opts || {});
  send(log.conn, log.namespace, msg);
}

/*
 * Entries
 */
function addEntry(log, entryInfo) {
  log.lines.push(new LogLine(entryInfo));
}

/*
 * Canjs Model
 */
var LogLine = can.Model.extend();

module.exports.Chatlog = Chatlog;
module.exports.submitMessage = submitMessage;
