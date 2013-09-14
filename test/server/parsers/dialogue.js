/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var assert = require("assert"),
    dialogueParser = require("../../../src/server/parsers/dialogue")();

function parse(str) {
  return dialogueParser(str);
}

describe("dialogue", function() {
  it("parses plain old dialogue strings into mona results", function() {
    var results = parse("foo bar baz");
    assert.deepEqual([{
      val: {
        dialogue: "foo bar baz",
        parenthetical: undefined
      },
      input: ""
    }], results);
  });
  it("trims whitespace from both ends", function() {
    assert.equal("foo bar", parse("    foo bar")[0].val.dialogue);
    assert.equal("foo bar", parse("foo bar    ")[0].val.dialogue);
    assert.equal("foo bar", parse("    foo bar    ")[0].val.dialogue);
  });
  describe("parenthetical support", function() {
    it("parses parentheticals out of the string", function() {
      var results = parse("(foo) bar baz");
      assert.equal(1, results.length);
      assert.equal("foo", results[0].val.parenthetical);
      assert.equal("bar baz", results[0].val.dialogue);
    });
    function check(sample) {
      var res = parse(sample)[0].val;
      assert.equal("foo bar", res.parenthetical);
      assert.equal("baz quux", res.dialogue);
    }
    it("trims whitespace within the parenthetical", function() {
      check("(   foo bar)baz quux");
      check("(foo bar   )baz quux");
      check("(   foo bar   )baz quux");
    });
    it("trims whitespace before and after the parenthetical", function() {
      check("    (foo bar)baz quux");
      check("(foo bar)    baz quux");
      check("    (foo bar)    baz quux");
    });
  });                                                 
});
