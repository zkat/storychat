/* global describe, it */
"use strict";

let assert = require("assert");

let socketConn = require("./index"),
    {connect, disconnect, onMessage,
     listen, unlisten, send, request} = socketConn;

let {addMethod} = require("genfun");

let origin = "http://localhost:8080";

describe("socketConn", function() {

  describe("connect()", function() {
    it("accepts a websocket url to connect to", function() {
      let conn = connect(origin + "/wsauth");
      assert.ok(conn);
      disconnect(conn);
    });
  });

  describe("disconnect()", function() {
    it("accepts a socket connection", function() {
      let conn = connect(origin + "/wsauth");
      disconnect(conn);
      assert.equal(conn.state(), "closed");
      assert.throws(function() {
        send(conn, "test", {content: "test"});
      }, /connection is closed/);
    });
  });

  describe("#state()", function() {
    it("returns the current state of the connection");
    it("is an observable value");
  });

  describe("onMessage()", function() {
    it("is called when a message is received opens", function(done) {
      let conn = connect(origin + "/wsauth"),
          observer = {};
      addMethod(onMessage, [conn, observer], function(conn1, obs, msg) {
        assert.equal(obs, observer);
        assert.equal(conn1, conn);
        assert.equal(msg.content, "test");
        disconnect(conn1);
        done();
      });
      listen(conn, observer, "test");
      send(conn, "test", {content: "test"});
    });
  });

  describe("listen()", function() {
    it("registers an observer with a connection", function(done) {
      let conn = connect(origin + "/wsauth"),
          observer = {};
      addMethod(onMessage, [conn, observer], function() {
        assert.ok(true);
        done();
      });
      listen(conn, observer, "test");
      send(conn, "test", {content: "test"});
    });
  });

  describe("unlisten()", function() {
    it("unregisters an observer with a connection", function(done) {
      let conn = connect(origin + "/wsauth"),
          observer = {};
      addMethod(onMessage, [conn, observer], function() {
        assert.ok(true);
        done();
      });
      listen(conn, observer, "test");
      unlisten(conn, observer, "test");
      send(conn, "test", {content: "test"});
    });
  });

  describe("send()", function() {
    it("sends a message to the server", function(done) {
      let conn = connect(origin + "/wsauth"),
          observer = {};
      addMethod(onMessage, [conn, observer], function(conn1, obs, msg) {
        assert.equal(msg.content, "test");
        disconnect(conn1);
        done();
      });
      listen(conn, observer, "test");
      send(conn, "test", {content: "test"});
    });
  });

  describe("request()", function() {
    it("returns a promise that resolves to a response", function(done) {
      let conn = connect(origin + "/wsauth"),
          promise = request(conn, "test", {content: "test"});
      assert.equal(typeof promise.then, "function");
      promise.then(function(resp) {
        assert.equal(resp.content, "test");
        done();
      }, done);
    });
    it("does not trigger onMessage when the response arrives");
  });

});
