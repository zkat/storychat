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
  }).then(function(x) { return x.id; });
}

function read(id) {
  let q = ("SELECT id, name, description FROM character"+
           "  WHERE id = :id");
  return db.query(q, {id: id}).then(_.first);
}

module.exports = {
  create: create,
  read: read
};
