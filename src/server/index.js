"use strict";

let clone = require("../client/js/lib/proto").clone;

let webServer = require("./webServer");

let port = process.env.PORT || 8080;

let web = clone(webServer.WebServer, {
  sessionSecret: "omgsupersecretlol",
  staticDir: __dirname + "/../../static"
});

let chatService = require("./services/chat").service;

if (process.env.NODE_ENV !== "production") {
  // Pieces together stack traces for promises. Has a performance hit.
  require("q").longStackSupport = true;
}

clone(require("./socketServer").SocketServer, web.http, {
  prefix: "/ws",
  services: {
    chat: chatService
  }
});

webServer.listen(web, port);
