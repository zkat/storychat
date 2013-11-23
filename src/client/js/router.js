"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("./lib/proto");

let {find} = require("lodash");

let $ = require("jquery");
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

let pages = [{
  href: "",
  title: "Home",
  component: require("./pages/home")
}, {
  href: "play",
  title: "Play Now",
  component: require("./pages/play")
}, {
  href: "character",
  title: "Character Management",
  component: require("./pages/character")
}, {
  href: "404",
  title: "Not Found",
  hide: true,
  component: require("./pages/404")
}];

addMethod(init, [Router], function(router) {
  router.listenerHandle = listen(listener, router, $("body"));
  router.currentPage = can.compute(findPage());
  initCanRoute();
  initDom(router);
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

function initDom(router) {
  $("body").html(require("./router.mustache")({
    pages: pages,
    renderPage: function() {
      return function(el) {
        $(el).html(router.currentPage().component.render(can.route.attr()));
      };
    }
  }));
}

function findPage(name) {
  return (find(pages, {href: name || ""}) ||
          find(pages, {href: "404"}));
}

function page(router, data) {
  router.currentPage(findPage(data.page));
}

module.exports.Router = Router;
