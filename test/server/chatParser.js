/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var assert = require("assert"),
    chatParser = require("../../src/server/chatParser");

describe("chatParser", function() {
  describe("parse", function() {
    it("Parses a string into a results object, given a valid type", function() {
      assert.deepEqual({
        parenthetical: "foo",
        dialogue: "bar"
      }, chatParser.parse("dialogue", "(foo) bar"));
      assert.throws(function() { chatParser.parse("NO_SUCH_TYPE", "foo"); });
    });
  });
});
