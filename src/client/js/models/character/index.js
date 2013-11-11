"use strict";

let {onOpen,onMessage,onClose,listen,send} = require("../../lib/socketConn"),
    {clone, init} = require("../../lib/proto"),
    {addMethod} = require("genfun"),
    can = require("../../shims/can");

let Character = can.Model.extend({
  create: createCharacter,
  findOne: readCharacter
}, {
  setup: characterSetup
});

function makeCharacter(conn, namespace, name, description) {
  return new Character({name: name, description: description});
}

function save(character, conn, namespace) {
  return character.save({conn: conn, namespace: namespace});
}

module.exports.makeCharacter = makeCharacter;
