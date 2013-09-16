/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let db = require("./db"),
    check = require("validator").check,
    sanitize = require("validator").sanitize;

function create(email, displayName, password, passwordVerification) {
  email = sanitize(email).trim();
  displayName = sanitize(displayName).trim();
  check(email).isEmail();
  check(displayName).len(4, 30);
  check(password).len(6, 64).equals(passwordVerification);
  return db.create(email, displayName, password);
}

module.exports = {
  create: create
};
