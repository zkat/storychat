"use strict";

let db = require("db"),
    _ = require("lodash");

function create(opts) {
  let q = ("INSERT INTO entity"+
           "    (description)"+
           "  VALUES"+
           "    (:description)"+
           "  RETURNING id");
  return db.query(q, opts);
}

function read(opts) {
  let q = ("SELECT id, description FROM entity"+
           "  WHERE id = :id");
  return db.query(q, opts).then(_.first);
}

function update(opts) {
  let q = ("UPDATE entity SET"+
           "    description = :description"+
           "  WHERE id = :id");
  return db.query(q, opts);
}

function destroy(opts) {
  let q = ("DELETE FROM entity WHERE id = :id");
  return db.query(q, opts);
}

function list(opts) {
  let q = ("SELECT id, description FROM entity");
  return db.query(q, opts);
}

module.exports = {
  create: create,
  read: read,
  update: update,
  destroy: destroy,
  list: list
};
