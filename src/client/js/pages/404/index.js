"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./styles.styl");

let pageTemplate = require("./template.mustache");

let NotFound = clone();

addMethod(init, [NotFound], function(page, conn, el) {
  page.conn = conn;
  style(viewCss);
  el.html(pageTemplate());
});

module.exports = function(conn, el) {
  return clone(NotFound, conn, el);
};
