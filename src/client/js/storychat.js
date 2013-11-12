"use strict";

let $ = require("jquery"),
    {Router} = require("./router"),
    {clone} = require("./lib/proto");

$(function() {
  window.router = clone(Router);
});
