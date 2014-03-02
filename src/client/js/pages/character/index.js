"use strict";

let element = require("../../lib/customElement");
let can = require("can");
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
  properties: {
    characters: {
      defun: character.list
    },
    character: {
      defun: makeCharacter
    }
  },
  events: {
    "[name=character] change": changeCharacter,
    ".delete click": deleteCharacter
  },
  helpers: {
    isCurrent: isCurrentHelper
  }
});

function changeCharacter(el) {
  el.props(
    "character",
    el.find("[name=character] :selected").data("character") ||
      makeCharacter(el));
}

function deleteCharacter(el) {
  character.destroy(el.props("character")).then(function() {
    el.props("character", makeCharacter(el));
  });
}

function makeCharacter(el) {
  return character.makeCharacter("","").bind("created", function() {
    // TODO - this callback is being invoked within a promise for some reason,
    //        which prevents it from throwing an uncaught exception when an
    //        error happens in here. Investigate!
    el.props("characters").push(this);
    el.props("character", this);
  });
}

function isCurrentHelper(props, chr, opts) {
  if (props.attr("character") === chr) {
    return opts.fn();
  } else {
    return opts.inverse();
  }
}

module.exports.render = function(data) {
  element.install(Character);
  return can.view.mustache("<character-page/>")(data);
};
