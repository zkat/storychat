"use strict";

require("sockjs");
let Sock = window.SockJS,
    Genfun = require("genfun"),
    can = require("../../shims/can"),
    $ = require("jquery"),
    {addMethod} = Genfun,
    {clone, init} = require("../proto"),
    {partial, forEach, extend, contains, without} = require("lodash"),
    Q = require("q");

let SocketConn = clone(),
    onOpen = new Genfun(),
    onMessage = new Genfun(),
    onClose = new Genfun();

addMethod(init, [SocketConn], function(conn) {
  conn.authUrl =
    window.location.protocol + "//" + window.location.host + "/wsauth";
  conn.state = can.compute("connecting");
  conn.observers = {};
  conn.reqNum = 0;
  conn.reqs = {};
  conn.backlog = [];
  initSock(conn, {});
});

function initSock(conn, opts) {
  $.get(conn.authUrl, function(resp) {
    if (conn.state() === "closed") { return; }
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

// We have a singleton connection we reuse everywhere.
let CONN = clone(SocketConn);

function disconnect() {
  CONN.state("closed");
  if (CONN.socket) {
    CONN.socket.close();
    delete CONN.socket;
  }
}

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
      return handler.call(null, conn, obs, data.data);
    });
  }
}

function notifyObservers(conn, handler, msg) {
  if (msg.type === "message") {
    return handleMessage(conn, handler, msg);
  } else {
    return handleOpenClose(conn, handler, msg);
  }
}

function handleOpenClose(conn, handler, msg) {
  if (msg.type === "open") {
    conn.state("open");
    conn.socket.send(conn.auth);
    let args;
    while ((conn.socket.readyState === Sock.OPEN) &&
           (args = conn.backlog.shift())) {
      send.apply(null, args);
    }
  } else {
    conn.state("closed");
  }
  forEach(conn.observers, function(arr) {
    forEach(arr, function(obs) {
      return handler.call(null, conn, obs);
    });
  });
}

function listen(observer, namespace) {
  if (!CONN.observers[namespace]) { CONN.observers[namespace] = []; }
  if (!contains(CONN.observers[namespace], observer)) {
    CONN.observers[namespace].push(observer);
  }
}

function unlisten(observer) {
  CONN.observers = without(CONN.observers, observer);
}

function send(namespace, data, additional) {
  if (CONN.state() === "closed") {
    throw new Error("connection is closed");
  } else if (CONN.socket && CONN.socket.readyState === Sock.OPEN) {
    CONN.socket.send(JSON.stringify(
      extend({}, {namespace: namespace, data: data}, additional)));
  } else {
    CONN.backlog.push(arguments);
  }
}

function request(namespace, data) {
  let deferred = Q.defer(),
      req = ++CONN.reqNum;
  send(namespace, data, {req:req});
  CONN.reqs[req] = deferred;
  return Q.timeout(deferred.promise, 30000);
}

module.exports = {
  disconnect: disconnect,
  conn: CONN,
  onOpen: onOpen,
  onMessage: onMessage,
  onClose: onClose,
  listen: listen,
  unlisten: unlisten,
  send: send,
  request: request
};
