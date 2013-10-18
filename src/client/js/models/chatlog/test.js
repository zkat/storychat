"use strict";

let assert = require("assert");

let {Chatlog, submitEntry, addEntry} = require("./index"),
    {clone} = require("../../lib/proto"),
    {connect, disconnect} = require("../../lib/socketConn");

let socketUrl = "http://localhost:8080/wsauth";

describe("Chatlog", function() {
  let conn;
  before(function() {
    conn = connect(socketUrl);
  });
  after(function() {
    // disconnect(conn);
  });

  describe("cloning", function() {

    it("expects a socketConn and a namespace", function() {
      assert.ok(clone(Chatlog, conn, "test"));
    });

    it("creates an object with an entryGroups array", function() {
      let cl = clone(Chatlog, conn, "test");
      assert.ok(cl.entryGroups);
    });
  });

  describe("submitEntry()", function() {
    let log = clone(Chatlog, conn, "test");
    it("sends an entry to the server", function() {
      submitEntry(log, "action", {
        content: "hops up anad down",
        groupTag: "Tester"
      });
    });
  });

  describe("addEntry()", function() {
    // let log = clone(Chatlog, conn, "test");
    it("adds a new entry when it receives one from the server");
    it("groups entries swith the same type and groupTag");
    it("only listens for entries on the chatlog's namespace");
  });
});
