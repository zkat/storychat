"use strict";

let {request} = require("../../lib/socketConn"),
    can = require("../../shims/can");

let Character = can.Model.extend({
  create: createCharacter,
  findOne: readCharacter,
  namespace: "character"
}, {});

function createCharacter(character) {
  return request({
    method: "create",
    args: [character.name, character.description]
  }, Character.namespace);
}

function readCharacter(id) {
  return request({
    method: "read",
    args: [id]
  }, Character.namespace);
}

function save(character) {
  return character.save();
}

function makeCharacter(name, description) {
  return new Character({name: name, description: description});
}

module.exports = {
  makeCharacter: makeCharacter,
  save: save
};
