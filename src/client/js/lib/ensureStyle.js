"use strict";

let insertCss = require("insert-css");

let inserted = {};

function ensureStyle(css) {
  if (!inserted[css]) {
    insertCss(css);
  }
}

module.exports = ensureStyle;
