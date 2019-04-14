"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toRegExp = toRegExp;
exports.findOptions = findOptions;
exports.getAgrType = getAgrType;
exports.normalizePath = normalizePath;
exports.parseOptionUri = parseOptionUri;
Object.defineProperty(exports, "log", {
  enumerable: true,
  get: function () {
    return _log.log;
  }
});
Object.defineProperty(exports, "events", {
  enumerable: true,
  get: function () {
    return _log.events;
  }
});
Object.defineProperty(exports, "verbose", {
  enumerable: true,
  get: function () {
    return _log.verbose;
  }
});
Object.defineProperty(exports, "makeAssetsMap", {
  enumerable: true,
  get: function () {
    return _makeAssetsMap.default;
  }
});

var _fs = _interopRequireDefault(require("fs"));

var _url = _interopRequireDefault(require("url"));

var _path = _interopRequireDefault(require("path"));

var _log = require("./log");

var _makeAssetsMap = _interopRequireDefault(require("./makeAssetsMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  syncOptions
} = require('../../package.json');

const likeLinux = process.env.TERM === 'cygwin' || process.platform !== 'win32';

function getAgrType(agr) {
  return Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
}

function toRegExp(str) {
  str = getAgrType(str) === 'string' ? str : JSON.stringify(str);
  return str === '*' ? /.+/gi : new RegExp(str.replace(/[\$\?\.\/\-\*\\]/g, '\\$&'), 'gi');
}

function parseOptionUri(uri) {
  // user:pass@host:port/target
  const {
    protocol: u,
    auth: a,
    port = 22,
    hostname: h,
    pathname: n
  } = _url.default.parse(uri);

  if ([u, a, h, n].every(v => !!v)) {
    return {
      host: h,
      port,
      username: u.slice(0, -1),
      password: a,
      target: n
    };
  }

  _log.log.exit('invalid params of remote uri[-r --remote uri].');
}

function normalizePath(target, locpath = '') {
  return _path.default.join(target, locpath).replace(/\\/g, "/");
}

function findOptions() {
  if (syncOptions) return syncOptions.sftpOption;

  const confFile = _path.default.join(process.cwd(), 'rsync.config.js');

  if (_fs.default.existsSync(confFile)) {
    return require(confFile).sftpOption;
  }
}