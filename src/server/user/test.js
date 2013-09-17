/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
/* global describe, it, before, afterEach */
"use strict";

var assert = require("assert"),
    user = require("./index"),
    promises = require("node-promise"),
    rawDb = require("../db");

describe("user", function() {
  describe("create", function() {
    let em = "testuser1000@example.com",
        name =  "Test User 1000",
        pw = "testpassword";

    function dieUsersDie(done) {
      rawDb.query("DELETE FROM \"user\" WHERE email LIKE '%example.com'")
        .then(function(){done();}, done);
    }
    before(dieUsersDie);
    afterEach(dieUsersDie);

    it("creates a user entry in the database", function(done) {
      user.create(em, name, pw, pw).then(function(res) {
        let q = "SELECT count(*) FROM \"user\" WHERE email = :email";
        return rawDb.query(q, {email: em});
      }).then(function(result) {
        assert.equal(1, result.length);
        done();
      }, function fail(err) {
        done(err);
      });
    });
    it("checks that the email is valid", function(done) {
      user.create("notanemail", name, pw, pw).then(function(res) {
        assert.fail("Expected user creation to fail",
                    "User creation succeeded");
        done();
      }, function fail(err) {
        assert.equal(err.length, 1);
        assert.equal(err[0], "Valid email required");
        assert.ok(true);
        done();
      });
    });
    it("checks that display name is between 4 and 30 chars", function(done) {
      function unexpectedSuccess() {
        assert.fail("Expected user creation to fail",
                    "User creation succeeded");
      }
      function expectedFailure(err) {
        assert.equal(err.length, 1);
        assert.equal(err[0], "Display name must be between 4 and 30 chars");
      }
      let thirtyOne = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          shortName = user.create(em, "foo", pw, pw),
          longName = user.create(em, thirtyOne, pw, pw);
      shortName.then(unexpectedSuccess, expectedFailure);
      longName.then(unexpectedSuccess, expectedFailure);
      promises.all(shortName, longName).then(function() {
        done();
      }, function(err) {
        done();
      });
    });
    it("checks that the password is between 6 and 64 chars", function(done) {
      function unexpectedSuccess() {
        assert.fail("Expected user creation to fail",
                    "User creation succeeded");
      }
      function expectedFailure(err) {
        assert.equal(err.length, 1);
        assert.equal(err[0], "Passwords must be between 6 and 64 chars");
      }
      let sixtyFo = ("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"+
                     "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
          shortPass = user.create(em, name, "foo", "foo"),
          longPass = user.create(em, name, sixtyFo, sixtyFo);
      shortPass.then(unexpectedSuccess, expectedFailure);
      longPass.then(unexpectedSuccess, expectedFailure);
      promises.all(shortPass, longPass).then(function() {
        done();
      }, function(err) {
        done();
      });
    });
    it("checks that the password and verification match", function(done) {
      user.create(em, name, "passwordA", "passwordB").then(function() {
        assert.fail("Expected user creation to fail",
                    "User creation succeeded");
        done();
      }, function(err) {
        assert.equal(err.length, 1);
        assert.equal(err[0], "Verification must match password");
        done();
      });
    });
    it("Returns all validation errors at once", function(done) {
      user.create("bademail", "nm", "pass", "noma").then(function() {
        assert.fail("Expected user creation to fail",
                    "User creation succeeded");
        done();
      }, function(err) {
        assert.equal(err.length, 4);
        done();
      });
    });
    it("encrypts the password", function(done) {
      user.create(em, name, pw, pw).then(function() {
        let q = "SELECT password FROM \"user\" WHERE email = :email";
        return rawDb.query(q, {email: em});
      }).then(function(result) {
        assert.notEqual(result[0].password, pw);
        done();
      }, function fail(err) {
        done(err);
      });
    });
  });
  describe("verify", function() {
    let em = "testuser1000@example.com",
        name =  "Test User 1000",
        pw = "testpassword";

    function dieUsersDie(done) {
      rawDb.query("DELETE FROM \"user\" WHERE email LIKE '%example.com'")
        .then(function(){done();}, done);
    }
    before(dieUsersDie);
    afterEach(dieUsersDie);

    it("returns true if the password is correct for this user", function(done) {
      user.create(em, name, pw, pw).then(function() {
        return user.verify(em, pw);
      }).then(function(verified) {
        assert.ok(verified);
        done();
      }, function(err) { done(err); });
    });
    it("returns false if the password is incorrect for this user", function(done) {
      user.create(em, name, pw, pw).then(function() {
        return user.verify(em, "badpassword");
      }).then(function(verified) {
        assert.ok(!verified);
        done();
      }, function(err) { done(err); });
    });
  });
});
