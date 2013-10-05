"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("./lib/proto");

let $ = require("jquery");
let {EventListener, listen} = require("./lib/eventListener");

let can = require("./shims/can");

/**
 * Storychat router
 *
 * Sets up all the routes for the site and handles switching between them.
 */
let Router = clone();

let listener = clone(EventListener, {
  ":page route": page,
  "route": page
});

let pages = {
  "home": require("./pages/home"),
  "404": require("./pages/404")
};

addMethod(init, [Router], function(router, conn) {
  router.listenerHandle = listen(listener, router, window);
  router.conn = conn;
  can.route.ready();
});

function page(router, data) {
  let nextPage = pages[data.page || "home"] || pages["404"];
  $("#page").remove();
  nextPage($("<div id=page>").appendTo("body"), router.conn, data);
}

module.exports.Router = Router;
