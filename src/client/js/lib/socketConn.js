/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

require("sockjs");
let Sock = window.SockJS,
    Genfun = require("genfun"),
    can = require("../shims/can"),
    $ = require("jquery"),
    {addMethod} = Genfun,
    {clone, init} = require("./proto"),
    {partial, forEach, contains, without} = require("lodash");

let SocketConn = clone(),
    onOpen = new Genfun(),
    onMessage = new Genfun(),
    onClose = new Genfun();

addMethod(init, [SocketConn], function(conn, authUrl) {
  conn.authUrl = authUrl;
  conn.state = can.compute("close");
  conn.observers = {};
  initSock(conn);
});

function initSock(conn) {
  $.get(conn.authUrl, function(wsUrl) {
    conn.url = wsUrl;
    conn.socket = new Sock(conn.url);
    conn.socket.onopen = partial(notifyObservers, conn, onOpen);
    conn.socket.onmessage = partial(notifyObservers, conn, onMessage);
    conn.socket.onclose = partial(notifyObservers, conn, onClose);
  });
}
addMethod(onOpen, [], function() {});
addMethod(onMessage, [], function() {});
addMethod(onClose, [], function() {});

function notifyObservers(conn, handler, msg) {
  if (msg.type === "message") {
    let data = JSON.parse(msg.data),
        observers = conn.observers[data.namespace] ||
          (console.warn("Unknown namespace: ", data.namespace),
           []);
    forEach(observers, function(obs) {
      return handler.call(conn, obs, data.data);
    });
  } else {
    conn.state(msg.type);
    forEach(conn.observers, function(arr) {
      forEach(arr, function(obs) {
        return handler.call(conn, obs);
      });
    });
  }
}

function listen(conn, observer, namespace) {
  if (!conn.observers[namespace]) { conn.observers[namespace] = []; }
  if (!contains(conn.observers[namespace], observer)) {
    conn.observers[namespace].push(observer);
  }
}

function unlisten(conn, observer) {
  conn.observers = without(conn.observers, observer);
}

function send(conn, namespace, data) {
  conn.socket.send(JSON.stringify({namespace: namespace, data: data}));
}

module.exports = {
  SocketConn: SocketConn,
  onOpen: onOpen,
  onMessage: onMessage,
  onClose: onClose,
  listen: listen,
  unlisten: unlisten,
  send: send
};
