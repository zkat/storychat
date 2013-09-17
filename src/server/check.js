/* -*- js2-basic-offset: 2; indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

let Validator = require("validator").Validator,
    promises = require("node-promise");

function PromiseValidator() {
  this._deferred = promises.defer();
  this.promise = this._deferred.promise;
  this._errors = [];
}

PromiseValidator.prototype = new Validator;
PromiseValidator.prototype.constructor = PromiseValidator;

PromiseValidator.prototype.error = function(msg) {
  this._errors.push(msg);
  return this;
};

PromiseValidator.prototype.done = function() {
  if (this._errors.length) {
    this._deferred.reject(this._errors, true);
  } else {
    this._deferred.resolve();
  }
  return this.promise;
};

module.exports = function() { return new PromiseValidator(); };
