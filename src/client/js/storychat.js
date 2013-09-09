/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let $ = require("jquery"),
    {SocketConn} = require("./lib/socketConn"),
    {ChatOutput} = require("./controls/chatOutput"),
    {ChatInput} = require("./controls/chatInput"),
    {Chatlog} = require("./models/chatlog"),
    {clone} = require("./lib/proto");

$(function() {
  let origin = window.location.protocol + "//" + window.location.host;
  window.socketConn = clone(SocketConn, origin + "/ws");
  window.chatlog = clone(Chatlog, window.socketConn, "chat");
  window.chatOutput = clone(ChatOutput, $("#chat-output"), window.chatlog);
  window.chatInput = clone(ChatInput, $("#chat-input"), window.chatlog);
});
