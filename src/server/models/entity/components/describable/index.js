"use strict";

let db = require("./db");

module.exports = {
  create: db.create,
  read: db.read,
  update: db.update,
  destroy: db.destroy,
  list: db.list
};
