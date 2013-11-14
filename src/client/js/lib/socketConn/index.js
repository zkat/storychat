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

function handleMessage(conn, handler, sockMsg) {
  let msg = JSON.parse(sockMsg.data);
  switch (msg.type) {
  case "reply":
  case "reject":
    let req = conn.reqs[msg.req];
    if (!req) {
      console.warn("Unexpected reply: ", msg);
      return;
    }
    if (msg.type === "reply") {
      req.resolve(msg.data);
    } else {
      req.reject(msg.data);
    }
    delete conn.reqs[msg.req];
    break;
  case "msg":
    let observers = conn.observers[msg.ns] ||
      (console.warn("Unknown namespace: ", msg.ns),
       []);
    forEach(observers, function(obs) {
      handler.call(null, obs, msg.data);
    });
    break;
  default:
    console.warn("Unexpected message: ", msg);
    break;
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
      rawSend.apply(null, args);
    }
  } else {
    conn.state("closed");
  }
  forEach(conn.observers, function(arr) {
    forEach(arr, function(obs) {
      return handler.call(null, obs);
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

function rawSend(data) {
  if (CONN.state() === "closed") {
    throw new Error("connection is closed");
  } else if (CONN.socket && CONN.socket.readyState === Sock.OPEN) {
    CONN.socket.send(JSON.stringify(data));
  } else {
    CONN.backlog.push(data);
  }
}

function send(data, namespace) {
  rawSend({type: "msg", ns: namespace, data: data});
}

function request(data, namespace) {
  let deferred = Q.defer(),
      req = ++CONN.reqNum;
  rawSend({type: "req", req: req, ns: namespace, data: data});
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
