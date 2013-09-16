/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let Sequelize = require("sequelize"),
    fs = require("fs"),
    env = process.env.NODE_ENV || "development",
    extend = require("lodash").extend,
    promises = require("node-promise"),
    config = JSON.parse(
      fs.readFileSync(__dirname + "/../../config/config.json"))[env];

/*jshint camelcase:false*/
if (config.use_env_variable) {
  let dbInfo = process.env[config.use_env_variable].match(
      /([^:]+):\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  config.database = dbInfo[6];
  config.username = dbInfo[2];
  config.password = dbInfo[3];
  config.host = dbInfo[4];
  config.port = dbInfo[5];
  config.dialect = dbInfo[1];
  config.protocol = dbInfo[1];
}
/*jshint camelcase:true*/

config = extend({}, {
  maxConcurrentQueries: 100,
  logging: typeof config.logging !== "undefined" ? config.logging :
    (env === "development" ?
     console.info : false),
  pool: { maxConnections: 50, maxIdleTime: 30 }
}, config);

function connect() {
  return new Sequelize(config.database, config.username,
                       config.password, config);
}

let db = connect();
function query(q, args) {
  let deferred = promises.defer();
  db.query(q, null, {raw: true}, args).success(function(results) {
    deferred.resolve(results);
  }).error(function(err) {
    console.error("Error while processing query '", q, "', ", err);
    deferred.reject(err);
  });
  return deferred.promise;
}

module.exports = {
  query: query
};
