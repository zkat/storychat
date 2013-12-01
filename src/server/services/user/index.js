"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../../../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let _ = require("lodash");

let socketServer = require("../../socketServer"),
    onConnect = socketServer.onConnect,
    onRequest = socketServer.onRequest,
    onClose = socketServer.onClose,
    broadcastFrom = socketServer.broadcastFrom,
    broadcast = socketServer.broadcast,
    reply = socketServer.reply,
    reject = socketServer.reject;

let UserService = clone();

addMethod(init, [UserService], function(service, namespace) {
  console.log("Initializing UserService", service);
  service.namespace = namespace;
  service.users = [];
  service.idCounter = 0;
});

addMethod(onRequest, [UserService], function(svc, data, req) {
  if (data.method === "list") {
    return reply(req, {
      data: _.map(svc.users, function(user) {
        return {id: user.id, name: user.name};
      })
    });
  } else if (data.method === "update") {
    let user = (_.find(svc.users, {id: data.args[0]}) ||
                _.find(svc.users, {conn: req.from}));
    user.name = data.args[1];
    reply(req, {
      data: {id: user.id, name: user.name}
    });
    return broadcast(req.from, {
      method: "update",
      args: {id: user.id, name: user.name}
    }, svc.namespace);
  } else if (data.method === "read") {
    let user = _.find(svc.users, {conn: req.from});
    return reply(req, {
      data: {id: user.id, name: user.name}
    });
  } else {
    return reject(req, {message: "nope"});
  }
});

addMethod(onConnect, [UserService], function(service, conn) {
  let newUser = {
    id: ++service.idCounter,
    name: "Player"+service.idCounter,
    conn: conn
  };
  service.users.push(newUser);
  broadcastFrom(conn, {
    method: "create",
    args: { id: newUser.id, name: newUser.name }
  }, service.namespace);
});

addMethod(onClose, [UserService], function(service, conn) {
  let user = _.find(service.users, {conn: conn});
  service.users = _.without(service.users, user);
  broadcastFrom(conn, {
    method: "destroy",
    args: {id: user.id}
  }, service.namespace);
});

module.exports.service = UserService;
