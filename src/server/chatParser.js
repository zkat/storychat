"use strict";

var mona = require("./mona");

var parsers = {
  dialogue: require("./parsers/dialogue")()
};

function parse(type, content) {
  var parser = parsers[type];
  if (!parser) { console.warn("No parser for type "+type); return {}; }
  return mona.run(parser, content).val;
}

module.exports.parse = parse;
