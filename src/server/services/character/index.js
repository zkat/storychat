"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../../../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let socketServer = require("../../socketServer"),
    onRequest = socketServer.onRequest,
    reply = socketServer.reply,
    reject = socketServer.reject;

let character = require("../../models/character");

let CharacterService = clone();

addMethod(init, [CharacterService], function(svc) {
  console.log("Initializing CharacterService", svc);
});

addMethod(onRequest, [CharacterService], function(svc, data, req) {
  return character[data.method].apply({}, data.args).then(function(val) {
    return reply(req, {data: val});
  }, function fail(err) {
    return reject(req, err);
  });
});

module.exports.service = CharacterService;