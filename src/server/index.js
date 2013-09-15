/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let clone = require("../client/js/lib/proto").clone;

let express = require("express"),
    http = require("http"),
    SocketServer = require("./socketServer").SocketServer;

let port = process.env.PORT || 8080;

/*
 * App Setup
 */
let app = express();
app.configure(function(){
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: "super-secret-cookie-omg"}));
	//app.use(connect.compress());
	app.use(express["static"](__dirname + "/../../static"));
});

app.get("/wsauth", function(req, res) {
  let authInfo = {
    wsUrl: "http://" + req.headers.host + "/ws",
    auth: "letmein"
  };
  res.send({data: authInfo});
});

let server = http.createServer(app);

clone(SocketServer, server, {prefix: "/ws"});

server.listen(port, function() {
  console.log("Listening on "+port);
});
