const glob = require('glob');
const c = require('chalk');
const fs = require('fs');
const url = require('url');

const libName = require('../package.json').name;

function log() {
  console.log.apply(console, arguments);
}

log.error = function(msg, exit) {
  log(c.gray('\n['+libName+']: ') + c.red(msg));
  exit && process.exit(0);
}

log.info = function(msg) {
  log(c.greenBright(msg));
}

function makeDirMap(dir, ignoreRegexp) {
  if(!dir || !dir.replace(/^\//, '').length) log.error('invalid params of directory name', 'exit');

  const _assetsMap = {
    assets: [], 
    folders: []
  }

  try{
    log.info(`making '${dir}' assets map...\n`);
    
    const folders = [];
    const assetsMap = glob.sync(`${dir}/**`, {
      dot: true
    }).filter(file => {
      let test = true;
      if(getAgrType(ignoreRegexp) === 'regexp') test = !ignoreRegexp.test(file);
      const stat = fs.statSync(file);
      if(test && stat.isDirectory()) {
        folders.push(file);
      }
      return test && stat.isFile();
    }).map(file => {
      return {
        locPath: file.replace(/\\/g, '/'),
        // assetSource: fs.readFileSync(file)
      }
    });
    _assetsMap.assets = assetsMap;
    _assetsMap.folders = folders;
  }catch(e) {
    console.log(e);
  }

  return _assetsMap;
}

function makeAssetsMap(source, ignoreRegexp) {
  
  return new Promise((rs, rj) => {
    const assetsMap = {
      assets: [], 
      folders: []
    }
    
    function _makeAssetsMap(source, ignoreRegexp) {
      
      if(getAgrType(source) === 'array' && source.length) {
        // 支持数组的方式传入多个目录和文件
        source.forEach(item => {
          if(getAgrType(item) === 'string') {
            _makeAssetsMap(item, ignoreRegexp);
          }
        });
      }else{
        const hasFile = fs.existsSync(source);
        if(hasFile) {
          const stat = fs.statSync(source);
          if(stat.isFile()) {
            assetsMap.assets.push({
              locPath: source.replace(/\\/g, '/'),
              // assetSource: fs.readFileSync(source)
            });
          }
          if(stat.isDirectory()) {
            const {assets, folders} = makeDirMap(source, ignoreRegexp);
            assetsMap.assets = assetsMap.assets.concat(assets);
            assetsMap.folders = assetsMap.folders.concat(folders);
          }
        }
      }
    
    }
    try{
      _makeAssetsMap(source, ignoreRegexp);
      rs(assetsMap);
    }catch(e) {
      rj(e);
    }
  });
}

function getAgrType(agr) {
  return Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
}
 
function toRegExp(str){
	str = getAgrType(str) === 'string'? str: JSON.stringify(str);
	return str === '*'? (/.+/gi): new RegExp(str.replace(/[\$\?\.\/\-\*\\]/g, '\\$&'), 'gi');
}

function parseOptionUri(uri) {
  // user:pass@host:port/target
  const {protocol: u, auth: a, port = 22, hostname: h, pathname: n} = url.parse(uri);
  if([u, a, h, n].every(v => !!v)) {
    return {
      host: h,
      port,
      username: u.slice(0, -1),
      password: a,
      target: n
    }
  }
  log.error('invalid params of remote uri[-r --remote uri].', 'exit');
}

const utils = {
  c,
  log,
  toRegExp,
  getAgrType,
  makeAssetsMap,
  parseOptionUri
}
module.exports = utils;