/* global describe, it */
"use strict";

var assert = require("assert"),
    dialogueParser = require("./dialogue")();

function parse(str) {
  return dialogueParser(str);
}

describe("dialogue", function() {
  it("parses plain old dialogue strings into mona results", function() {
    var results = parse("Foo bar baz.");
    assert.deepEqual([{
      val: {
        dialogue: "Foo bar baz.",
        parenthetical: undefined
      },
      input: ""
    }], results);
  });
  it("trims whitespace from both ends", function() {
    assert.equal("Foo bar.", parse("    Foo bar.")[0].val.dialogue);
    assert.equal("Foo bar.", parse("Foo bar.    ")[0].val.dialogue);
    assert.equal("Foo bar.", parse("    Foo bar.    ")[0].val.dialogue);
  });
  it("normalizes multiple consecutive whitespaces into one space", function() {
    assert.equal("Foo bar.", parse("Foo      bar.")[0].val.dialogue);
    assert.equal("Foo bar.", parse("Foo  \n\t\r \nbar.")[0].val.dialogue);
  });
  describe("parenthetical support", function() {
    it("parses parentheticals out of the string", function() {
      var results = parse("(foo) Bar baz.");
      assert.equal(1, results.length);
      assert.equal("foo", results[0].val.parenthetical);
      assert.equal("Bar baz.", results[0].val.dialogue);
    });
    function check(sample) {
      var res = parse(sample)[0].val;
      assert.equal("foo bar", res.parenthetical);
      assert.equal("Baz quux.", res.dialogue);
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
      assert.equal("Foo bar.", parse("Foo bar")[0].val.dialogue);
    });
    it("leaves existing punctuation if it was already there", function() {
      function testPunctuation(punc) {
        assert.equal("Foo bar"+punc, parse("Foo bar"+punc)[0].val.dialogue);
      }
      [].forEach.call(".!?;", testPunctuation);
    });
    it("adds the period after trimming whitespace", function() {
      assert.equal("Foo bar.", parse("Foo bar     ")[0].val.dialogue);
    });
  });
  describe("auto-capitalization", function() {
    it("capitalizes the first letter of the whole dialogue", function() {
      assert.equal("Foo bar.", parse("foo bar.")[0].val.dialogue);
    });
    it("capitalizes after left-trim", function() {
      assert.equal("Foo bar.", parse("    foo bar.")[0].val.dialogue);
    });
  });
});
