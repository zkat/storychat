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
