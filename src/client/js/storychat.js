"use strict";

let $ = require("jquery"),
    {Router} = require("./router"),
    {clone} = require("proto");

let style = require("ensureStyle");

$(function() {
  style(require("../css/reset.styl"));
  window.router = clone(Router);
});
