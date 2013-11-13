"use strict";

let {makeCharacter, save} = require("../../models/character");
let element = require("../../lib/customElement");
let can = require("../../shims/can");

let CharacterEditor = element.define("character-editor", {
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  attributes: {
    character: {
      defaultMaker: function() {
        return makeCharacter("", "");
      }
    }
  },
  events: {
    "input, textarea input": syncCharacter,
    "form submit": saveCharacterForm
  }
});

function saveCharacterForm(editor, _el, ev) {
  ev.preventDefault();
  return save(editor.scope.character);
}

function syncCharacter(editor) {
  editor.scope.character.attr(
    can.deparam(
      editor.element.find("form").serialize()));
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  element.install(CharacterEditor, tag);
};
