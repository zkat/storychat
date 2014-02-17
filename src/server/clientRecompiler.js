"use strict";

let watchify = require("watchify");
let through = require("through");
let fs = require("fs");
let path = require("path");
let _ = require("lodash");

function watch(source, target, options) {

  if (!source) {
    throw new Error("You MUST specify a source (first argument).");
  }
  if (!target) {
    throw new Error("You MUST specify a target (second argument).");
  }

  let log = options.verbose ? console.log : Function.prototype;

  let watcher = watchify(_.extend({ entries: source }, options));
  let dotfile = path.join(path.dirname(target),
                          "." + path.basename(target) +
                          (new Date()).toISOString().replace(/:/, "-"));
  log("temporary file at " + dotfile);

  watcher.on("update", bundle);
  bundle();

  function bundle () {
    let compiled = watcher.bundle();
    compiled.on("error", err);
    compiled.pipe(fs.createWriteStream(dotfile));
    let bytes = 0;
    compiled.pipe(through(write, end));

    function write (buffer) { bytes += buffer.length; }

    function end () {
      fs.rename(dotfile, target, function (error) {
        if (!error) { log(bytes + " bytes written to " + target); }
        else { err(error); }
      });
    }

    function err (error) { console.error(String(error)); }
  }
}

module.exports = { watch: watch };
