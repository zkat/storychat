"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let _ = require("lodash"),
    each = _.each,
    partial = _.partial,
    without = _.without;

let Sockjs = require("sockjs");

let chatParser = require("./services/chat/parser");

/**
 * Handles websocket-ish connections from storychat clients and takes care
 * of multiplexing messages to their respective handlers.
 */
let SocketServer = clone();

addMethod(init, [SocketServer], function(srv, http, opts) {
  srv.connections = [];
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
  conn.on("data", partial(onClientMessage, srv, conn));
  conn.on("close", partial(onClientClose, srv, conn));
}

function onClientMessage(srv, conn, msg) {
  try {
    let json = JSON.parse(msg);
    json.data.parsedContent = chatParser.parse(json.data.entryType,
                                               json.data.content);
    let output = JSON.stringify(json);
    each(srv.connections, function(conn) {
      // TODO - what happens if a conn is disconnected and we try to
      //        write to it? Is there a race condition here or can I
      //        assume a write will always succeed?
      conn.write(output);
    });
  } catch (e) {
    console.error("An error occurred while processing user input.", {
      error: e,
      input: msg
    });
  }
}

function onClientClose(srv, conn) {
  console.log("Client at "+conn.remoteAddress+" disconnected.");
  srv.connections = without(srv.connections, conn);
}

module.exports.SocketServer = SocketServer;
