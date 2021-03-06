"use strict";

let {makeCharacter, save} = require("../../models/character");
let element = require("customElement");
let can = require("can");

let CharacterEditor = element.define("character-editor", {
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  properties: {
    character: {
      defun: function() {
        return makeCharacter("", "");
      }
    },
    errors: { default: [] }
  },
  events: {
    "input, textarea input": syncCharacter,
    "form submit": saveCharacterForm
  }
});

function saveCharacterForm(el, _target, ev) {
  ev.preventDefault();
  let props = el.props();
  return save(props.character).then(function success() {
    props.errors.replace([]);
  }, function fail(err) {
    props.errors.replace(err);
  });
}

function syncCharacter(el) {
  el.props("character").attr(
    can.deparam(el.find("form").serialize()));
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  element.install(CharacterEditor, tag);
};
