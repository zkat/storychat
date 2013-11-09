/* global describe, it, before, afterEach */
"use strict";

var assert = require("assert"),
    character = require("./index"),
    task = require("task"),
    rawDb = require("db");

describe("character", function() {

  describe("create", function() {
    let name = "Ashtest",
        desc = "This is a pretty bland description.";

    function killCharacters(done) {
      task.spawn(function() {
        task.yield(rawDb.query(
          "DELETE FROM character WHERE name LIKE '%test'"));
        done();
      });
    }
    before(killCharacters);
    afterEach(killCharacters);

    it("creates a new character in the database", function(done) {
      task.spawn(function() {
        let ret = task.yield(character.create(name, desc)),
            q = "SELECT count(*) FROM character WHERE id = :id",
            result = task.yield(rawDb.query(q, {id: ret.id}));
        assert.equal(result.length, 1);
        done();
      }).fail(done);
    });
  });

  describe("read", function() {
    let name = "Ashtest",
        desc = "This is a pretty bland description.";

    function killCharacters(done) {
      task.spawn(function() {
        task.yield(rawDb.query(
          "DELETE FROM character WHERE name LIKE '%test'"));
        done();
      }).fail(done);
    }
    before(killCharacters);
    afterEach(killCharacters);

    it("reads the character row and returns it as an object", function(done) {
      task.spawn(function() {
        let ret = task.yield(character.create(name, desc));
        assert.deepEqual(task.yield(character.read(ret.id)), {
          id: ret.id,
          name: name,
          description: desc
        });
        done();
      }).fail(done);
    });
  });

});
