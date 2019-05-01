"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sftpUpload = _interopRequireDefault(require("./sftp-upload"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  CMDS
} = _utils.log;

function sshUpload({
  target,
  source,
  ignoreRegexp,
  success,
  fail
}) {
  (0, _utils.makeAssetsMap)(source, ignoreRegexp).then(({
    assets,
    folders
  }) => {
    (0, _sftpUpload.default)(target, assets, folders, success, fail);
  }).catch(e => _utils.events.emit('error', CMDS.ERROR, e));
}

var _default = sshUpload;
exports.default = _default;