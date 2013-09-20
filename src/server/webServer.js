"use strict";

let addMethod = require("genfun").addMethod,
    proto = require("../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let lodash = require("lodash"),
    each = lodash.each,
    partial = lodash.partial;

let express = require("express"),
    http = require("http");

/**
 * Handles web server connections and routing of http requests.
 */
let WebServer = clone(),
    routes = [];

addMethod(init, [WebServer], function(srv, opts) {
  srv.app = express();
  srv.http = http.createServer(srv.app);
  configureApp(srv, opts);
});

function configureApp(srv, opts) {
  let app = srv.app;
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: opts.sessionSecret}));
  //app.use(connect.compress());
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

/*
 * Util
 */
function defRoute(method, path, callback) {
  routes.push({
    method: method,
    path: path,
    callback: callback
  });
}

module.exports = {
  WebServer: WebServer,
  listen: listen
};
