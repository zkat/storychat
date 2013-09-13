/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var express = require("express"),
    http = require("http"),
    Sockjs = require("sockjs"),
    _ = require("lodash"),
    mona = require("./mona");

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

function parenthetical() {
  return mona.sequence(function(s) {
    s(mona.and(mona.ws(), mona.character("("), mona.ws()));
    var text = s(
      mona.stringOf(
        mona.zeroOrMore(
          mona.unless(
            mona.and(mona.ws(), mona.character(")")),
            mona.item()))));
    s(mona.and(mona.ws(), mona.character(")")));
    return mona.result(text);
  });
}

function dialogue() {
  return mona.sequence(function(s) {
    var p = s(mona.maybe(parenthetical()));
    s(mona.ws());
    var d = s(mona.stringOf(mona.zeroOrMore(mona.item())));
    return mona.result({ parenthetical: p,
                         dialogue: d });
  });
}

sock.on("connection", function(socket) {
  console.log("Received connection from "+socket.remoteAddress+".");
  connections.push(socket);
  socket.on("data", function(data) {
    var json = JSON.parse(data);
    if (json.data.entryType === "dialogue") {
      json.data.content = mona.run(dialogue(), json.data.content).val;
    }
    data = JSON.stringify(json);
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
