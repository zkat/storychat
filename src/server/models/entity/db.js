"use strict";

let db = require("db"),
    _ = require("lodash");

function create(opts) {
  let q = ("INSERT INTO entity"+
           "    (description)"+
           "  VALUES"+
           "    ($1)"+
           "  RETURNING id");
  return db.query(q, [opts.description]);
}

function read(opts) {
  let q = ("SELECT id, description FROM entity"+
           "  WHERE id = $1");
  return db.query(q, [opts.id]).then(_.first);
}

function update(opts) {
  let q = ("UPDATE entity SET"+
           "    description = $1"+
           "  WHERE id = $2");
  return db.query(q, [opts.description, opts.id]);
}

function destroy(opts) {
  let q = ("DELETE FROM entity WHERE id = $1");
  return db.query(q, [opts.id]);
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
