"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
exports.toRegExp = toRegExp;
exports.getAgrType = getAgrType;
exports.normalizePath = normalizePath;
exports.makeAssetsMap = makeAssetsMap;
exports.parseOptionUri = parseOptionUri;
Object.defineProperty(exports, "c", {
  enumerable: true,
  get: function () {
    return _chalk.default;
  }
});
exports.events = void 0;

var _glob = _interopRequireDefault(require("glob"));

var _chalk = _interopRequireDefault(require("chalk"));

var _fs = _interopRequireDefault(require("fs"));

var _url = _interopRequireDefault(require("url"));

var _path = _interopRequireDefault(require("path"));

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const verbose = process.env.VERBOSE;
const events = new _events.default();
exports.events = events;

const libName = require('../../package.json').name;

function log() {
  console.log.apply(console, arguments);
}

log.error = function (msg) {
  log(_chalk.default.gray('\n[' + libName + ']: ') + _chalk.default.red(msg));
};

log.exit = function (msg) {
  log.error(msg) && process.exit(0);
};

log.info = function (msg) {
  log(_chalk.default.yellow('[' + libName + ']: ') + _chalk.default.greenBright(msg));
};

function makeDirMap(dir, ignoreRegexp) {
  if (!dir || !dir.replace(/^\//, '').length) log.exit('invalid params of directory name');
  const _assetsMap = {
    assets: [],
    folders: []
  };

  try {
    log.info(`making '${dir}' assets map...`);
    const folders = [];

    const assetsMap = _glob.default.sync(`${dir}/**`, {
      dot: true
    }).filter(file => {
      let test = true;
      if (getAgrType(ignoreRegexp) === 'regexp') test = !ignoreRegexp.test(file);

      const stat = _fs.default.statSync(file);

      if (test && stat.isDirectory()) {
        folders.push(file);
      }

      return test && stat.isFile();
    }).map(file => {
      return {
        locPath: file.replace(/\\/g, '/') // assetSource: fs.readFileSync(file)

      };
    });

    _assetsMap.assets = assetsMap;
    _assetsMap.folders = folders;
  } catch (e) {
    console.log(e);
  }

  return _assetsMap;
}

function makeAssetsMap(source, ignoreRegexp) {
  return new Promise((rs, rj) => {
    const assetsMap = {
      assets: [],
      folders: []
    };

    function _makeAssetsMap(source, ignoreRegexp) {
      if (getAgrType(source) === 'array' && source.length) {
        // 支持数组的方式传入多个目录和文件
        source.forEach(item => {
          if (getAgrType(item) === 'string') {
            _makeAssetsMap(item, ignoreRegexp);
          }
        });
      } else {
        const hasFile = _fs.default.existsSync(source);

        if (hasFile) {
          const stat = _fs.default.statSync(source);

          if (stat.isFile()) {
            assetsMap.assets.push({
              locPath: source.replace(/\\/g, '/') // assetSource: fs.readFileSync(source)

            });
          }

          if (stat.isDirectory()) {
            const {
              assets,
              folders
            } = makeDirMap(source, ignoreRegexp);
            assetsMap.assets = assetsMap.assets.concat(assets);
            assetsMap.folders = assetsMap.folders.concat(folders);
          }
        }
      }
    }

    try {
      _makeAssetsMap(source, ignoreRegexp);

      rs(assetsMap);
    } catch (e) {
      rj(e);
    }
  });
}

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

  log.exit('invalid params of remote uri[-r --remote uri].');
}

function normalizePath(target, locpath = '') {
  return _path.default.join(target, locpath).replace(/\\/g, "/");
}

['info', 'error', 'exit'].forEach(k => {
  events.on(k, msg => {
    if (verbose) {
      log[k](msg);
    }
  });
});