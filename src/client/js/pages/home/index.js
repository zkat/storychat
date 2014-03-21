"use strict";

let element = require("customElement");
let can = require("can");

let Home = element.define("home-page", {
  style: require("./styles.styl"),
  template: require("./template.mustache")
});

module.exports.render = function(data) {
  element.install(Home);
  return can.view.mustache("<home-page/>")(data);
};
