"use strict";

require("sockjs");
let Sock = window.SockJS,
    Genfun = require("genfun"),
    can = require("../shims/can"),
    $ = require("jquery"),
    {addMethod} = Genfun,
    {clone, init} = require("./proto"),
    {partial, forEach, contains, without} = require("lodash"),
    Q = require("q");

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
  $.get(conn.authUrl, function(resp) {
    conn.url = resp.data.wsUrl;
    conn.auth = resp.data.auth;
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
    let data = JSON.parse(msg.data);
    if (data.req) {
      reqs[data.req] && reqs[data.req].resolve(data.data);
      delete reqs[data.req];
    } else {
      let observers = conn.observers[data.namespace] ||
            (console.warn("Unknown namespace: ", data.namespace),
             []);
      forEach(observers, function(obs) {
        return handler.call(conn, obs, data.data);
      });
    }
  } else {
    conn.state(msg.type);
    if (msg.type === "open") {
      conn.socket.send(conn.auth);
    }
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

let reqNum = 0,
    reqs = {};
function request(conn, namespace, data) {
  let deferred = Q.defer(),
      req = ++reqNum;
  conn.socket.send(JSON.stringify({
    namespace: namespace, req: req, data: data
  }));
  reqs[req] = deferred;
  return Q.timeout(deferred.promise, 30000);
}

module.exports = {
  SocketConn: SocketConn,
  onOpen: onOpen,
  onMessage: onMessage,
  onClose: onClose,
  listen: listen,
  unlisten: unlisten,
  send: send,
  request: request
};
