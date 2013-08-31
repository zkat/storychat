/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

require("../../shims/can.view.mustache");

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
    _ = require("lodash");

let can = require("../../shims/can"),
    $ = require("jquery");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./chat.styl");

let fs = require("fs"),
    chatTemplateText = fs.readFileSync(__dirname + "/chat.mustache"),
    systemTemplateText =
      fs.readFileSync(__dirname + "/entries/system.mustache"),
    lineTemplateText =
      fs.readFileSync(__dirname + "/entries/line.mustache");

let {ChatInput} = require("../chatInput");

/**
 * Chat Controller
 *
 */
let Chat = clone(),
    chatTemplate = can.view.mustache(chatTemplateText);

let entryTemplates = _.each({
  system: systemTemplateText,
  line: lineTemplateText
}, function(val, key, tbl) {
  tbl[key] = can.view.mustache(val);
});

/*
 * Init
 */
addMethod(init, [Chat], function(chat, el, chatlog) {
  chat.el = el;
  chat.log = chatlog;
  initDom(chat);
  chat.input = clone(ChatInput, el.find(".input"), chatlog);
  style(viewCss);
});

function initDom(chat) {
  chat.el.html(chatTemplate({ log: chat.log }, { renderEntry: renderEntry }));
}

function renderEntry() {
  /*jshint validthis: true*/
  let obj = this;
  return function(el) {
    $(el).html(entryTemplates[obj.entryType](obj))
      .addClass(obj.entryType)
      .data("entry", obj);
  };
}

/*
 * Exports
 */
module.exports.Chat = Chat;
