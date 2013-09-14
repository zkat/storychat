/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var mona = require("./mona");

var parsers = {
  dialogue: require("./parsers/dialogue")()
};

function parse(type, content) {
  var parser = parsers[type];
  if (!parser) { throw new Error("No parser for type "+type); }
  return mona.run(parser, content).val;
}

module.exports.parse = parse;
