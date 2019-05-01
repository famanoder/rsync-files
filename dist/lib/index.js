"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _upload = _interopRequireDefault(require("./upload"));

var _download = _interopRequireDefault(require("./download"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rsyncFiles = {
  download: _download.default,
  upload: _upload.default
};
var _default = rsyncFiles;
exports.default = _default;