module.exports = {
  up: function(m, types, done) {
    m.createTable("character", {
      id: {
        type: "serial",
        primaryKey: true
      },
      name: { type: "text" },
      description: { type: "text" }
    }).success(function() {
      done();
    });
  },
  down: function(m, types, done) {
    m.queryAndEmit("DROP TABLE IF EXISTS character").success(function() {
      done();
    });
  }
};
