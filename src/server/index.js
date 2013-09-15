/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let clone = require("../client/js/lib/proto").clone;

let webServer = require("./webServer");

let port = process.env.PORT || 8080;

let web = clone(webServer.WebServer, {
  sessionSecret: "omgsupersecretlol",
  staticDir: __dirname + "/../../static"
});

clone(require("./socketServer").SocketServer, web.http, {prefix: "/ws"});

webServer.listen(web, port);
