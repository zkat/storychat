"use strict";

let element = require("../../lib/customElement");
let can = require("../../shims/can");

let Play = element.define("home-page", {
  style: require("./styles.styl"),
  template: require("./template.mustache")
});

module.exports.render = function(data) {
  element.install(Play);
  return can.view.mustache("<home-page/>")(data);
};
