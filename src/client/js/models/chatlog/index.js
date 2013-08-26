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

function initSocket(log) {
  log.socket = new Sock("http://localhost:8080/ws");
  log.socket.onmessage = _.partial(onMessage, log);
}

function initModelList(log) {
  log.lines = new LogLine.List([]);
}

function onMessage(log, line) {
  addLine(log, line);
}

function addLine(log, line) {
  log.lines.push(new LogLine({text: line}));
}

/*
 * Canjs Model
 */
var LogLine = can.Model.extend({},{});

module.exports.Chatlog = Chatlog;
