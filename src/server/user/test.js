/* global describe, it, before, afterEach */
"use strict";

var assert = require("assert"),
    user = require("./index"),
    task = require("../task"),
    rawDb = require("../db");

describe("user", function() {
  describe("create", function() {
    let em = "testuser1000@example.com",
        name =  "Test User 1000",
        pw = "testpassword";

    function dieUsersDie(done) {
      task.spawn(function() {
        task.yield(rawDb.query(
          "DELETE FROM \"user\" WHERE email LIKE '%example.com'"));
        done();
      });
    }
    before(dieUsersDie);
    afterEach(dieUsersDie);

    it("creates a user entry in the database", function(done) {
      task.spawn(function() {
        task.yield(user.create(em, name, pw, pw));
        let q = "SELECT count(*) FROM \"user\" WHERE email = :email",
            result = task.yield(rawDb.query(q, {email: em}));
        assert.equal(1, result.length);
        done();
      });
    });
    it("checks that the email is valid", function(done) {
      task.spawn(function() {
        try {
          task.yield(user.create("notanemail", name, pw, pw));
          assert.fail("Expected user creation to fail",
                      "User creation succeeded");
        } catch(err) {
          assert.equal(err.length, 1);
          assert.equal(err[0], "Valid email required");
          assert.ok(true);
          done();
        }
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
      task.spawn(function() {
        let thirtyOne = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
        try {
          task.yield(user.create(em, "foo", pw, pw));
          unexpectedSuccess();
        } catch(e) {
          expectedFailure(e);
        }
        try {
          task.yield(user.create(em, thirtyOne, pw, pw));
          unexpectedSuccess();
        } catch(e) {
          expectedFailure(e);
        }
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
      task.spawn(function() {
        let sixtyFo = ("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"+
                       "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        try {
          task.yield(user.create(em, name, "foo", "foo"));
          unexpectedSuccess();
        } catch(e) {
          expectedFailure(e);
        }
        try {
          task.yield(user.create(em, name, sixtyFo, sixtyFo));
        } catch(e) {
          expectedFailure(e);
        }
        done();
      });
    });
    it("checks that the password and verification match", function(done) {
      task.spawn(function() {
        try {
          task.yield(user.create(em, name, "passwordA", "passwordB"));
          assert.fail("Expected user creation to fail",
                      "User creation succeeded");
        } catch(err) {
          assert.equal(err.length, 1);
          assert.equal(err[0], "Verification must match password");
        }
        done();
      });
    });
    it("Returns all validation errors at once", function(done) {
      task.spawn(function() {
        try {
          task.yield(user.create("bademail", "nm", "pass", "noma"));
          assert.fail("Expected user creation to fail",
                      "User creation succeeded");
        } catch(err) {
          assert.equal(err.length, 4);
        }
        done();
      });
    });
    it("encrypts the password", function(done) {
      task.spawn(function() {
        task.yield(user.create(em, name, pw, pw));
        let q = "SELECT password FROM \"user\" WHERE email = :email",
            res = task.yield(rawDb.query(q, {email: em}));
        assert.notEqual(res[0].password, pw);
        done();
      });
    });
  });
  describe("verify", function() {
    let em = "testuser1000@example.com",
        name =  "Test User 1000",
        pw = "testpassword";

    function dieUsersDie(done) {
      task.spawn(function() {
        task.yield(rawDb.query(
          "DELETE FROM \"user\" WHERE email LIKE '%example.com'"));
        done();
      });
    }
    before(dieUsersDie);
    afterEach(dieUsersDie);

    it("returns true if the password is correct for this user", function(done) {
      task.spawn(function() {
        task.yield(user.create(em, name, pw, pw));
        assert.ok(task.yield(user.verify(em, pw)));
        done();
      });
    });
    it("returns false if the password is incorrect", function(done) {
      task.spawn(function() {
        task.yield(user.create(em, name, pw, pw));
        assert.ok(!task.yield(user.verify(em, "badpassword")));
        done();
      });
    });
  });
});
