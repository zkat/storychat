"use strict";

let {extend} = require("lodash");
let element = require("../../lib/customElement");
let can = require("../../shims/can");

/*
 * Components
 */
require("../../components/characterEditor").install();

/*
 * Page
 */
let Character = element.define("character-page", {
  style: require("./styles.styl"),
  template: require("./template.mustache")
});

module.exports.render = function(data) {
  element.install(Character);
  return can.view.mustache("<character-page/>")(data);
};
