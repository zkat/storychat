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
