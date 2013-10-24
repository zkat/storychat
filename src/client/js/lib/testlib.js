"use strict";

let assert = require("assert"),
    $ = require("jquery");

function domEqual(tree, expected, opts) {
  function htmlNormalize(str) {
    return str.replace(/\s+/gm, " ")
      .replace(/>\s/gm, ">")
      .replace(/\s</gm, "<");
  }
  tree = $(tree);
  expected = $(expected);
  opts = opts || {};
  let treeHtml = tree[0].outerHTML,
      expectedHtml = expected[0].outerHTML;
  if (!opts.strict) {
    treeHtml = htmlNormalize(treeHtml);
    expectedHtml = htmlNormalize(expectedHtml);
  }
  assert.equal(treeHtml, expectedHtml);
  assert.deepEqual(tree.data(), expected.data());
}

// TODO - turn these into tests

// pass
// domEqual("<div>", "<div>");
// domEqual("<div class=foo> hey there\n\n\t </div>",
//          "<div class='foo'>hey there</div>");
// domEqual($("<div>").data("x", 5), $("<div>").data("x", 5));
// domEqual($("<div>").data("x", {foo:1}), $("<div>").data("x", {foo:1}));
 
// fail
// domEqual("<span>", "<div>");
// domEqual("<div class=foo> hey there\n\n\t </div>",
//          "<div class='foo'>hey there</div>",
//          {strict: true});
// domEqual($("<div>").data("x", 5), $("<div>").data("x", 4));
// domEqual($("<div>").data("x", 5), $("<div>"));

module.exports.domEqual = domEqual;
