"use strict";

let {makeChatlog} = require("../../models/chatlog");
let {extend} = require("lodash");
let element = require("../../lib/customElement");
let can = require("can");

/*
 * Components
 */
require("../../components/chatOutput").install();
require("../../components/chatInput").install();

let user = require("../../models/user");

/*
 * Page
 */
let Play = element.define("play-page", {
  style: require("./styles.styl"),
  template: require("./template.mustache")
});

module.exports.render = function(data) {
  element.install(Play);
  return can.view.mustache("<play-page/>")(extend({
    log: makeChatlog("chat"),
    users: user.list()
  }, data));
};
