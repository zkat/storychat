/* global describe, it, after */
"use strict";

let assert = require("assert");

let {Chatlog, addEntry} = require("../../models/chatlog"),
    {clone} = require("../../lib/proto"),
    $ = require("jquery"),
    {connect, disconnect} = require("../../lib/socketConn");

let socketUrl = "http://localhost:8080/wsauth";

describe("ChatOutput", function() {
  let conn = connect(socketUrl),
      log = clone(Chatlog, "test", conn);
  console.log(addEntry, log, assert, $);
  after(function() {
    disconnect(conn);
    conn = null;
  });

  describe("cloning", function() {
    it("attaches to a parent element");
    it("expects a chatlog instance argument");
  });

  describe("entries", function() {
    describe("dialogue", function() {
      it("renders the actor name");
      it("renders the dialogue");
      it("renders the parenthetical if there is one");
      it("omits parenthetical if there isn't one in the group");
      it("concatenates dialogue content in the same group");
      it("renders consecutive dialogue groups as new dialogue structures");
    });
    describe("action", function() {
      it("renders the action as a single sentence");
      it("wraps the actor in an element with .actor");
    });
    describe("slug", function() {
      it("renders a slug line");
    });
    describe("heading", function() {
      it("renders a scene heading");
    });
    describe("ooc", function() {
      it("renders out-of-character dialogue");
      it("wraps the actor in an element with .actor");
    });
    describe("other", function() {
      it("ignores other entry types");
    });
  });
});
