module.exports = {
  up: function(m, types, done) {
    m.createTable("entity", {
      id: {
        type: "serial",
        primaryKey: true
      },
      description: { type: "text" }
    }).success(function() {
      done();
    });
  },
  down: function(m, types, done) {
    m.queryAndEmit("DROP TABLE IF EXISTS entity").success(function() {
      done();
    });
  }
};
