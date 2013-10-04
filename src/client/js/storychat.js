"use strict";

let $ = require("jquery"),
    {SocketConn} = require("./lib/socketConn"),
    {Router} = require("./router"),
    {clone} = require("./lib/proto");

$(function() {
  let origin = window.location.protocol + "//" + window.location.host;
  window.socketConn = clone(SocketConn, origin + "/wsauth");
  window.router = clone(Router, window.socketConn);
});
