"use strict";

module.exports = {
  up: function(m, types, done) {
    m.createTable("user", {
      email: { type: "text", primaryKey: true },
      password: "text",
      display_name: "text"
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
