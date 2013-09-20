"use strict";

let $ = require("jquery"),
    {ChatOutput} = require("./controls/chatOutput"),
    {ChatInput} = require("./controls/chatInput"),
    {Chatlog} = require("./models/chatlog"),
    {clone} = require("./lib/proto");

module.exports = {
  in: function(body) {
    window.chatlog = clone(Chatlog, window.socketConn, "chat");
    window.chatOutput = clone(ChatOutput, $("#chat-output"), window.chatlog);
    window.chatInput = clone(ChatInput, $("#chat-input"), window.chatlog);
  },
  out:  function() {
  }
};
