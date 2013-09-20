"use strict";

let db = require("../db"),
    bcrypt = require("bcrypt"),
    Q = require("q"),
    fs = require("fs"),
    config = JSON.parse(fs.readFileSync(__dirname+"/../../../config/app.json"));

let hash = Q.denodeify(bcrypt.hash),
    compare = Q.denodeify(bcrypt.compare);

let iterations = 11;

function create(email, displayName, password) {
  let q = ("INSERT INTO \"user\""+
           "    (email, display_name, password)"+
           "  VALUES"+
           "    (:email, :displayName, :password)"),
      pass = password + config.passwordSecret;
  return hash(pass, iterations).then(function(hash) {
    return db.query(q, {
      email: email,
      displayName: displayName,
      password: hash
    });
  });
}

function verify(email, password) {
  let q = ("SELECT password FROM \"user\""+
           "  WHERE email = :email");
  return db.query(q, {email: email}).then(function(result) {
    return compare(password + config.passwordSecret, result[0].password);
  });
}

module.exports = {
  create: create,
  verify: verify
};
