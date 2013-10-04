"use strict";

let {ChatOutput} = require("../../controls/chatOutput"),
    {ChatInput} = require("../../controls/chatInput"),
    {Chatlog} = require("../../models/chatlog");

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./styles.styl");

let pageTemplate = require("./template.mustache");

let Home = clone();

addMethod(init, [Home], function(page, el, conn) {
  style(viewCss);
  el.html(pageTemplate());
  page.chatlog = clone(Chatlog, conn, "chat");
  page.chatOutput = clone(ChatOutput, el.find(".chat-output"), page.chatlog);
  page.chatInput = clone(ChatInput, el.find(".chat-input"), page.chatlog);
});

module.exports = function(el, conn) {
  return clone(Home, el, conn);
};
