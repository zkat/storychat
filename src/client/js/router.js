"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("./lib/proto");

let $ = require("jquery");
let {extend} = require("lodash");
let {EventListener, listen} = require("./lib/eventListener");

let can = require("./shims/can");
require("./shims/can.route.pushstate");

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
  "": require("./pages/home"),
  "play": require("./pages/play"),
  "404": require("./pages/404")
};

addMethod(init, [Router], function(router, conn) {
  router.listenerHandle = listen(listener, router, window);
  router.conn = conn;
  initCanRoute();
});

function initCanRoute() {
  if (window.history && window.history.pushState && window.location.hash) {
    let oldPushState,
        oldSetURL;
    window.history.replaceState(null, null, window.location.hash.substr(2));
    window.location.hash = "";
    // XXX HACK - This maneuver is done to prevent the initial route event from
    //            pushing an unnecessary entry into the browser's history.
    oldPushState = window.history.pushState;
    oldSetURL = can.route.bindings.pushstate.setURL;
    can.route.bindings.pushstate.setURL = function() {
      window.history.pushState = window.history.replaceState;
      oldSetURL.apply(this, arguments);
      window.history.pushState = oldPushState;
      can.route.bindings.pushstate.setURL = oldSetURL;
    };
  }
  can.route.ready();
}

function page(router, data) {
  let next = pages[data.page || ""] || pages["404"];
  $("body").html(next.render(extend({connection: router.conn}, data)));
}

module.exports.Router = Router;
