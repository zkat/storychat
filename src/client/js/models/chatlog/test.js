/* global describe, it, after */
"use strict";

let assert = require("assert");

let {Chatlog, submitEntry, addEntry} = require("./index"),
    {clone} = require("../../lib/proto"),
    {connect, disconnect} = require("../../lib/socketConn");

let socketUrl = "http://localhost:8080/wsauth";

describe("Chatlog", function() {
  let conn = connect(socketUrl);
  after(function() {
    disconnect(conn);
    conn = null;
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
        content: "hops up and down",
        groupTag: "Tester"
      });
    });
  });

  describe("addEntry()", function() {
    let log = clone(Chatlog, conn, "test");
    it("adds a new entry", function(done) {
      let newEntry = { entryType: "test", groupTag: "group", content: "foo" };
      log.entryGroups.bind("add", function(_ev, newEntryGroups) {
        /* jshint unused:vars */
        let firstEntry = newEntryGroups[0].firstEntry;
        assert.equal(firstEntry.entryType, "test");
        assert.equal(firstEntry.groupTag, newEntry.groupTag);
        assert.equal(firstEntry.content, newEntry.content);
        log.entryGroups.unbind("add");
        done();
      });
      addEntry(log, newEntry);
    });
    it("groups entries with the same type and groupTag", function(done) {
      let newEntry = { entryType: "test", groupTag: "group", content: "bar" },
          group = log.entryGroups[0];
      group.entries.bind("add", function(_ev, newEntries) {
        /* jshint unused:vars */
        assert.equal(group.entries.length, 2);
        assert.equal(newEntries.length, 1);
        assert.equal(group.firstEntry.groupTag, "group");
        assert.equal(newEntries[0].content, "bar");
        assert.equal(group.entries[0].content, "foo");
        assert.equal(group.entries[1].content, "bar");
        group.entries.unbind("add");
        done();
      });
      addEntry(log, newEntry);
    });
    it("adds a new entry when it receives one from the server");
    it("only listens for entries on the chatlog's namespace");
  });
});
