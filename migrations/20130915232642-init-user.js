/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

module.exports = {
  up: function(m, types, done) {
    m.createTable("user", {
      email: { type: types.STRING, primaryKey: true },
      password: types.STRING,
      display_name:  types.STRING
    }).success(function() {
        done();
    });
  },
  down: function(m, types, done) {
    m.queryAndEmit("DROP TABLE IF EXISTS \"user\"").success(function() {
      done();
    });
  }
}
