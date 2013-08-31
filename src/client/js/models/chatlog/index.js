/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let {onOpen,onMessage,onClose,listen,send} = require("../../lib/socketConn"),
    {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
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

addMethod(onOpen, [Chatlog], function(log) {
  addEntry(log, {entryType: "system", text: "Connected"});
});

addMethod(onMessage, [Chatlog], function(log, data, conn) {
  addEntry(log, data);
});

addMethod(onClose, [Chatlog], function(log) {
  addEntry(log, {entryType: "system", text: "Disconnected..."});
});

function addEntry(log, entryInfo) {
  log.lines.push(new LogLine(entryInfo));
}

function addLine(log, line) {
  send(log.conn, log.namespace, {entryType: "line", text: line});
}

/*
 * Canjs Model
 */
var LogLine = can.Model.extend();

module.exports.Chatlog = Chatlog;
module.exports.addLine = addLine;
