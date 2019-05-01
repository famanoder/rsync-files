#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _package = _interopRequireDefault(require("../../package.json"));

var download = _interopRequireWildcard(require("../lib/download"));

var _upload = _interopRequireDefault(require("../lib/upload"));

var _utils = require("../utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.version(_package.default.version).usage('<command> [options]').option('-v, --version', 'latest version').option('-s, --source <s>', 'source file or directory.').option('-d, --dest <d>', 'target file or directory.').option('-t, --type <t>', 'file or directory.');

_commander.default.command('upload').alias('u').description('upload files from local to remote server.').action(uploadAction);

_commander.default.command('download').alias('d').description('download files from remote server to local.').action(downloadAction);

_commander.default.parse(process.argv);

if (_commander.default.args.length < 1) _commander.default.help();

function getParams() {
  const {
    source,
    dest,
    type = 'file'
  } = _commander.default;
  const option = (0, _utils.findOptions)();
  let _source = source;
  let _dest = dest;

  if (!source) {
    if (option && option.source) {
      _source = option.source;
    }
  }

  if (!dest) {
    if (option && option.target) {
      _dest = option.target;
    }
  }

  return {
    source: _source,
    target: _dest
  };
}

function uploadAction() {
  const {
    source,
    target
  } = getParams();
  (0, _upload.default)({
    source,
    target
  });
}

function downloadAction() {
  const {
    source,
    target
  } = getParams();
  download[type === 'file' ? 'downloadFile' : 'downloadDir']({
    remoteSource: source,
    localTarget: target
  }).catch(e => {
    _utils.spinner.stop();

    _utils.events.emit('exit', _utils.log.CMDS.ERROR, e.message);
  });
}