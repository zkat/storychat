"use strict";

let {ChatInput} = require("../../controls/chatInput"),
    {Chatlog} = require("../../models/chatlog");

require("../../components/chatOutput").install();

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./styles.styl");

let pageTemplate = require("./template.mustache");

let Home = clone();

addMethod(init, [Home], function(page, el, conn) {
  style(viewCss);
  page.chatlog = clone(Chatlog, conn, "chat");
  el.html(pageTemplate({log: page.chatlog}));
  page.chatInput = clone(ChatInput, el.find(".chat-input"), page.chatlog);
});

module.exports = function(el, conn) {
  return clone(Home, el, conn);
};
