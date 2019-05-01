"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _glob = _interopRequireDefault(require("glob"));

var _fs = _interopRequireDefault(require("fs"));

var _ = require("./");

var _log = require("./log");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeDirMap(dir, ignoreRegexp) {
  if (!dir || !dir.replace(/^\//, '').length) _log.log.exit('invalid params of directory name');
  const _assetsMap = {
    assets: [],
    folders: []
  };

  try {
    const folders = [];

    const assetsMap = _glob.default.sync(`${dir}/**`, {
      dot: true
    }).filter(file => {
      let test = true;
      if ((0, _.getAgrType)(ignoreRegexp) === 'regexp') test = !ignoreRegexp.test(file);

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
      if ((0, _.getAgrType)(source) === 'array' && source.length) {
        // 支持数组的方式传入多个目录和文件
        source.forEach(item => {
          if ((0, _.getAgrType)(item) === 'string') {
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
        } else {
          rj(`${source} is not exists.`);
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

var _default = makeAssetsMap;
exports.default = _default;