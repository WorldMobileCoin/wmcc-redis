'use strict';

const Util = require('util');

const errnos = {};

exports.ERRORS = {
  UNKNOWN_ERROR: [-2600, 'Unknown error'],
  SEND_COMMAND_ERROR: [-2610, 'Send command error, command: %s, key: %s, error: %s'],
};

exports.ERRNO = {};
exports.ERROR = {};

exports.get = function(errno) {
  return errnos[errno];
}

exports.format = function(errno, ...ext) {
  return Util.format(errnos[errno], ...ext);
}

function _init() {
  for(let [name, error] of Object.entries(exports.ERRORS)) {
    exports.ERRNO[name] = error[0];
    exports.ERROR[name] = error[1];
    errnos[error[0]] = error[1];
  }
};

_init();