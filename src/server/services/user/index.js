"use strict";

let proto = require("proto"),
    clone = proto.clone,
    init = proto.init;

let _ = require("lodash");

let socketServer = require("../../socketServer"),
    onConnect = socketServer.onConnect,
    onRequest = socketServer.onRequest,
    onClose = socketServer.onClose,
    broadcastFrom = socketServer.broadcastFrom,
    reply = socketServer.reply,
    reject = socketServer.reject;

let UserService = clone();

init.addMethod([UserService], function(service, namespace) {
  console.log("Initializing UserService", service);
  service.namespace = namespace;
  service.users = [];
  service.idCounter = 0;
});

onRequest.addMethod([UserService], function(svc, data, req) {
  if (data.method === "list") {
    return reply(req, {
      data: _.map(svc.users, function(user) {
        return _.omit(user, "conn");
      })
    });
  } else if (data.method === "update") {
    let user = (_.find(svc.users, {id: data.args[0]}) ||
                _.find(svc.users, {conn: req.from}));
    _.assign(user, data.args[1]);
    reply(req, {
      data: _.omit(user, "conn")
    });
    return broadcastFrom(req.from, {
      method: "update",
      args: _.omit(user, "conn")
    }, svc.namespace);
  } else if (data.method === "read") {
    let user = _.find(svc.users, {conn: req.from});
    // TODO - for some reason, CanJS' findOne() doesn't do the data: trick?
    return reply(req, _.omit(user, "conn"));
  } else {
    return reject(req, {message: "nope"});
  }
});

onConnect.addMethod([UserService], function(service, conn) {
  let newUser = {
    id: ++service.idCounter,
    name: "Player"+service.idCounter,
    conn: conn
  };
  service.users.push(newUser);
  broadcastFrom(conn, {
    method: "create",
    args: _.omit(newUser, "conn")
  }, service.namespace);
});

onClose.addMethod([UserService], function(service, conn) {
  let user = _.find(service.users, {conn: conn});
  service.users = _.without(service.users, user);
  broadcastFrom(conn, {
    method: "destroy",
    args: _.omit(user, "conn")
  }, service.namespace);
});

module.exports.service = UserService;
