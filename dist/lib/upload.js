"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sftpUpload = _interopRequireDefault(require("./sftp-upload"));

var _utils = require("./utils");

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
    ip,
    port = 22
  } = s;

  if ([username, password, target, ip].some(k => !k)) {
    _utils.log.exit('some sftpOption must be provided !');
  }

  (0, _utils.makeAssetsMap)(source, ignoreRegexp).then(({
    assets,
    folders
  }) => {
    (0, _sftpUpload.default)({
      ip,
      port,
      username,
      password,
      target
    }, assets, folders, success, fail);
  }).catch(e => _utils.log.error(e));
} // const sshUpload = require('@nutui/client-upload');


sshUpload({
  source: ['lib', 'yarn.lock'],
  ignoreRegexp: /node_modules/,
  success: function () {
    console.log('all uploaded......');
  },
  sftpOption: {
    ip: '118.24.182.253',
    port: 8992,
    username: 'root',
    password: '!Famanoder1',
    target: '/home/others/test-ssh-upload'
  }
});
var _default = sshUpload;
exports.default = _default;