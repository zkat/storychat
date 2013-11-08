"use strict";

let express = require("express");

module.exports = function() {
  return new express.session.MemoryStore();
};
