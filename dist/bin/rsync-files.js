#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _package = _interopRequireDefault(require("../../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {downloadDir, downloadFile} from '../lib/download';
_commander.default.version(_package.default.version).usage('<command> [options]').option('-v, --version', 'latest version'); // download --source --target


_commander.default.command('download').alias('d').option('-s, --source <s>', 'source file or directory.').option('-d, --dest <d>', 'target file or directory.').option('-t, --type <t>', 'file or directory.').description('download files from remote server to local.').action(function ({
  source,
  dest,
  type
}) {
  console.log(source, dest);
});

_commander.default.parse(process.argv);

if (_commander.default.args.length < 1) _commander.default.help();