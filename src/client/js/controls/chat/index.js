/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let $ = require("jquery");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./chat.styl");

require("../../shims/can.view.mustache");

let {ChatInput} = require("../chatInput");

/**
 * Chat Controller
 *
 */
let Chat = clone();

let chatTemplate = require("./chat.mustache");
let entryTemplates = {
  system: require("./entries/system.mustache"),
  line: require("./entries/line.mustache")
};

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
