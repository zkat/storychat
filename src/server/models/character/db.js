"use strict";

let db = require("db"),
    _ = require("lodash");

function create(name, description) {
  let q = ("INSERT INTO \"character\""+
           "    (name, description)"+
           "  VALUES"+
           "    (:name, :description)"+
           "  RETURNING id");
  return db.query(q, {
    name: name,
    description: description
  });
}

function read(id) {
  let q = ("SELECT id, name, description FROM character"+
           "  WHERE id = :id");
  return db.query(q, {id: id}).then(_.first);
}

function update(id, name, description) {
  let q = ("UPDATE character SET"+
           "  name = :name,"+
           "  description = :description"+
           "  WHERE id = :id");
  return db.query(q, {
    id: id,
    name: name,
    description: description
  });
}

function destroy(id) {
  return db.query("DELETE FROM character WHERE id = :id", {id: id});
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
