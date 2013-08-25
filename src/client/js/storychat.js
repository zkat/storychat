/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let $ = require("jquery"),
    {Chat} = require("./controls/chat"),
    Chatlog = require("./models/chatlog"),
    {clone} = require("./lib/proto");

$(function() {
  window.chat = clone(Chat, $("#chat"), clone(Chatlog));
});
