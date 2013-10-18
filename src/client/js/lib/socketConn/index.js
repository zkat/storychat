"use strict";

require("sockjs");
let Sock = window.SockJS,
    Genfun = require("genfun"),
    can = require("../../shims/can"),
    $ = require("jquery"),
    {addMethod} = Genfun,
    {clone, init} = require("../proto"),
    {partial, forEach, contains, without} = require("lodash"),
    Q = require("q");

let SocketConn = clone(),
    onOpen = new Genfun(),
    onMessage = new Genfun(),
    onClose = new Genfun();

addMethod(init, [SocketConn], function(conn, authUrl, opts) {
  conn.authUrl = authUrl;
  conn.state = can.compute("close");
  conn.observers = {};
  conn.reqNum = 0;
  conn.reqs = {};
  initSock(conn, opts);
});

function initSock(conn, opts) {
  $.get(conn.authUrl, function(resp) {
    conn.url = resp.data.wsUrl;
    conn.auth = resp.data.auth;
    conn.socket = new Sock(conn.url, null, opts);
    conn.socket.onopen = partial(notifyObservers, conn, onOpen);
    conn.socket.onmessage = partial(notifyObservers, conn, onMessage);
    conn.socket.onclose = partial(notifyObservers, conn, onClose);
  });
}
addMethod(onOpen, [], function() {});
addMethod(onMessage, [], function() {});
addMethod(onClose, [], function() {});

function handleMessage(conn, handler, msg) {
  let data = JSON.parse(msg.data);
  if (data.req) {
    let req = conn.reqs[data.req];
    if (req) {
      req.resolve(data.data);
    }
    delete conn.reqs[data.req];
  } else {
    let observers = conn.observers[data.namespace] ||
          (console.warn("Unknown namespace: ", data.namespace),
           []);
    forEach(observers, function(obs) {
      return handler.call(conn, obs, data.data);
    });
  }
}

function notifyObservers(conn, handler, msg) {
  if (msg.type === "message") {
    return handleMessage(conn, handler, msg);
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

function request(conn, namespace, data) {
  let deferred = Q.defer(),
      req = ++conn.reqNum;
  conn.socket.send(JSON.stringify({
    namespace: namespace,
    req: req,
    data: data
  }));
  conn.reqs[req] = deferred;
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
