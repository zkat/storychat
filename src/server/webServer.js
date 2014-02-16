"use strict";

let proto = require("../client/js/lib/proto"),
    clone = proto.clone,
    init = proto.init;

let lodash = require("lodash"),
    each = lodash.each,
    map = lodash.map,
    partial = lodash.partial;

let express = require("express"),
    http = require("http"),
    sessionStore = require("session");

let path = require("path");

let config = require("config");

let browserify = require("watchify");

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

let mainFilePath = __dirname + "/../../src/client/js/storychat.js",
    mainBundle = bundle({entries: mainFilePath,
                         debug: config.env !== "production"});
defRoute("get", "/js/storychat.js", function(srv, req, res) {
  console.log("Serving main js file");
  res.end(mainBundle());
});

if (config.env !== "production") {
  let testBundlePath = __dirname + "/../../src/client/js/storychat-test.js",
      testBundle = bundle({entries: testBundlePath, debug: true});
  defRoute("get", "/js/storychat-test.js", function(srv, req, res) {
    res.end(testBundle());
  });
}

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

function bundle(opts) {
  let b = browserify(opts),
      file = typeof opts.entries === "string" ?
        path.basename(opts.entries) :
        map(opts.entries, function(x) { return path.basename(x); }),
      data = "console.log('Generating new bundle...');",
      index = 0;
  b.on("update", rebundle);
  rebundle();
  return function() {
    return data;
  };
  function rebundle() {
    console.log("Generating new bundle for " + file);
    index++;
    let label = "Finished building bundle for "+file+"("+index+")";
    console.time(label);
    let bb = b.bundle(opts),
        caught = false,
        newData = "";
    bb.on("error", function(err) {
      caught = true;
      console.error("Error generating bundle: ", err);
    });
    bb.on("data", function(buf) { newData += buf; });
    bb.on("end", function() {
      if (!caught) {
        data = newData;
        console.timeEnd(label);
      }
    });
  }
}

module.exports = {
  WebServer: WebServer,
  listen: listen
};
