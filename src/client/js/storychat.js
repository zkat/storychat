/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let $ = require("jquery"),
    {SocketConn} = require("./lib/socketConn"),
    {Chat} = require("./controls/chat"),
    {Chatlog} = require("./models/chatlog"),
    {clone} = require("./lib/proto");

$(function() {
  window.socketConn = clone(SocketConn, "http://localhost:8080/ws");
  window.chatlog = clone(Chatlog, window.socketConn, "chat");
  window.chat = clone(Chat, $("#chat"), window.chatlog);
});
