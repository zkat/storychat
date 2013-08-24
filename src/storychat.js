/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var express = require("express"),
    http = require("http");

/*
 * App Setup
 */
var app = express();
app.configure(function(){
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: "super-secret-cookie-omg"}));
	//app.use(connect.compress());
	app.use(express["static"](__dirname + "/../static"));
});

var server = http.createServer(app);
var Sockjs = require("sockjs"),
    sock = Sockjs.createServer();

sock.on("connection", function(socket) {
  socket.write(JSON.stringify({foo: "bar"}));
});

sock.installHandlers(server, {prefix: "/ws"});

server.listen(8080);
