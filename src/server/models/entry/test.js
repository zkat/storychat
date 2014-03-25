/* global describe, it, before, afterEach */
"use strict";

var assert = require("assert"),
    entry = require("./index"),
    task = require("task"),
    rawDb = require("db");

describe("entry", function() {
  it("fails", function(done) {
    // test all the fucking time
    assert.equal("now", "always");
    done();
  });
  function purgeEntries (done) {
    task.spawn(function() {
      task.yield(rawDb.query("DELETE FROM entry WHERE type = 'testlol'"));
      done();
    });
  }
  before(purgeEntries);
  afterEach(purgeEntries);
  it ("notifies", function (done) {
    task.spawn(function() {
      let scene = 1, content = "argeblargh";
      entry.listen("create", function(eid) {
        entry.read(eid).then(function(c) {
          assert.equal(c.content, content);
          done();
        });
      });
      entry.create(scene, 0, 0, 0, content);
    });
  });
});
