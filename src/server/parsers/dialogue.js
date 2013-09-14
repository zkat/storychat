/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var mona = require("../mona");

var sws = mona.skipWhitespace();

function parenthetical() {
  return mona.sequence(function(s) {
    s(mona.and(sws, mona.character("("), sws));
    var text = s(
      mona.stringOf(
        mona.zeroOrMore(
          mona.unless(mona.and(sws, mona.character(")")),
                      mona.item()))));
    s(mona.and(sws, mona.character(")")));
    return mona.result(text);
  });
}

function dialogue() {
  return mona.sequence(function(s) {
    var p = s(mona.maybe(parenthetical()));
    s(sws);
    var d = s(mona.text());
    return mona.result({
      parenthetical: p || undefined,
      dialogue: d.trim()
    });
  });
}

module.exports = dialogue;
