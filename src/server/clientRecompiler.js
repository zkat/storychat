"use strict";

let webpack = require("webpack");
let _ = require("lodash");
let config = require("../../config/webpack.config.js");

function watch(options) {
  webpack(_.extend({
    watch: true
  }, config, options), function(err, stats) {
    let json = stats.toJson({
      timings: true,
      chunks: false,
      reasons: false
    });
    console.log("Recompiled " +
                "in " + json.time + "ms | " +
                "["+json.errors.length+" errors] " +
                "["+json.warnings.length+" warnings]");
  });
}

module.exports = { watch: watch };
