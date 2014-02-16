"use strict";
let $ = require("jquery"),
    mocha = window.mocha;

mocha.setup("bdd");
mocha.globals(["$"]);

require("./lib/socketConn/test");
require("./models/chatlog/test");
require("./components/chatOutput/test");

$(function() {
  mocha.run();
});
