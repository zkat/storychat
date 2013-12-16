"use strict";

let db = require("db"),
    _ = require("lodash");

function create(opts) {
  let q = ("INSERT INTO component_describable"+
           "    (entity_id)"+
           "  VALUES"+
           "    (:entity_id)");
  return db.query(q, opts);
}

function read(opts) {
  let q = ("SELECT id, entity_id FROM component_describable"+
           "  WHERE id = :id");
  return db.query(q, opts).then(_.first);
}

function update(opts) {
  let q = ("UPDATE component_describable"+
           "  SET entity_id = :entity_id"+
           "  WHERE id = :id");
  return db.query(q, opts);
}

function destroy(opts) {
  let q = ("DELETE FROM component_describable WHERE id = :id");
  return db.query(q, opts);
}

function list(opts) {
  let q = ("SELECT id, entity_id FROM component_describable"+
           "  WHERE entity_id = :entity_id");
  return db.query(q, opts);
}

module.exports = {
  create: create,
  read: read,
  update: update,
  destroy: destroy,
  list: list
};
