/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
/* global describe, it, before, afterEach */
"use strict";

var assert = require("assert"),
    user = require("./index"),
    rawDb = require("../db");

describe("user", function() {
  describe("create", function() {
    let email = "testuser1000@example.com",
        displayName =  "Test User 1000",
        password = "testpassword";

    function dieUsersDie(done) {
      rawDb.query("DELETE FROM \"user\" WHERE email LIKE '%example.com'")
        .then(function(){done();}, done);
    }
    before(dieUsersDie);
    afterEach(dieUsersDie);

    it("creates a user entry in the database", function(done) {
      user.create(email, displayName, password, password).then(function(res) {
        let q = "SELECT count(*) FROM \"user\" WHERE email = :email";
        return rawDb.query(q, {email: email});
      }).then(function(result) {
        assert.equal(1, result.length);
        done();
      }, function fail(err) {
        done(err);
      });
    });
    it("checks that the email is valid");
    it("checks that the display name is between 4 and 30 characters");
    it("checks that the password is between 6 and 64 characters");
    it("checks that the password and verification match");
    it("encrypts the password", function(done) {
      user.create(email, displayName, password, password).then(function() {
        let q = "SELECT password FROM \"user\" WHERE email = :email";
        return rawDb.query(q, {email: email});
      }).then(function(result) {
        assert.notEqual(result[0].password, password);
        done();
      }, function fail(err) {
        done(err);
      });
    });
  });
});
