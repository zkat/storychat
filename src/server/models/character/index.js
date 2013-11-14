"use strict";

let db = require("./db"),
    check = require("../../util/check"),
    sanitize = require("validator").sanitize;

function create(name, description) {
  name = sanitize(name).trim();
  description = sanitize(description).trim();
  let v = check();
  v.check(name, "Character name must be one or two alphabetic words")
    .is(/[a-z]+(:? ?[a-z]+)/i);
  v.check(description, "Description must be 20-200 characters long")
    .len(20, 200);
  return v.done().then(function() {
    return db.create(name, description);
  });
}

function read(id) {
  return db.read(id);
}

function list() {
  return db.list();
}

module.exports = {
  create: create,
  read: read,
  list: list
};
