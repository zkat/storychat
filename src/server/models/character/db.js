"use strict";

let db = require("db"),
    _ = require("lodash");

function create(name, description) {
  let q = ("INSERT INTO \"character\""+
           "    (name, description)"+
           "  VALUES"+
           "    ($1, $2)"+
           "  RETURNING id");
  return db.query(q, [name, description]);
}

function read(id) {
  let q = ("SELECT id, name, description FROM character"+
           "  WHERE id = $1");
  return db.query(q, [id]).then(_.first);
}

function update(id, name, description) {
  let q = ("UPDATE character SET"+
           "  name = $1,"+
           "  description = $2"+
           "  WHERE id = $3");
  return db.query(q, [name, description, id]);
}

function destroy(id) {
  return db.query("DELETE FROM character WHERE id = $1", [id]);
}

function list() {
  return db.query("SELECT id, name, description FROM character");
}

module.exports = {
  create: create,
  read: read,
  update: update,
  destroy: destroy,
  list: list
};
