"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("./lib/proto");

let can = require("./shims/can");
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

addMethod(init, [Router], function(router) {
  router.listenerHandle = listen(listener, router, window);
});

let pages = {
  "index": require("./pages/index"),
  "404": require("./pages/notfound")
};
function page(router, data) {
  console.log("Routed to page: ", can.route.attr("page"));
}

module.exports.Router = Router;
