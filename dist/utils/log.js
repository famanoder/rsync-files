"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
exports.verbose = exports.events = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const events = new _events.default();
exports.events = events;
const verbose = JSON.parse(process.env.VERBOSE || true);
exports.verbose = verbose;

const {
  name: libName
} = require('../../package.json');

function log() {
  console.log.apply(console, arguments);
}

log.warn = function (cmd, msg) {
  log(_chalk.default.yellow('[' + libName + '] ' + (cmd ? cmd + ': ' : '')) + msg);
};

log.error = function (cmd, msg = '...') {
  log(_chalk.default.gray('\n[' + libName + '] ') + (cmd ? _chalk.default.red(cmd + ': ') : '') + msg);
};

log.exit = function (cmd, msg) {
  log.error(cmd, msg) && process.exit(0);
};

log.info = function (cmd, msg = '...') {
  log(_chalk.default.cyanBright('[' + libName + '] ') + (cmd ? _chalk.default.greenBright(cmd + ': ') : '') + _chalk.default.white(msg));
};

log.CMDS = {
  INIT: 'init',
  SFTP: 'sftp',
  DONE: 'done',
  DOWNLOAD: 'download',
  WARN: 'warning',
  ERROR: 'error'
};
['info', 'warn', 'error', 'exit'].forEach(k => {
  events.on(k, function () {
    if (verbose) {
      log[k].apply(log, arguments);
    }
  });
});