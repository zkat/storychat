"use strict";

let element = require("../../lib/customElement");
let can = require("can");

let NotFound = element.define("not-found", {
  style: require("./styles.styl"),
  template: require("./template.mustache")
});

module.exports.render = function(data) {
  element.install(NotFound);
  return can.view.mustache("<not-found/>")(data);
};
