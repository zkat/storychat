"use strict";

let {request} = require("../../lib/socketConn"),
    $ = require("jquery"),
    can = require("../../shims/can");

let Character = can.Model.extend({
  create: createCharacter,
  update: updateCharacter,
  findOne: readCharacter,
  findAll: listCharacters,
  destroy: destroyCharacter,
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

function destroyCharacter(id) {
  return request({
    method: "destroy",
    args: [id]
  }, Character.namespace).then(function(val) {
    // XXX HACK - Because CanJS expects these methods to always return a jqXHR
    //            promise, not a standard promise.
    let deferred = $.Deferred();
    deferred.resolve(val);
    return deferred.promise();
  });
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

function destroy(character) {
  return character.destroy();
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
  destroy: destroy,
  list: list
};
