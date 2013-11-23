"use strict";

let $ = require("jquery"),
    {Router} = require("./router"),
    {clone} = require("./lib/proto");

let style = require("./lib/ensureStyle");

$(function() {
  style(require("../css/reset.styl"));
  window.router = clone(Router);
});
