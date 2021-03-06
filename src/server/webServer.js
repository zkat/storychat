"use strict";

let proto = require("proto"),
    clone = proto.clone,
    init = proto.init;

let lodash = require("lodash"),
    each = lodash.each,
    partial = lodash.partial;

let express = require("express"),
    http = require("http"),
    sessionStore = require("session");

let config = require("config");

/**
 * Handles web server connections and routing of http requests.
 */
let WebServer = clone(),
    routes = [];

init.addMethod([WebServer], function(srv, opts) {
  srv.app = express();
  srv.http = http.createServer(srv.app);
  configureApp(srv, opts);
});

function configureApp(srv, opts) {
  srv.sessionStore = sessionStore();
  let app = srv.app;
  app.use(express.logger(config.env === "production" ? "short" : "dev"));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: srv.sessionStore,
    key: "storychat-sess",
    secret: opts.sessionSecret,
    cookie: { maxAge: 1000*60*60*24*45 }
  }));
  app.use(express.compress());
  app.use(express["static"](opts.staticDir));
  each(routes, function(route) {
    app[route.method](route.path, partial(route.callback, srv));
  });
}

function listen(srv, port) {
  srv.http.listen(port, function() {
    console.log("Listening on "+port);
  });
}

/*
 * Routes
 */
defRoute("get", "/wsauth", function(srv, req, res) {
  let authInfo = {
    wsUrl: "http://" + req.headers.host + "/ws",
    auth: "letmein"
  };
  res.send({data: authInfo});
});

// This one must always be last!
defRoute("get", "*", function(srv, req, res) {
  // Any other URLs, reroute to /#/url, to allow can.route/pushState to
  // make things awesome.
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.redirect("#!"+req.url.substr(1));
});

/*
 * Util
 */
function defRoute(method, urlPath, callback) {
  routes.push({
    method: method,
    path: urlPath,
    callback: callback
  });
}

module.exports = {
  WebServer: WebServer,
  listen: listen
};
