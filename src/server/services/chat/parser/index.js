"use strict";

var mona = require("mona-parser");

var parsers = {
  dialogue: require("./parsers/dialogue")(),
  action: require("./parsers/action")()
};

function parse(type, content) {
  var parser = parsers[type];
  if (!parser) { console.warn("No parser for type "+type); return {}; }
  return mona.parse(parser, content);
}

module.exports.parse = parse;
