"use strict";

let element = require("../../lib/customElement");
let can = require("../../shims/can");
let character = require("../../models/character");

/*
 * Components
 */
require("../../components/characterEditor").install();

/*
 * Page
 */
let Character = element.define("character-page", {
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  attributes: {
    characters: {
      defaultMaker: character.list
    },
    character: {
      defaultMaker: makeCharacter
    }
  },
  events: {
    "[name=character] change": changeScopeCharacter
  },
  helpers: {
    isCurrent: isCurrentHelper
  }
});

function changeScopeCharacter(component) {
  component.scope.attr(
    "character",
    component.element.find("[name=character] :selected").data("character") ||
      makeCharacter(component.scope));
}

function makeCharacter(scope) {
  return character.makeCharacter("","").bind("created", function() {
    // TODO - this callback is being invoked within a promise for some reason,
    //        which prevents it from throwing an uncaught exception when an
    //        error happens in here. Investigate!
    scope.attr("characters").push(this);
    scope.attr("character", this);
  });
}

function isCurrentHelper(chr, opts) {
  /*jshint validthis: true*/
  if (this.attr("character") === chr) {
    return opts.fn();
  } else {
    return opts.inverse();
  }
}

module.exports.render = function(data) {
  element.install(Character);
  return can.view.mustache("<character-page/>")(data);
};
