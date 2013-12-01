"use strict";

let {conn, onMessage, listen,
     unlisten, request} = require("../../lib/socketConn"),
    {addMethod} = require("genfun"),
    {find} = require("lodash"),
    can = require("../../shims/can");

let User = can.Model.extend({
  update: updateUser,
  findOne: readUser,
  findAll: listUsers,
  namespace: "user"
}, {});

function updateUser(id, user) {
  return request({
    method: "update",
    args: [id, user.name]
  }, User.namespace);
}

function readUser() {
  return request({
    method: "read",
    args: []
  }, User.namespace);
}

function listUsers() {
  return request({
    method: "list",
    args: []
  }, User.namespace);
}

addMethod(onMessage, [User.List.prototype], function(lst, data) {
  if (data.method === "create") {
    lst.push(data.args);
  } else if (data.method === "destroy") {
    let user = find(lst, {id: data.args.id});
    if (user) {
      lst.splice(lst.indexOf(user), 1);
    }
  } else if (data.method === "update") {
    let user = find(lst, {id: data.args.id});
    if (user) {
      user.attr("name", data.args.name);
    }
  } else {
    console.warn("Unknown message: ", data);
  }
});

function current() {
  return User.findOne({}).then(function(resp) {
    return new User(resp.data);
  });
}

function list() {
  let lst = new User.List({});
  listen(lst, User.namespace);
  lst.bind("destroyed", function() {
    unlisten(lst, User.namespace);
  });
  conn.state.bind("change", function(ev, state) {
    if (state === "open") {
      User.findAll({}, function(users) {
        lst.replace(users);
      });
    }
  });
  return lst;
}

module.exports = {
  current: current,
  list: list
};
