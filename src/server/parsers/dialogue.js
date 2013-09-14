/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var mona = require("../mona");

var sws = mona.skipWhitespace();

/**
 * @grammar "(" sws text sws ")"
 * @returns {String}
 */
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

function punctuation() {
  return mona.oneOf(".!?;");
}

/**
 * @grammar [punctuation] sws eof
 * @returns {String}
 */
function dialogueEnd() {
  return mona.prog1(mona.or(punctuation(), mona.result(".")),
                    sws,
                    mona.endOfInput());
}

/**
 * @grammar text dialogueEnd
 * @returns {String}
 */
function dialogueText() {
  return mona.text(mona.unless(dialogueEnd(), mona.item()));
}

/**
 * @grammar sws [parenthetical] sws dialogueText dialogueEnd
 * @returns {{parenthetical: String | undefined, dialogue: string}}
 */
function dialogue() {
  return mona.sequence(function(s) {
    s(sws);
    var p = s(mona.maybe(parenthetical())) || undefined;
    s(sws);
    var d = s(dialogueText());
    var end = s(dialogueEnd());
    return mona.result({
      parenthetical: p,
      dialogue: d + end
    });
  });
}

module.exports = dialogue;
