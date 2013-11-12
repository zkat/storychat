"use strict";

let {makeCharacter} = require("../../models/character");
let element = require("../../lib/customElement");

let CharacterEditor = element.define("character-editor", {
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  attributes: {
    character: { defaultMaker: makeCharacter }
  },
  events: {
    "form submit": saveCharacterForm
  }
});

function saveCharacterForm(editor, el, ev) {
  ev.prevendDefault();
  console.log("Attempting to save character");
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  element.install(CharacterEditor, tag);
};
