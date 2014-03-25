"use strict";

let db = require("./db");

/*
 TODO:
* scene validation - only allow creating entries in a currently running scene
* user validation - verify user's login (or session key?)
* char validation - verify that the user controls that char in this scene
* type validation - is this input type appropriate at this point in the scene?
*/

module.exports = {
  create: db.create,
  read: db.read,
  destroy: db.destroy,
  list: db.list,
  listen: db.listen,
  unlisten: db.unlisten
};
