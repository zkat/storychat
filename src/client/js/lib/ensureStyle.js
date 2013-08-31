/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let insertCss = require("insert-css");

let inserted = {};

function ensureStyle(css) {
  if (!inserted[css]) {
    insertCss(css);
  }
}

module.exports = ensureStyle;
