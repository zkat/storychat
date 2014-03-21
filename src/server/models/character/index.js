"use strict";

let db = require("./db"),
    check = require("check"),
    sanitize = require("validator").sanitize;

function create(name, description) {
  return validate(name, description).then(function(clean) {
    return db.create(clean.name, clean.description);
  }).then(function(id) {
    return {id: id};
  });
}

function read(id) {
  return db.read(id);
}

function update(id, name, description) {
  return validate(name, description).then(function(clean) {
    return db.update(id, clean.name, clean.description);
  });
}

function destroy(id) {
  return db.destroy(id);
}

function list() {
  return db.list();
}

function validate(name, description) {
  name = sanitize(name).trim();
  description = sanitize(description).trim();
  let v = check();
  v.check(name, "Character name must be one or two alphabetic words")
    .is(/[a-z]+(:? ?[a-z]+)/i);
  v.check(description, "Description must be 20-200 characters long")
    .len(20, 200);
  return v.done().then(function() {
    return {name: name, description: description};
  });
}

module.exports = {
  create: create,
  read: read,
  update: update,
  destroy: destroy,
  list: list
};
