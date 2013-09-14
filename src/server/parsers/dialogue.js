/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var mona = require("../mona");

var sws = mona.skipWhitespace();

function parenthetical() {
  return mona.sequence(function(s) {
    s(mona.character("("));
    s(sws);
    var text = s(mona.text(mona.unless(mona.character(")"), mona.item())));
    text = text.trim();
    s(sws);
    s(mona.character(")"));
    return mona.result(text);
  });
}

function dialogue() {
  return mona.sequence(function(s) {
    s(sws);
    var p = s(mona.maybe(parenthetical())) || undefined;
    s(sws);
    var d = s(mona.text()).trim();
    d = d.trim();
    d = d + (d[d.length-1] === "."?"":".");
    s(sws);
    s(mona.endOfInput());
    return mona.result({
      parenthetical: p,
      dialogue: d
    });
  });
}

module.exports = dialogue;
