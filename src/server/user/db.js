/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let db = require("../db"),
    fs = require("fs"),
    config = JSON.parse(fs.readFileSync(__dirname+"/../../../config/app.json"));

let bfIterations = 9;

function create(email, displayName, password) {
  let q = ("INSERT INTO \"user\" (email, display_name, password)"+
           "  VALUES (:email,"+
           "          :displayName,"+
           "          crypt(:password, gen_salt('bf', :iterations)))");
  return db.query(q, {
    email: email,
    displayName: displayName,
    password: password + config.passwordSalt,
    iterations: bfIterations
  });
}

module.exports = {
  create: create
};
