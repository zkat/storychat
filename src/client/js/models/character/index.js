"use strict";

let {request} = require("../../lib/socketConn"),
    can = require("../../shims/can");

let Character = can.Model.extend({
  create: createCharacter,
  update: updateCharacter,
  findOne: readCharacter,
  findAll: listCharacters,
  namespace: "character"
}, {});

function createCharacter(character) {
  return request({
    method: "create",
    args: [character.name, character.description]
  }, Character.namespace);
}

function updateCharacter(id, character) {
  return request({
    method: "update",
    args: [id, character.name, character.description]
  }, Character.namespace);
}

function readCharacter(id) {
  return request({
    method: "read",
    args: [id]
  }, Character.namespace);
}

function listCharacters() {
  return request({
    method: "list",
    args: []
  }, Character.namespace);
}

function save(character) {
  return character.save();
}

function list() {
  return new Character.List({});
}

function makeCharacter(name, description) {
  return new Character({name: name, description: description});
}

module.exports = {
  makeCharacter: makeCharacter,
  save: save,
  list: list
};
