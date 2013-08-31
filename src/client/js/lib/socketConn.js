/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";


require("sockjs");
let Sock = window.SockJS,
    Genfun = require("genfun"),
    {addMethod} = Genfun,
    {clone, init} = require("./proto"),
    _ = require("lodash");

let SocketConn = clone(),
    onOpen = new Genfun(),
    onMessage = new Genfun(),
    onClose = new Genfun();

addMethod(init, [SocketConn], function(conn, url) {
  conn.url = url;
  conn.observers = {};
  conn.socket = new Sock(url);
  conn.socket.onopen = _.partial(notifyObservers, conn, onOpen);
  conn.socket.onmessage = _.partial(notifyObservers, conn, onMessage);
  conn.socket.onclose = _.partial(notifyObservers, conn, onClose);
});

addMethod(onOpen, [], function() {});
addMethod(onMessage, [], function() {});
addMethod(onClose, [], function() {});

function notifyObservers(conn, handler, msg) {
  if (msg.type === "message") {
    let data = JSON.parse(msg.data),
        observers = conn.observers[data.namespace] ||
          (console.warn("Unknown namespace: ", data.namespace),
           []);
    _.each(observers, function(obs) {
      return handler.call(conn, obs, data.data);
    });
  } else {
    _.each(conn.observers, function(arr) {
      _.each(arr, function(obs) {
        return handler.call(conn, obs);
      });
    });
  }
}

function listen(conn, observer, namespace) {
  if (!conn.observers[namespace]) { conn.observers[namespace] = []; }
  if (!_.contains(conn.observers[namespace], observer)) {
    conn.observers[namespace].push(observer);
  }
}

function unlisten(conn, observer) {
  conn.observers = _.without(conn.observers, observer);
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
