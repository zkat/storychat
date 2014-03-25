module.exports = {
  up: function(m, DataTypes, done) {
    m.createTable("entry", {
      id: {
        type: "serial",
        primaryKey: true
      },
      scene_id: { type: "integer" },
      user_id: { type: "integer" },
      character_id: { type: "integer" },
      type: { type: "text" },
      form_content: { type: "text" }
    }).success(function() {
      done();
    });
  },
  down: function(m, types, done) {
    m.queryAndEmit("DROP TABLE IF EXISTS entry").success(function() {
      done();
    });
  }
};
