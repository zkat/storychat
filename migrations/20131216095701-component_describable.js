module.exports = {
  up: function(m, types, done) {
    m.createTable("component_describable", {
      id: {
        type: "serial",
        primaryKey: true
      },
      entity_id: {
        // TODO - foreign key stuff
        type: "integer"
      }
    }).success(function() {
      done();
    });
  },
  down: function(m, types, done) {
    m.queryAndEmit("DROP TABLE IF EXISTS component_describable")
      .success(function() {
        done();
      });
  }
};
