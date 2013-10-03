/* global describe, it */
"use strict";

var assert = require("assert"),
    mona = require("mona-parser"),
    dialogue = require("./dialogue");

function parse(str) {
  return mona.parse(dialogue(), str);
}

describe("dialogue", function() {
  it("parses plain old dialogue strings into mona results", function() {
    assert.deepEqual(parse("Foo bar baz."), {
      dialogue: "Foo bar baz.",
      parenthetical: undefined
    });
  });
  it("trims whitespace from both ends", function() {
    assert.equal(parse("    Foo bar.").dialogue, "Foo bar.");
    assert.equal(parse("Foo bar.    ").dialogue, "Foo bar.");
    assert.equal(parse("    Foo bar.    ").dialogue, "Foo bar.");
  });
  it("normalizes multiple consecutive whitespaces into one space", function() {
    assert.equal(parse("Foo      bar.").dialogue, "Foo bar.");
    assert.equal(parse("Foo  \n\t\r \nbar.").dialogue, "Foo bar.");
  });
  describe("parenthetical support", function() {
    it("parses parentheticals out of the string", function() {
      var results = parse("(foo) Bar baz.");
      assert.equal(results.parenthetical, "foo");
      assert.equal(results.dialogue, "Bar baz.");
    });
    function check(sample) {
      var res = parse(sample);
      assert.equal(res.parenthetical, "foo bar");
      assert.equal(res.dialogue, "Baz quux.");
    }
    it("trims whitespace within the parenthetical", function() {
      check("(   foo bar)Baz quux.");
      check("(foo bar   )Baz quux.");
      check("(   foo bar   )Baz quux.");
    });
    it("trims whitespace before and after the parenthetical", function() {
      check("    (foo bar)Baz quux.");
      check("(foo bar)    Baz quux.");
      check("    (foo bar)    Baz quux.");
    });
  });
  describe("period auto-insertion", function() {
    it("adds a period to the dialogue if punctuation was missing", function() {
      assert.equal(parse("Foo bar").dialogue, "Foo bar.");
    });
    it("leaves existing punctuation if it was already there", function() {
      function testPunctuation(punc) {
        assert.equal(parse("Foo bar"+punc).dialogue, "Foo bar"+punc);
      }
      [].forEach.call(".!?;", testPunctuation);
    });
    it("adds the period after trimming whitespace", function() {
      assert.equal(parse("Foo bar     ").dialogue, "Foo bar.");
    });
  });
  describe("auto-capitalization", function() {
    it("capitalizes the first letter of the whole dialogue", function() {
      assert.equal(parse("foo bar.").dialogue, "Foo bar.");
    });
    it("capitalizes after left-trim", function() {
      assert.equal(parse("    foo bar.").dialogue, "Foo bar.");
    });
  });
});
