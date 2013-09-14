/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var mona = require("../mona");

function parenthetical() {
  return mona.sequence(function(s) {
    s(mona.and(mona.ws(), mona.character("("), mona.ws()));
    var text = s(
      mona.stringOf(
        mona.zeroOrMore(
          mona.unless(
            mona.and(mona.ws(), mona.character(")")),
            mona.item()))));
    s(mona.and(mona.ws(), mona.character(")")));
    return mona.result(text);
  });
}

function dialogue() {
  return mona.sequence(function(s) {
    var p = s(mona.maybe(parenthetical()));
    s(mona.ws());
    var d = s(mona.stringOf(mona.zeroOrMore(mona.item())));
    return mona.result({ parenthetical: p,
                         dialogue: d });
  });
}

module.exports = dialogue;
