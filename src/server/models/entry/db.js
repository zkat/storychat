"use strict";

let db = require("db"),
    cond = require("cond"),
    _ = require("lodash");

function create(scene, user, character, type, content) {
  /* jshint unused:vars */
  let q = ("INSERT INTO \"entry\""+
           "    (scene_id, user_id, character_id, type, content)"+
           "  VALUES"+
           "    ($1, $2, $3, $4, $5)"+
           "  RETURNING id"),
      lol = [].slice.call(arguments);
  return db.transaction(function(tx) {
    return tx.query(q, lol).then(function(id) {
      let notification = "SELECT pg_notify('create', '" + id[0].id + "')";
      tx.query(notification, []);
      return id;
    });
  });
}

function read(id) {
  let q = ("SELECT id, scene_id, user_id, character_id,"+
           " type, content FROM entry WHERE id = $1");
  return db.query(q, [id]).then(_.first);
}

function update(){
  cond.error("patches welcome");
}

function destroy(id) {
  let q = "DELETE FROM entry WHERE id = $1";
  return db.transaction(function(tx) {
    return tx.query(q, [id]).then(function(count) {
      let notification = "SELECT pg_notify('destroy', '" + id[0].id + "')";
      tx.query(notification, []);
      return count;
    });
  });
}

function list(scene) {
  let q = ("SELECT id, scene_id, user_id, character_id,"+
           "type, content FROM entry"),
      args = [];
  if (scene) {
    q += "   WHERE scene_id = $1";
    args.push(scene);
  }
  return db.query(q, args);
}

function listen(event, callback) {
  return db.connect().then(function(conn) {
    conn.on(event, function(data) {
      callback(data);
    });
  });
}

function unlisten(event, callback) {
  return db.connect().removeListener(event, callback);
}

module.exports = {
  create: create,
  read: read,
  update: update,
  destroy: destroy,
  list: list,
  listen: listen,
  unlisten: unlisten
};
