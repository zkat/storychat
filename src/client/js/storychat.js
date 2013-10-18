"use strict";

let $ = require("jquery"),
    {connect} = require("./lib/socketConn"),
    {Router} = require("./router"),
    {clone} = require("./lib/proto");

$(function() {
  let origin = window.location.protocol + "//" + window.location.host;
  window.socketConn = connect(origin + "/wsauth");
  window.router = clone(Router, window.socketConn);
});
