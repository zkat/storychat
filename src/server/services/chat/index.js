"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../../../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let socketServer = require("../../socketServer"),
    onMessage = socketServer.onMessage,
    broadcast = socketServer.broadcast;

let parser = require("./parser");

let ChatService = clone();

addMethod(init, [ChatService], function(chat) {
  console.log("Initializing ChatService", chat);
});

addMethod(onMessage, [ChatService], function(chat, client, msg) {
  msg.data.parsedContent = parser.parse(msg.data.entryType,
                                            msg.data.content);
  broadcast(client, msg);
});

module.exports.service = ChatService;
