"use strict";

let Genfun = require("genfun"),
    addMethod = Genfun.addMethod,
    proto = require("../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let _ = require("lodash"),
    each = _.each,
    partial = _.partial,
    without = _.without;

let Sockjs = require("sockjs");

/**
 * Handles websocket-ish connections from storychat clients and takes care
 * of multiplexing messages to their respective handlers.
 */
let SocketServer = clone();

addMethod(init, [SocketServer], function(srv, http, opts) {
  srv.connections = [];
  srv.services = opts.services;
  initSocket(srv, http, opts);
});

function initSocket(srv, http, opts) {
  console.log("Initializing socketServer");
  srv.socket = Sockjs.createServer();
  srv.socket.on("connection", partial(onConnection, srv));
  srv.socket.installHandlers(http, opts);
}

function onConnection(srv, conn) {
  console.log("Received connection from "+conn.remoteAddress+".");
  // TODO - wait to push until the client has been verified.
  conn.once("data", function(auth) {
    if (validAuth(srv, conn, auth)) {
      srv.connections.push(conn);
      initConn(srv, conn);
    } else {
      conn.write("Invalid auth");
      conn.end();
    }
  });
}

function validAuth(srv, conn, auth) {
  return auth === "letmein";
}

function initConn(srv, conn) {
  conn.server = srv;
  conn.on("data", partial(onClientMessage, srv, conn));
  conn.on("close", partial(onClientClose, srv, conn));
}

let onMessage = new Genfun();
addMethod(onMessage, [], function() {});

function onClientMessage(srv, conn, msg) {
  try {
    let json = JSON.parse(msg),
        service = srv.services[json.namespace];
    if (service) {
      onMessage(service, conn, json);
    } else {
      throw new Error("Invalid service: "+json.namespace);
    }
  } catch (e) {
    console.error("An error occurred while processing socket message:", {
      error: e,
      input: msg
    });
  }
}

function onClientClose(srv, conn) {
  console.log("Client at "+conn.remoteAddress+" disconnected.");
  srv.connections = without(srv.connections, conn);
}

function send(conn, data) {
  conn.write(JSON.stringify(data));
}

function broadcast(server, data) {
  each(server.connections, function(conn) {
    send(conn, data);
  });
}

function broadcastFrom(srcConn, data) {
  each(srcConn.server.connections, function(conn) {
    if (srcConn !== conn) {
      send(conn, data);
    }
  });
}

module.exports = {
  SocketServer: SocketServer,
  onMessage: onMessage,
  send: send,
  broadcast: broadcast,
  broadcastFrom: broadcastFrom
};
