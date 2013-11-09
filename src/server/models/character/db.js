"use strict";

let db = require("db"),
    Q = require("q");

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
  let q = ("SELECT * FROM character"+
           "  WHERE id = :id");
  return db.query(q, {id: id}).then(function(x) { return x[0]; });
}

module.exports = {
  create: create,
  read: read
};
