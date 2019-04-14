import glob from 'glob';
import fs from 'fs';
import {getAgrType} from './';
import {log, events} from './log';

function makeDirMap(dir, ignoreRegexp) {
  if(!dir || !dir.replace(/^\//, '').length) log.exit('invalid params of directory name');

  const _assetsMap = {
    assets: [], 
    folders: []
  }

  try{
    events.emit('info', log.CMDS.INIT, `making '${dir}' assets map.`);
    
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

export default makeAssetsMap;