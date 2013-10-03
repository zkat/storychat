"use strict";

var through = require("through");

function compile(data) {
  function view() {
    /*jshint validthis: true*/
    var x = data;
    if (!window.can || !window.can.view.mustache) {
      console.warn("can.viewify requires that can.view.mustache be "+
                   "previously loaded into the window. Sorry!");
      return x;
    } else {
      return window.can.view.mustache(x);
    }
  }
  var compiled = "module.exports = (" + view.toString().replace(
      /data/, JSON.stringify(data)) + ")();";
  return compiled;
}

module.exports = function (file) {
  var data = "";
  
  function write (buf) { data += buf; }
  function end () {
    /*jshint validthis: true*/
    this.queue(compile(data));
    this.queue(null);
  }
  
  if (!/\.mustache$/.test(file)) { return through(); }
  
  return through(write, end);
};
