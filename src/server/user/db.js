/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let db = require("../db"),
    bcrypt = require("bcrypt"),
    promises = require("node-promise"),
    fs = require("fs"),
    config = JSON.parse(fs.readFileSync(__dirname+"/../../../config/app.json"));

let iterations = 11;

function create(email, displayName, password) {
  let q = ("INSERT INTO \"user\""+
           "    (email, display_name, password)"+
           "  VALUES"+
           "    (:email, :displayName, :password)");
  let deferred = promises.defer();
  bcrypt.hash(password + config.passwordSalt, iterations, function(err, hash) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(hash);
    }
  });
  return deferred.promise.then(function(hash) {
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
  let deferred = promises.defer();
  return db.query(q, {email: email}).then(function(result) {
    let salted = password + config.passwordSalt;
    bcrypt.compare(salted, result[0].password, function(err, res) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(res);
      }
    });
    return deferred.promise;
  });
}

module.exports = {
  create: create,
  verify: verify
};
