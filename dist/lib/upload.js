"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sftpUpload = _interopRequireDefault(require("./sftp-upload"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sshUpload({
  sftpOption: s,
  source,
  ignoreRegexp,
  success,
  fail
}) {
  if ((0, _utils.getAgrType)(s) !== 'object') {
    _utils.log.exit('sftpOption must be provided !');
  }

  let {
    username,
    password,
    target,
    host,
    port = 22
  } = s;

  if ([username, password, target, host].some(k => !k)) {
    _utils.log.exit('some sftpOption must be provided !');
  }

  (0, _utils.makeAssetsMap)(source, ignoreRegexp).then(({
    assets,
    folders
  }) => {
    (0, _sftpUpload.default)({
      host,
      port,
      username,
      password,
      target
    }, assets, folders, success, fail);
  }).catch(e => _utils.log.error(e));
}

var _default = sshUpload;
exports.default = _default;