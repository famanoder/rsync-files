"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ssh2SftpClient = _interopRequireDefault(require("ssh2-sftp-client"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('events').EventEmitter.defaultMaxListeners = 0;

function sshUpload(sshOptions, assetsMap, folders = [], success, fail) {
  const sftp = new _ssh2SftpClient.default();
  const {
    username,
    password,
    target,
    ip,
    port
  } = sshOptions;

  _utils.log.info(_utils.c.green('ready to connect to sftp.\n'));

  sftp.connect({
    host: ip,
    port,
    username,
    password
  }).then(() => {
    _utils.log.info(_utils.c.green(`connected to ${username}@${ip} successful !`));

    folders.unshift('');

    if (folders.length) {
      _utils.log.info(_utils.c.green('\ninit remote directories ...\n'));

      const folderPromises = folders.map(folder => {
        return new Promise((rs, rj) => {
          const rfolder = (0, _utils.normalizePath)(target, folder);
          sftp.mkdir(rfolder).then(_ => rs(), _ => rs());
        });
      });
      Promise.all(folderPromises).then(res => {
        const promises = assetsMap.map(item => {
          return new Promise((rs, rj) => {
            // sftp.put(item.assetSource, normalizePath(target, item.locPath), {encoding: 'utf8'})
            sftp.fastPut(item.locPath, (0, _utils.normalizePath)(target, item.locPath), {
              encoding: 'utf8'
            }).then(() => {
              const uploaded = (0, _utils.normalizePath)(item.locPath);
              console.log('uploaded ', uploaded);
              rs(uploaded);
            }).catch(err => rj(err));
          });
        });
        return Promise.all(promises).then(res => {
          _utils.log.info(`all ${assetsMap.length} files uploaded.`);

          success && success(res);
          sftp.end();
        }).catch(_ => {
          _utils.log.info(_);

          fail && fail(_);
          sftp.end();
        });
      });
    }
  });
}

var _default = sshUpload;
exports.default = _default;