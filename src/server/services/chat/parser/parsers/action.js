"use strict";

let mona = require("mona-parser");

function normalizedText(parser) {
  return mona.map(function(txt) {
    return txt.replace(/\s+/g, " ");
  }, mona.trim(mona.text(parser)));
}

function punctuation() {
  return mona.oneOf(".!?;");
}

/**
 * @grammar [punctuation] sws eof
 * @returns {String}
 */
function actionEnd() {
  return mona.followedBy(
    mona.trim(mona.or(punctuation(), mona.value("."))),
    mona.eof());
}

/**
 * @grammar text actionEnd
 * @returns {String}
 */
function actionText() {
  return normalizedText(mona.unless(actionEnd(), mona.token()));
}

/**
 * @grammar sws [parenthetical] sws actionText actionEnd
 * @returns {{action: String}}
 */
function action() {
  return mona.sequence(function(s) {
    let a = s(actionText());
    let end = s(actionEnd());
    return mona.value({
      action: a + end
    });
  });
}

module.exports = action;
