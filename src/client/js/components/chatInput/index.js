"use strict";

let {forEach, find, findIndex, defer, partial} = require("lodash");

let can = require("../../shims/can"),
    $ = require("jquery"),
    element = require("../../lib/customElement");

let {conn} = require("../../lib/socketConn");

let {submitEntry} = require("../../models/chatlog");

let character = require("../../models/character"),
    user = require("../../models/user");

let inputs = [
  {name: "dialogue", template: require("./inputs/dialogue.mustache")},
  {name: "action", template: require("./inputs/action.mustache")},
  {name: "ooc", template: require("./inputs/ooc.mustache")},
  {name: "slug", template: require("./inputs/slug.mustache")},
  {name: "heading", template: require("./inputs/heading.mustache")}
];

/**
 * ChatInput Controller
 */
let ChatInput = element.define("chat-input", {
  style: require("./styles.styl"),
  template: require("./template.mustache"),
  events: {
    "form submit": sendMessage,
    "form keydown": keyPressed,
    "form [name=content] keydown": textAreaKeyPressed,
    "form [name=content] input": typingNotification,
    "form click": focusContent,
    "[name=type] change": typeSelectorChanged,
    "[name=actor] change": updateScopeActor,
    "[name=user] input": updateScopeUser,
    "{scope} type": typeChanged,
    "{scope} actor": updateActorDropdown,
    "{scope.characters} length": updateScopeActor,
    inserted: function(el) {
      focusContent(el);
      alignActionInput(el);
      conn.state.bind("change", function(ev, newstate) {
        if (newstate === "open" && el.props("user.id")) {
          defer(partial(updateScopeUser, el));
        }
      });
      $(window).resize();
    }
  },
  properties: {
    characters: { defun: character.list },
    actor: {},
    conn: { default: conn },
    user: {
      defun: function(props) {
        user.current().then(function(usr) {
          props.attr("user", usr);
        });
        return {};
      }
    },
    log: { type: "lookup", required: true, observe: false },
    type: { type: "string", default: inputs[0].name },
    inputs: { default: inputs },
    defaults: {
      internal: true,
      defun: function() {
        return Object.create(null);
      }
    }
  },
  helpers: {
    renderInput: renderInput,
    isSelected: isSelected
  }
});

/*
 * Chat message handling
 */
function sendMessage(el, _target, event) {
  event.preventDefault();
  let formVals = can.deparam(el.find("form").serialize()),
      props = el.props();
  if (!formVals.content) { return; }
  formVals.actor = currentActor(el).id;
  submitEntry(props.log, props.type, formVals);
  props.attr("user").attr("typing", false);
  props.attr("user").save();
  el.find("form")[0].reset();
}

/*
 * Actor management
 */
function currentActor(el) {
  return el.props("actor");
}

function updateScopeActor(el) {
  let actor = el.find("[name=actor] :selected").data("actor"),
      props = el.props();
  can.batch.start();
  props.attr("actor", actor);
  props.attr("user").attr("character", actor.name);
  props.attr("user").save();
  alignActionInput(el);
  $(window).resize();
  can.batch.stop();
}

function alignActionInput(el) {
  let actionForm = el.find("form.action");
  if (actionForm) {
    actionForm.find("[name=content]").css({
      "text-indent": actionForm.find("actor").width()
    });
  }
}

function updateActorDropdown(el) {
  el.find("[name=actor]").val(el.props("actor.id"));
}

/*
 * Cycle between input types
 */
const TAB = 9;
function keyPressed(el, _target, event) {
  if (event.keyCode === TAB) {
    event.preventDefault();
    cycleInputType(el, !event.shiftKey);
  }
}

function cycleInputType(el, goForward) {
  let typeIndex = findIndex(inputs, {name: el.props("type")});
  el.props(
    "type",
    inputs[(typeIndex + (goForward ? 1 : inputs.length - 1)) %
           inputs.length].name);
  focusContent(el);
}

function typeChanged(el) {
  let form = el.find("form");
  el.find("[name=type]").val(el.props("type"));
  el.props("defaults", can.deparam(form.serialize()));
  forEach(el.props("defaults"), function(v, k) {
    form.find("[name="+k+"]").val(v);
  });
  alignActionInput(el);
  typingNotification(el);
  $(window).resize();
}

function typeSelectorChanged(el, target) {
  el.props("type", target.val());
}

/*
 * Special textareas
 */
const RET = 13;
function textAreaKeyPressed(_el, _target, event) {
  /*jshint validthis:true*/
  if (event.keyCode === RET && !event.shiftKey) {
    sendMessage.apply(this, arguments);
  }
}

function focusContent(el) {
  el.find("form [name=content]").focus();
}

function typingNotification(el) {
  let user = el.props("user");
  if (el.find("form [name=content]").val().length) {
    user.attr("typing", true);
  } else {
    user.attr("typing", false);
  }
  user.save();
}

/*
 * Username management
 */
function updateScopeUser(el) {
  if (conn.state() === "open") {
    can.batch.start();
    let user = el.props("user");
    user.attr("name", el.find("[name=user]").val());
    user.save();
    can.batch.stop();
  }
}

/*
 * Mustache helpers
 */
function renderInput(props, type, actor) {
  function render(el) {
    $(el).html(find(inputs, {name: type()}).template(props));
  }
  return function(el) {
    render(el);
    type.bind("change", function() {
      render(el);
    });
    actor.bind("change", function() {
      render(el);
    });
  };
}

function isSelected(props, opts) {
  if (props.attr("actor") === opts.context) {
    return opts.fn();
  } else {
    return opts.inverse();
  }
}

/*
 * Exports
 */
module.exports.install = function(tag) {
  element.install(ChatInput, tag);
};
