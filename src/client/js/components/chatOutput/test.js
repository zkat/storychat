/* global describe, it, after */
"use strict";

let assert = require("assert");

let {makeChatlog, addEntry, clearEntries} = require("../../models/chatlog"),
    {ChatOutput} = require("./index"),
    {clone} = require("../../lib/proto"),
    {domEqual} = require("../../lib/testlib.js"),
    $ = require("jquery"),
    fs = require("fs"),
    {connect, disconnect} = require("../../lib/socketConn");

let socketUrl = "http://localhost:8080/wsauth";

let dialogueTest = fs.readFileSync(__dirname + "/entries/dialogue-test.html");

describe("ChatOutput", function() {
  let conn = connect(socketUrl),
      log = makeChatlog(conn, "chat");
  console.log(addEntry, log, assert, $);
  after(function() {
    disconnect(conn);
    conn = null;
  });

  describe("cloning", function() {
    it("attaches to a parent element");
    it("expects a chatlog instance argument");
    it("renders its template into the parent element", function() {
      let div = $("<div class=container>");
      clone(ChatOutput, div, log);
      clearEntries(log);
      domEqual(div.children(), "<div class=entry-groups></div>");
    });
  });

  describe("entries", function() {
    let div = $("<div class=container>");
    clone(ChatOutput, div, log);
    describe("dialogue", function() {
      clearEntries(log);
      it("renders a dialogue entry", function() {
        addEntry(log, {
          entryType: "dialogue",
          groupTag: "Kat",
          actor: "Kat",
          parsedContent: {
            dialogue: "Hey there, how's it going?",
            parenthetical: "skeptically"
          }
        });
        domEqual(div.children(),
                 $(dialogueTest).filter(".one-entry").children());
      });
      it("concatenates dialogue content in the same group", function() {
        addEntry(log, {
          entryType: "dialogue",
          groupTag: "Kat",
          actor: "Kat",
          parsedContent: {
            dialogue: "Today is a damn good day.",
            parenthetical: "happily"
          }
        });
        domEqual(div.children(),
                 $(dialogueTest).filter(".same-group-entries").children());
      });
      it("renders consecutive groups separately", function() {
        addEntry(log, {
          entryType: "dialogue",
          groupTag: "Kat",
          actor: "Kat",
          parsedContent: {
            dialogue: "I'm glad things are going well.",
            parenthetical: "amusedly"
          }
        });
        addEntry(log, {
          entryType: "dialogue",
          groupTag: "Kat",
          actor: "Kat",
          parsedContent: {
            dialogue: "Yeah.",
            parenthetical: "tiredly"
          }
        });
        domEqual(div.children(),
                 $(dialogueTest).filter(".consecutive-groups").children());
      });
      it("omits parentheticals if they're not in entry", function() {
        clearEntries(log);
        addEntry(log, {
          entryType: "dialogue",
          groupTag: "Kat",
          actor: "Kat",
          parsedContent: {
            dialogue: "Hi."
          }
        });
        addEntry(log, {
          entryType: "dialogue",
          groupTag: "Kat",
          actor: "Kat",
          parsedContent: {
            dialogue: "Yeah."
          }
        });
        domEqual(div.children(),
                 $(dialogueTest).filter(".no-paren").children());
      });
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
