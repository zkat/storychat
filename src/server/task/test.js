/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
/* global describe, it */
"use strict";

var assert = require("assert"),
    task = require("./index"),
    promises = require("node-promise");

describe("task", function() {
  describe("spawn", function() {
    it("executes a function", function(done) {
      let called = false;
      task.spawn(function() {
        called = true;
        assert.ok(called);
        done();
      });
      setTimeout(function() {
        if (!called) {
          done("fail");
        }
      }, 1000);
    });
    it("returns a promise", function(done) {
      task.spawn(function() {
        return "hey there";
      }).then(function(val) {
        assert.equal(val, "hey there");
        done();
      }, function(err) {
        done(err);
      });
    });
    it("rejects the promise if there's an error", function(done) {
      task.spawn(function() {
        throw "fail";
      }).then(function() {
        done("was supposed to die");
      }, function(err) {
        assert.equal(err, "fail");
        done();
      });
    });
  });
  describe("yield", function() {
    it("returns the given value and runs the continuation", function(done) {
      let val = false;
      task.spawn(function() {
        val = task.yield("foo");
        assert.equal(val, "foo");
        done();
      });
      setTimeout(function() {
        if (!val) { done("didn't run :<"); }
      }, 1000);
    });
    it("waits for a promise if given one as an argument", function(done) {
      let deferred = promises.defer(),
          result = false;
      task.spawn(function() {
        result = task.yield(deferred.promise);
        assert.equal(result, "success");
        done();
      });
      deferred.resolve("success");
      setTimeout(function() {
        if (!result) { done("didn't run :<"); }
      }, 1000);
    });
    it("throws an error in the task if a promise fails", function(done) {
      let deferred = promises.defer(),
          ran = false;
      task.spawn(function() {
        try {
          task.yield(deferred.promise);
          done("fail!");
        } catch(e) {
          assert.equal(e, "rejected");
          done();
        }
        ran = true;
      });
      deferred.reject("rejected");
      setTimeout(function() {
        if (!ran) { done("didn't run :<"); }
      }, 1000);
    });
  });
  describe("wrap", function() {
    it("wraps a function with yield", function(done) {
      let deferred = promises.defer(),
          frob = task.wrap(function() { return deferred.promise; });
      task.spawn(function() {
        assert.equal(frob(), "success!");
        done();
      });
      deferred.resolve("success!");
    });
  });
  describe("isInTask", function() {
    it("returns true if called in the context of a task", function(done) {
      task.spawn(function() {
        assert.ok(task.yield(task.isInTask()));
        done();
      });
      assert.ok(!task.isInTask());
    });
  });
});
