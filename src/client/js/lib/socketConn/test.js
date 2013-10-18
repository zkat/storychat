/* global describe, it */
"use strict";

let assert = require("assert");

let socketConn = require("./index");

let {addMethod} = require("genfun");

let origin = "http://localhost:8080";

describe("socketConn", function() {

  describe("connect()", function() {
    it("accepts a websocket url to connect to", function(done) {
      let conn = socketConn.connect(origin + "/wsauth"),
          obj = {};
      assert.ok(conn);
      addMethod(socketConn.onOpen, [obj], function() {
        socketConn.disconnect(conn);
        done();
      });
      socketConn.listen(conn, obj, "test");
    });
  });

  describe("onOpen()", function() {
    it("is called on observers when a connection opens", function(done) {
      let conn = socketConn.connect(origin + "/wsauth"),
          obj = {};
      addMethod(socketConn.onOpen, [obj], function() {
        assert.ok(true);
        socketConn.disconnect(conn);
        done();
      });
      socketConn.listen(conn, obj, "test");
    });
  });

  describe("onMessage()", function() {
    it("is called on observers when a message is received");
  });

  describe("onClose()", function() {
    it("is called on observers when a connection closes");
  });

  describe("listen()", function() {
    it("registers an observer with a connection");
  });

  describe("unlisten()", function() {
    it("unregisters an observer with a connection");
  });

  describe("send()", function() {
    it("sends a message to the server");
  });

  describe("request()", function() {
    it("returns a promise that resolves to a message's response");
    it("does not trigger onMessage when the response arrives");
  });

  describe("disconnect()", function() {
    it("accepts a socket connection", function(done) {
      let conn = socketConn.connect(origin + "/wsauth"),
          obj = {};
      addMethod(socketConn.onOpen, [obj], function() {
        socketConn.disconnect(conn);
      });
      addMethod(socketConn.onClose, [obj], function() {
        assert.ok(true);
        done();
      });
      socketConn.listen(conn, obj, "test");
    });
  });

});
