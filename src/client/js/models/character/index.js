"use strict";

let {request} = require("../../lib/socketConn"),
    q = require("q"),
    $ = require("jquery"),
    can = require("can");

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
  }, Character.namespace).then(function(data) {
    return data.data;
  });
}

function destroyCharacter(id) {
  // XXX HACK - Because CanJS expects these methods to always return a jqXHR
  //            promise, not a standard promise.
  let deferred = $.Deferred();
  request({
    method: "destroy",
    args: [id]
  }, Character.namespace).then(function(val) {
    deferred.resolve(val);
  });
  return deferred.promise();
}

function listCharacters() {
  return request({
    method: "list",
    args: []
  }, Character.namespace);
}

function save(character) {
  return q(character.save());
}

function read(id) {
  return q(Character.findOne(id));
}

function destroy(character) {
  return q(character.destroy());
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
  read: read,
  destroy: destroy,
  list: list
};
