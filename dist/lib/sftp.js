"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fsExtra = require("fs-extra");

var _utils = require("../utils");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const {
  CMDS
} = _utils.log;

var _default = sftp => {
  return {
    connect() {
      return _asyncToGenerator(function* () {
        const option = (0, _utils.findOptions)();

        if (option && option.sftpOption) {
          yield sftp.connect(option.sftpOption);
        } else {
          _utils.events.emit('exit', CMDS.SFTP, `please ensure that 'syncOptions.sftpOption' in package.json or has a 'rsync.config.js' exported 'sftpOption'`);
        }
      })();
    },

    shallowDiff(localFilepath, remoteFilepath) {
      return _asyncToGenerator(function* () {
        let localStat;

        try {
          localStat = (0, _fsExtra.statSync)(localFilepath);
        } catch (e) {
          // sftp.end();
          return false;
        }

        const res = yield sftp.stat(remoteFilepath);
        let eq;

        if (res) {
          const {
            size,
            modifyTime
          } = res;
          const {
            size: localSize,
            mtime
          } = localStat;
          eq = size === localSize && modifyTime === new Date(mtime).getTime();
        }

        return eq;
      })();
    }

  };
};

exports.default = _default;