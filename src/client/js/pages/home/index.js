"use strict";

let {Chatlog} = require("../../models/chatlog");
let {clone} = require("../../lib/proto");
let {extend} = require("lodash");
let element = require("../../lib/customElement");
let can = require("../../shims/can");

/*
 * Components
 */
require("../../components/chatOutput").install();
require("../../components/chatInput").install();

/*
 * Page
 */
let Home = element.define("home-page", {
  style: require("./styles.styl"),
  template: require("./template.mustache")
});

module.exports.render = function(data) {
  element.install(Home);
  return can.view.mustache("<home-page/>")(extend({
    log: clone(Chatlog, data.connection, "chat")
  }, data));
};
