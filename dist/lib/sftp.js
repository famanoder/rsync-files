"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fsExtra = require("fs-extra");

var _utils = require("./utils");

var _default = sftp => {
  return {
    shallowDiff(localFilepath, remoteFilepath) {
      let localStat;

      try {
        localStat = (0, _fsExtra.statSync)(localFilepath);
      } catch (e) {
        return Promise.resolve(false);
      }

      return sftp.stat(remoteFilepath).then(res => {
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

        return Promise.resolve(eq);
      });
    }

  };
};

exports.default = _default;