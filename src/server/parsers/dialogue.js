"use strict";

let mona = require("mona-parser");

function normalizedText(parser) {
  return mona.map(function(txt) {
    return txt.replace(/\s+/g, ' ');
  }, mona.trim(mona.text(parser)));
}

/**
 * @grammar "(" sws text sws ")"
 * @returns {String}
 */
function parenthetical() {
  return mona.between(mona.string("("),
                      mona.string(")"),
                      normalizedText(
                        mona.unless(mona.and(mona.maybe(mona.spaces()),
                                             mona.string(")")),
                                    mona.token())));
}

function punctuation() {
  return mona.oneOf(".!?;");
}

/**
 * @grammar [punctuation] sws eof
 * @returns {String}
 */
function dialogueEnd() {
  return mona.followedBy(
    mona.trim(mona.or(punctuation(), mona.value("."))),
    mona.eof());
}

/**
 * @grammar text dialogueEnd
 * @returns {String}
 */
function dialogueText() {
  return normalizedText(mona.unless(dialogueEnd(), mona.token()));
}

/**
 * @grammar sws [parenthetical] sws dialogueText dialogueEnd
 * @returns {{parenthetical: String | undefined, dialogue: string}}
 */
function dialogue() {
  return mona.sequence(function(s) {
    let p = s(mona.trim(mona.maybe(parenthetical())));
    let d = s(dialogueText());
    let end = s(dialogueEnd());
    return mona.value({
      parenthetical: p,
      dialogue: d.charAt(0).toUpperCase() + d.slice(1) + end
    });
  });
}

module.exports = dialogue;
