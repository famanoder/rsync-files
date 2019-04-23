"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ssh2SftpClient = _interopRequireDefault(require("ssh2-sftp-client"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('events').EventEmitter.defaultMaxListeners = 0;
const {
  CMDS
} = _utils.log;

function sshUpload(sshOptions, assetsMap, folders = [], success, fail) {
  const sftp = new _ssh2SftpClient.default();
  const {
    username,
    password,
    target,
    host,
    port
  } = sshOptions;
  sftp.connect({
    host,
    port,
    username,
    password
  }).then(() => {
    _utils.events.emit('info', CMDS.SFTP, `connect to ${username}@${host} successful !`);

    folders.unshift('');

    if (folders.length) {
      _utils.events.emit('info', CMDS.SFTP, `init remote directories[${folders.slice(1)}]`);

      const folderPromises = folders.map(folder => {
        return new Promise((rs, rj) => {
          const rfolder = (0, _utils.normalizePath)(target, folder);
          sftp.mkdir(rfolder).then(_ => rs(), _ => rs());
        });
      });
      Promise.all(folderPromises).then(res => {
        _utils.spinner.start();

        const uploadeds = [];
        const promises = assetsMap.map(item => {
          return new Promise((rs, rj) => {
            _utils.spinner.step(`uploading ${item.locPath}`);

            sftp.fastPut(item.locPath, (0, _utils.normalizePath)(target, item.locPath), {
              encoding: 'utf8'
            }).then(() => {
              const uploaded = (0, _utils.normalizePath)(item.locPath);
              uploadeds.push(uploaded);
              rs(uploaded);
            }).catch(err => rj(err));
          });
        });
        return Promise.all(promises).then(res => {
          if (uploadeds.length && _utils.verbose) {
            _utils.spinner.clear();

            uploadeds.forEach(item => {
              _utils.log.info(CMDS.DONE, 'uploaded: ' + item);
            });

            _utils.spinner.succeed(`all ${uploadeds.length} files uploaded.`);
          }

          success && success(res);
          sftp.end();
        }).catch(_ => {
          _utils.spinner.fail('upload failed.');

          _utils.log.error(_.message);

          fail && fail(_);
          sftp.end();
        });
      });
    }
  });
}

var _default = sshUpload;
exports.default = _default;