"use strict";

require("sockjs");
let Sock = window.SockJS,
    Genfun = require("genfun"),
    can = require("can"),
    $ = require("jquery"),
    {clone, init} = require("proto"),
    {partial, forEach, contains, without} = require("lodash"),
    cond = require("cond"),
    Q = require("q");

let MAX_RECONNECT_ATTEMPTS = 100;
let INITIAL_RECONNECT_DELAY = 500;

let SocketConn = clone(),
    onMessage = new Genfun();
onMessage.addMethod([], function() {});

init.addMethod([SocketConn], function(conn) {
  conn.authUrl =
    window.location.protocol + "//" + window.location.host + "/wsauth";
  conn.state = can.compute("connecting");
  conn.observers = {};
  conn.reqNum = 0;
  conn.reqs = {};
  conn.backlog = [];
  conn.reconnectAttempts = 0;
  conn.opts = {};
  initSock(conn);
});

function initSock(conn) {
  return $.get(conn.authUrl, function(resp) {
    if (conn.state() === "closed") { return; }
    conn.url = resp.data.wsUrl;
    conn.auth = resp.data.auth;
    conn.socket = new Sock(conn.url, null, conn.opts);
    conn.socket.onopen = partial(handleOpen, conn);
    conn.socket.onmessage = partial(handleMessage, conn, onMessage);
    conn.socket.onclose = partial(tryReconnect, conn);
  }).fail(partial(tryReconnect, conn));
}

// We have a singleton connection we reuse everywhere.
let CONN = clone(SocketConn);

function handleOpen(conn) {
  conn.reconnectAttempts = 0;
  conn.socket.send(conn.auth);
  conn.state("open");
  let oldMsg;
  while ((conn.socket.readyState === Sock.OPEN) &&
         (oldMsg = conn.backlog.shift())) {
    rawSend(oldMsg);
  }
}

function tryReconnect(conn) {
  if (conn.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    conn.reconnectAttempts++;
    conn.state("reconnecting");
    window.setTimeout(function() {
      initSock(conn);
    }, conn.reconnectAttempts * INITIAL_RECONNECT_DELAY);
  } else {
    conn.state("closed");
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
    // TODO - provide "reconnect" recovery.
    cond.error("connection is closed");
  } else if (CONN.socket && CONN.socket.readyState === Sock.OPEN) {
    let json = JSON.stringify(data);
    CONN.socket.send(json);
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

function reconnect() {
  if (CONN.state() !== "open") {
    CONN.reconnectAttempts = 0;
    tryReconnect(CONN);
  }
}

module.exports = {
  conn: CONN,
  onMessage: onMessage,
  listen: listen,
  unlisten: unlisten,
  send: send,
  request: request,
  reconnect: reconnect
};
