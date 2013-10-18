"use strict";
let $ = require("jquery"),
    mocha = window.mocha;

mocha.setup("bdd");
mocha.globals(["$"]);

require("./lib/socketConn/test");

$(function() {
  mocha.run();
});
