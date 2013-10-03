/* global describe, it */
"use strict";

var assert = require("assert"),
    parser = require("./index");

describe("parser", function() {
  describe("parse", function() {
    it("Parses a string into a results object, given a valid type", function() {
      assert.deepEqual(parser.parse("dialogue", "(foo) Bar."), {
        parenthetical: "foo",
        dialogue: "Bar."
      });
    });
    it("Returns an empty object if no parser is defined", function() {
      // TODO - test that this actually does a log message.
      assert.deepEqual(parser.parse("NO_SUCH_TYPE", "foo"), {});
    });
  });
});
