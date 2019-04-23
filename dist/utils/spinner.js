"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ora = _interopRequireDefault(require("ora"));

var _log = require("./log");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinner = {
  _spinner: null,

  start(txt) {
    if (_log.verbose) this._spinner = (0, _ora.default)().start(txt);
  },

  step(txt) {
    if (this._spinner) this._spinner.text = txt;
  },

  clear() {
    if (this._spinner) this._spinner.clear();
  },

  stop() {
    if (this._spinner) this._spinner.clear().stop();
  },

  succeed(txt) {
    if (this._spinner) this._spinner.clear().succeed(txt);
  },

  fail(txt) {
    if (this._spinner) this._spinner.clear().fail(txt);
  }

};
var _default = spinner;
exports.default = _default;