"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../../../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let socketServer = require("../../socketServer"),
    onMessage = socketServer.onMessage,
    send = socketServer.send;

let _ = require("lodash");

let character = require("../../models/character");

let CharacterService = clone();

addMethod(init, [CharacterService], function(svc) {
  console.log("Initializing CharacterService", svc);
});

addMethod(onMessage, [CharacterService], function(svc, client, msg) {
  return character[msg.data.method].apply({}, msg.data.args).then(function(id) {
    return send(client, _.extend({}, msg, {data: {id: id}}));
  }, function fail(err) {
    return send(client, _.extend({}, msg, {data: {error: err}}));
  });
});

module.exports.service = CharacterService;
