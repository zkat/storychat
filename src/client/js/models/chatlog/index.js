"use strict";

let {onOpen,onMessage,onClose,listen,send} = require("../../lib/socketConn"),
    {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto"),
    {extend, last} = require("lodash"),
    can = require("../../shims/can");

/**
 * Chatlog Model
 */
let Chatlog = can.Map.extend({
  init: function(conn, ns) {
    let log = this;
    log.conn = conn;
    log.namespace = ns;
    listen(conn, log, ns);
    log.entryGroups = new EntryGroup.List([]);
  }
});

/*
 * Event handling
 */
addMethod(onOpen, [,Chatlog.prototype], function(_conn, log) {
  addEntry(log, {entryType: "system", content: "Connected"});
});

addMethod(onMessage, [,Chatlog.prototype], function(_conn, log, data) {
  addEntry(log, data);
});

addMethod(onClose, [,Chatlog.prototype], function(_conn, log) {
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

module.exports.makeLog = function(conn, ns) {
  return new Chatlog(conn, ns);
};
module.exports.submitEntry = submitEntry;
module.exports.addEntry = addEntry;
module.exports.clearEntries = clearEntries;
