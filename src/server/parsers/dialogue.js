/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let mona = require("../mona");

let sws = mona.skipWhitespace();

/**
 * @grammar "(" sws text sws ")"
 * @returns {String}
 */
function parenthetical() {
  function parenEnd() {
    return mona.and(sws, mona.character(")"));
  }
  return mona.sequence(function(s) {
    s(mona.character("("));
    s(sws);
    let text = s(mona.normalizedText(mona.unless(parenEnd(), mona.item())));
    s(parenEnd());
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
  return mona.normalizedText(mona.unless(dialogueEnd(), mona.item()));
}

/**
 * @grammar sws [parenthetical] sws dialogueText dialogueEnd
 * @returns {{parenthetical: String | undefined, dialogue: string}}
 */
function dialogue() {
  return mona.sequence(function(s) {
    s(sws);
    let p = s(mona.maybe(parenthetical())) || undefined;
    s(sws);
    let d = s(dialogueText());
    let end = s(dialogueEnd());
    return mona.result({
      parenthetical: p,
      dialogue: d.charAt(0).toUpperCase() + d.slice(1) + end
    });
  });
}

module.exports = dialogue;
