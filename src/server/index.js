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
