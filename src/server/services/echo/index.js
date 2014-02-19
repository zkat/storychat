"use strict";

let proto = require("proto"),
    clone = proto.clone,
    init = proto.init;

let socketServer = require("../../socketServer"),
    onMessage = socketServer.onMessage,
    broadcast = socketServer.broadcast;

let EchoService = clone();

init.addMethod([EchoService], function(chat) {
  console.log("Initializing EchoService", chat);
});

onMessage.addMethod([EchoService], function(chat, client, msg) {
  console.log("Echoing ", msg);
  broadcast(client, msg);
});

module.exports.service = EchoService;
