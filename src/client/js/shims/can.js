"use strict";

let $ = require("jquery"),
    oldDomManip = $.fn.domManip;

$.fn.domManip = function(args, table, callback) {
  return oldDomManip.call(this, args, callback, table);
};

require("../../../../bower_components/canjs/can.jquery.js");

let canDomManip = $.fn.domManip;
$.fn.domManip = function(args, callback, whatever) {
  return canDomManip.call(this, args, whatever, callback);
};

module.exports = window.can;
