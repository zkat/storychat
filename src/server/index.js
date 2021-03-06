"use strict";

let clone = require("proto").clone;

let webServer = require("./webServer");

let config = require("config");

let port = config.app.httpPort;

let join = require("path").join;

let web = clone(webServer.WebServer, {
  sessionSecret: "omgsupersecretlol",
  staticDir: join(__dirname, "/../../static")
});

let chatService = require("./services/chat").service;
let characterService = require("./services/character").service;
let userService = require("./services/user").service;

var echoService;

if (config.env !== "production") {
  // Pieces together stack traces for promises. Has a performance hit.
  require("q").longStackSupport = true;
  echoService = require("./services/echo").service;
  require("./clientRecompiler").watch();
}

clone(require("./socketServer").SocketServer, web.http, {
  prefix: "/ws",
  services: {
    chat: clone(chatService, "chat"),
    echo: clone(echoService, "echo"),
    character: clone(characterService, "character"),
    user: clone(userService, "user")
  }
});

webServer.listen(web, port);
