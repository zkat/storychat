"use strict";

let {onOpen,onMessage,onClose,listen,send} = require("../../lib/socketConn"),
    {clone, init} = require("../../lib/proto"),
    {addMethod} = require("genfun"),
    {extend, last} = require("lodash"),
    can = require("../../shims/can");

/**
 * Chatlog Model
 */
let Chatlog = clone();

/*
 * Init
 */
addMethod(init, [Chatlog], function(log, conn, ns) {
  log.conn = conn;
  log.namespace = ns;
  listen(conn, log, ns);
  initModelList(log);
});

function initModelList(log) {
  log.entryGroups = new EntryGroup.List([]);
}

/*
 * Event handling
 */
addMethod(onOpen, [,Chatlog], function(_conn, log) {
  addEntry(log, {entryType: "system", content: "Connected"});
});

addMethod(onMessage, [,Chatlog], function(_conn, log, data) {
  addEntry(log, data);
});

addMethod(onClose, [,Chatlog], function(_conn, log) {
  addEntry(log, {entryType: "system", content: "Disconnected..."});
});

/*
 * Entries
 */
function submitEntry(log, type, opts) {
  let msg = extend({_sent: (new Date()).getTime()},
                   {entryType: type},
                   opts || {});
  send(log.conn, log.namespace, msg);
}

function addEntry(log, entryInfo) {
  let lastMsgGroup = last(log.entryGroups),
      entry = new Entry(extend({_received: (new Date()).getTime()}, entryInfo));
  if (lastMsgGroup &&
      lastMsgGroup.firstEntry.entryType === entryInfo.entryType &&
      lastMsgGroup.firstEntry.groupTag === entryInfo.groupTag) {
    lastMsgGroup.entries.push(entry);
  } else {
    log.entryGroups.push(
      new EntryGroup({firstEntry: entry, entries: new Entry.List([entry])}));
  }
}

function clearEntries(log) {
  log.entryGroups.replace([]);
}

/*
 * Canjs Model
 */
var EntryGroup = can.Model.extend(),
    Entry = can.Model.extend();

module.exports.Chatlog = Chatlog;
module.exports.submitEntry = submitEntry;
module.exports.addEntry = addEntry;
module.exports.clearEntries = clearEntries;
