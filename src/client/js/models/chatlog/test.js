/* global describe, it */
"use strict";

let assert = require("assert");

let {Chatlog, submitEntry, addEntry} = require("./index"),
    {clone} = require("../../lib/proto"),
    {connect} = require("../../lib/socketConn");

let socketUrl = "http://localhost:8080/wsauth";

describe("Chatlog", function() {
  let conn = connect(socketUrl);

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
    let log = clone(Chatlog, conn, "test");
    it("adds a new entry", function(done) {
      let newEntry = { content: "foo", groupTag: "group" };
      log.entryGroups.bind("add", function(_ev, newEntryGroups) {
        /* jshint unused:vars */
        let firstEntry = newEntryGroups[0].firstEntry;
        assert.equal(firstEntry.entryType, "action");
        assert.equal(firstEntry.groupTag, newEntry.groupTag);
        assert.equal(firstEntry.content, newEntry.content);
        done();
      });
      addEntry(log, "action", newEntry);
    });
    it("groups entries with the same type and groupTag");
    it("adds a new entry when it receives one from the server");
    it("only listens for entries on the chatlog's namespace");
  });
});
