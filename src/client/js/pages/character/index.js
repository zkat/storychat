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
    character: {}
  },
  events: {
    "[name=character] change": changeScopeCharacter
  }
});

function changeScopeCharacter(component) {
  component.scope.attr(
    "character",
    component.element.find("[name=character]").val().data("character"));
}

module.exports.render = function(data) {
  element.install(Character);
  return can.view.mustache("<character-page/>")(data);
};
