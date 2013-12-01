"use strict";

let {onMessage, listen, unlisten, request} = require("../../lib/socketConn"),
    {addMethod} = require("genfun"),
    {find} = require("lodash"),
    can = require("../../shims/can");

let User = can.Model.extend({
  findAll: listUsers,
  namespace: "user"
}, {});

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
  } else {
    console.warn("Unknown message: ", data);
  }
});

function list() {
  let lst = new User.List({});
  listen(lst, User.namespace);
  lst.bind("destroyed", function() {
    unlisten(lst, User.namespace);
  });
  conn.state.bind("change", function(state) {
    if (state === "open") {
      User.findAll({}, function(users) {
        lst.replace(users);
      });
    }
  });
  return lst;
}

module.exports = {
  list: list
};
