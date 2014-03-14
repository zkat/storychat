var webpack = require("webpack");
module.exports = {
  entry: {
    storychat: "./src/client/js/storychat.js",
    "storychat-test": "./src/client/js/storychat-test.js"
  },
  output: {
    path: __dirname + "/../static/js/",
    filename: "[name].js"
  },
  optimize: "minimize",
  resolve: {
    alias: {
      "jquery": "jquery/jquery.js",
      "sockjs": "sockjs/sockjs.js",
      "can": "canjs/amd/can"
    },
    modulesDirectories: ["bower_components", "node_modules"]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/canjs[\/\\]amd/, /^$/),
    new webpack.optimize.CommonsChunkPlugin("common.js"),
    new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false, drop_debugger: false}}),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  cache: true,
  devtool: "#source-map",
  output: {
    pathinfo: true
  },
  optimize: "minimize",
  module: {
    loaders: [{
      test: /\.js$/,
      loader: "transform/cacheable?es6ify"
    },{
      test: /\.html$/,
      loader: "raw-loader"
    },{
      test: /\.mustache/,
      loader: "transform/cacheable?can.viewify"
    },{
      test: /\.styl$/,
      loader: 'style-loader!css-loader!stylus-loader'
    }]
  }
};
