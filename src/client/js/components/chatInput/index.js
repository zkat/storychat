"use strict";

let {forEach, find, findIndex} = require("lodash");

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
    "form textarea keydown": textAreaKeyPressed,
    "form textarea input": typingNotification,
    "form click": focusContent,
    "[name=type] change": typeSelectorChanged,
    "[name=actor] change": updateScopeActor,
    "[name=user] input": updateScopeUser,
    "{scope} type": typeChanged,
    "{scope} actor": updateActorDropdown,
    "{scope.characters} length": updateScopeActor,
    inserted: function(inp) {
      focusContent(inp);
      alignActionInput(inp);
      conn.state.bind("change", function(ev, newstate) {
        // TODO - figure out why .attr("user").id fails. CanJS bug.
        if (newstate === "open" && inp.scope.attr("user.id")) {
          window.setTimeout(function() {
            updateScopeUser(inp);
          }, 0);
        }
      });
      $(window).resize();
    }
  },
  attributes: {
    characters: { defaultMaker: character.list },
    actor: {},
    conn: { default: conn },
    user: {
      defaultMaker: function(scope) {
        user.current().then(function(usr) {
          scope.attr("user", usr);
        });
        return {};
      }
    },
    log: { type: "lookup", required: true, observe: false },
    type: { type: "string", default: inputs[0].name },
    inputs: { default: inputs },
    defaults: {
      internal: true,
      defaultMaker: function() {
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
function sendMessage(chatInput, _el, event) {
  event.preventDefault();
  let formVals = can.deparam(chatInput.element.find("form").serialize());
  if (!formVals.content) { return; }
  formVals.actor = currentActor(chatInput).id;
  submitEntry(chatInput.scope.log, chatInput.scope.type, formVals);
  chatInput.scope.attr("user").attr("typing", false);
  chatInput.scope.attr("user").save();
  chatInput.element.find("form")[0].reset();
}

/*
 * Actor management
 */
function currentActor(chatInput) {
  return chatInput.scope.attr("actor");
}

function updateScopeActor(chatInput) {
  can.batch.start();
  let actor = chatInput.element.find("[name=actor] :selected").data("actor");
  chatInput.scope.attr("actor", actor);
  chatInput.scope.attr("user").attr("character", actor.name);
  chatInput.scope.attr("user").save();
  alignActionInput(chatInput);
  $(window).resize();
  can.batch.stop();
}

function alignActionInput(chatInput) {
  let actionForm = chatInput.element.find("form.action");
  if (actionForm) {
    actionForm.find("[name=content]").css({
      "text-indent": actionForm.find("actor").width()
    });
  }
}

function updateActorDropdown(chatInput) {
  chatInput.element.find("[name=actor]").val(chatInput.scope.attr("actor").id);
}

/*
 * Cycle between input types
 */
const TAB = 9;
function keyPressed(chatInput, _el, event) {
  if (event.keyCode === TAB) {
    event.preventDefault();
    cycleInputType(chatInput, !event.shiftKey);
  }
}

function cycleInputType(chatInput, goForward) {
  let typeIndex = findIndex(inputs, {name: chatInput.scope.type});
  chatInput.scope.attr(
    "type",
    inputs[(typeIndex + (goForward ? 1 : inputs.length - 1)) %
           inputs.length].name);
  focusContent(chatInput);
}

function typeChanged(chatInput, scope) {
  let form = chatInput.element.find("form");
  chatInput.element.find("[name=type]").val(scope.type);
  chatInput.scope.attr("defaults", can.deparam(form.serialize()));
  forEach(chatInput.scope.defaults, function(v, k) {
    form.find("[name="+k+"]").val(v);
  });
  alignActionInput(chatInput);
  $(window).resize();
}

function typeSelectorChanged(chatInput, el) {
  chatInput.scope.attr("type", el.val());
}

/*
 * Special textareas
 */
const RET = 13;
function textAreaKeyPressed(chatInput, _el, event) {
  /*jshint validthis:true*/
  if (event.keyCode === RET && !event.shiftKey) {
    sendMessage.apply(this, arguments);
  }
}

function focusContent(chatInput) {
  chatInput.element.find("form [name=content]").focus();
}

function typingNotification(chatInput) {
  let user = chatInput.scope.attr("user");
  if (chatInput.element.find("form [name=content]").val().length) {
    user.attr("typing", true);
  } else {
    user.attr("typing", false);
  }
  user.save();
}

/*
 * Username management
 */
function updateScopeUser(chatInput) {
  if (conn.state() === "open") {
    can.batch.start();
    let user = chatInput.scope.attr("user");
    user.attr("name", chatInput.element.find("[name=user]").val());
    user.save();
    can.batch.stop();
  }
}

/*
 * Mustache helpers
 */
function renderInput(type, actor, opts) {
  let scope = opts.scope;
  function render(el) {
    $(el).html(find(inputs, {name: type()}).template(scope));
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

function isSelected(opts) {
  /*jshint validthis: true */
  if (this.attr("actor") === opts.context) {
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
