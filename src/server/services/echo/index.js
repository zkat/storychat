"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../../../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let socketServer = require("../../socketServer"),
    onMessage = socketServer.onMessage,
    broadcast = socketServer.broadcast;

let EchoService = clone();

addMethod(init, [EchoService], function(chat) {
  console.log("Initializing EchoService", chat);
});

addMethod(onMessage, [EchoService], function(chat, client, msg) {
  console.log("Echoing ", msg);
  broadcast(client, msg);
});

module.exports.service = EchoService;
