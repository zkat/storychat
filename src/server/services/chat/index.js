"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../../../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let _ = require("lodash"),
    each = _.each;

let socketServer = require("../../socketServer"),
    onMessage = socketServer.onMessage,
    send = socketServer.send;

let parser = require("./parser");

let ChatService = clone();

addMethod(init, [ChatService], function(chat) {
  console.log("Initializing ChatService", chat);
});

addMethod(onMessage, [ChatService], function(chat, name, srv, conn, data) {
  data.parsedContent = parser.parse(data.entryType, data.content);
  each(srv.connections, function(conn) {
    send(conn, {namespace: name, data: data});
  });
});

module.exports.service = ChatService;
