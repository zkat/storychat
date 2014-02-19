"use strict";

let {clone, init} = require("proto");

let {find} = require("lodash");

let $ = require("jquery");
let {EventListener, listen} = require("./lib/eventListener");

let can = require("./shims/can");
require("./shims/can.route.pushstate");

let style = require("./lib/ensureStyle");

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
  hide: true,
  component: require("./pages/character")
}, {
  href: "404",
  title: "Not Found",
  hide: true,
  component: require("./pages/404")
}];

init.addMethod([Router], function(router) {
  router.listenerHandle = listen(listener, router, $("body"));
  router.currentPage = can.compute(findPage());
  initCanRoute();
  style(require("../css/base.styl"));
  initDom(router);
});

function initCanRoute() {
  if (window.history && window.history.pushState && window.location.hash) {
    if (window.history.previous === window.location.hash.substr(2)) {
      window.go(-1);
    } else {
      window.history.replaceState(null, null, window.location.hash.substr(2));
      window.location.hash = "";
    }
  }
  can.route.ready();
}

function initDom(router) {
  $("body").html(require("./router.mustache")({
    pages: pages,
    renderPage: function() {
      function render(el) {
        $(el).html(router.currentPage().component.render(can.route.attr()));
      }
      return function(el) {
        render(el);
        router.currentPage.bind("change", function() {
          render(el);
        });
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
