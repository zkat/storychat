"use strict";

let {addMethod} = require("genfun"),
    {clone, init} = require("../../lib/proto");

let style = require("../../lib/ensureStyle"),
    viewCss = require("./styles.styl");

let pageTemplate = require("./template.mustache");

let NotFound = clone();

addMethod(init, [NotFound], function(page, el, conn) {
  page.conn = conn;
  style(viewCss);
  el.html(pageTemplate());
});

module.exports = function(el, conn) {
  return clone(NotFound, el, conn);
};
