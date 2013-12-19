"use strict";

let proto = require("../../../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let socketServer = require("../../socketServer"),
    onMessage = socketServer.onMessage,
    broadcast = socketServer.broadcast;

let _ = require("lodash");

let parser = require("./parser");

let ChatService = clone();

init.addMethod([ChatService], function(chat) {
  console.log("Initializing ChatService", chat);
});

onMessage.addMethod([ChatService], function(chat, data, info) {
  broadcast(info.from, _.extend({
    parsedContent: parser.parse(data.entryType, data.content)
  }, data), info.namespace);
});

module.exports.service = ChatService;
