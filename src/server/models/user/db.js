"use strict";

let db = require("db"),
    bcrypt = require("bcrypt"),
    Q = require("q"),
    config = require("config").app;

let hash = Q.denodeify(bcrypt.hash),
    compare = Q.denodeify(bcrypt.compare);

let iterations = 11;

function create(email, displayName, password) {
  let q = ("INSERT INTO \"user\""+
           "    (email, display_name, password)"+
           "  VALUES"+
           "    ($1, $2, $3)"),
      pass = password + config.passwordSecret;
  return hash(pass, iterations).then(function(pwhash) {
    return db.query(q, [email, displayName, pwhash]);
  });
}

function verify(email, password) {
  let q = ("SELECT password FROM \"user\""+
           "  WHERE email = $1");
  return db.query(q, [email]).then(function(result) {
    return compare(password + config.passwordSecret, result[0].password);
  });
}

module.exports = {
  create: create,
  verify: verify
};
