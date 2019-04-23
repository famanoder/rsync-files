#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _package = _interopRequireDefault(require("../../package.json"));

var _download = require("../lib/download");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_commander.default.version(_package.default.version).usage('<command> [options]').option('-v, --version', 'latest version'); // download --source --target


_commander.default.command('download').alias('d').option('-s, --source <s>', 'source file or directory.').option('-d, --dest <d>', 'target file or directory.').option('-t, --type <t>', 'file or directory.').description('download files from remote server to local.').action(
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* ({
    source,
    dest,
    type
  }) {
    switch (type) {
      case 'file':
        (0, _download.downloadDir)({
          remoteSource: '/home/others/test-ssh-upload/dist/utils',
          localDir: 'a'
        }).catch(e => {
          _utils.spinner.stop();

          _utils.events.emit('exit', _utils.log.CMDS.ERROR, e.message);
        });
        break;
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

_commander.default.parse(process.argv);

if (_commander.default.args.length < 1) _commander.default.help();