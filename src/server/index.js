/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var express = require("express"),
    http = require("http"),
    Sockjs = require("sockjs"),
    _ = require("lodash");

var port = process.env.PORT || 8080;

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
	app.use(express["static"](__dirname + "/../../static"));
});

var server = http.createServer(app),
    sock = Sockjs.createServer(),
    connections = [];

sock.on("connection", function(socket) {
  console.log("Received connection from "+socket.remoteAddress+".");
  connections.push(socket);
  socket.on("data", function(data) {
    _.each(connections, function(conn) {
      conn.write(data);
    });
  });
  socket.on("close", function() {
    console.log("Client at "+socket.remoteAddress+" disconnected.");
    connections = _.without(connections, socket);
  });
});

sock.installHandlers(server, {prefix: "/ws"});

server.listen(port, function() {
  console.log("Listening on "+port);
});
