"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("./lib/proto");

let can = require("./shims/can");
let $ = require("jquery");
let {EventListener, listen} = require("./lib/eventListener");

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
});

function page(router, data) {
  let nextPage = pages[data.page || "home"] || pages["404"];
  $("#page").remove();
  nextPage(router.conn, $("<div id=page>").appendTo("body"));
}

module.exports.Router = Router;
