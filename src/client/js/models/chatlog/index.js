"use strict";

let {onMessage,listen,send} = require("../../lib/socketConn"),
    {clone, init} = require("proto"),
    {extend, last} = require("lodash"),
    character = require("../character"),
    can = require("can"),
    Q = require("q");

/**
 * Chatlog Model
 */
let Chatlog = clone();

function makeChatlog(namespace) {
  return clone(Chatlog, namespace);
}

/*
 * Init
 */
init.addMethod([Chatlog], function(log, ns) {
  log.namespace = ns;
  listen(log, ns);
  initModelList(log);
});

function initModelList(log) {
  log.entryGroups = new EntryGroup.List([]);
}

/*
 * Event handling
 */
onMessage.addMethod([Chatlog], function(log, data) {
  addEntry(log, data);
});

/*
 * Entries
 */
function submitEntry(log, type, opts) {
  let msg = extend({_sent: (new Date()).getTime()},
                   {entryType: type},
                   opts || {});
  send(msg, log.namespace);
}

function addEntry(log, entryInfo) {
  return makeEntry(log, entryInfo).then(function(entry) {
    let lastMsgGroup = last(log.entryGroups);
    if (lastMsgGroup &&
        lastMsgGroup.firstEntry.entryType === entryInfo.entryType &&
        lastMsgGroup.firstEntry.groupTag === entryInfo.groupTag) {
      lastMsgGroup.entries.push(entry);
    } else {
      log.entryGroups.push(
        new EntryGroup({firstEntry: entry, entries: new Entry.List([entry])}));
    }
  });
}

function makeEntry(log, entryInfo) {
  let deferred = Q.defer(),
      entry = new Entry(extend({_received: (new Date()).getTime()}, entryInfo));
  if (typeof entryInfo.actor === "number") {
    character.read(entryInfo.actor).then(function(actor) {
      entry.attr("actor", actor);
      deferred.resolve(entry);
    }, deferred.reject);
  } else {
    deferred.resolve(entry);
  }
  return deferred.promise;
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
module.exports.makeChatlog = makeChatlog;
module.exports.submitEntry = submitEntry;
module.exports.addEntry = addEntry;
module.exports.clearEntries = clearEntries;
