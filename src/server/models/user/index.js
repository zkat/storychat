"use strict";

let db = require("./db"),
    check = require("check"),
    sanitize = require("validator").sanitize;

function create(email, displayName, password, passwordVerification) {
  email = sanitize(email).trim();
  displayName = sanitize(displayName).trim();
  let v = check();
  v.check(email, "Valid email required").isEmail();
  v.check(displayName, "Display name must be between 4 and 30 chars")
    .len(4, 30);
  v.check(password, "Passwords must be between 6 and 64 chars")
    .len(6, 64);
  v.check(passwordVerification, "Verification must match password")
    .equals(password);
  return v.done().then(function() {
    return db.create(email, displayName, password);
  });
}

function verify(email, password) {
  return db.verify(email, password);
}

module.exports = {
  create: create,
  verify: verify
};
