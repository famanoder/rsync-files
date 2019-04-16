import fs from 'fs';
import url from 'url';
import path from 'path';
import {log, events, verbose} from './log';
import makeAssetsMap from './makeAssetsMap';

const {syncOptions} = require('../../package.json');
const likeLinux =  process.env.TERM === 'cygwin' || process.platform !== 'win32';

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
  log.exit('invalid params of remote uri[-r --remote uri].');
}

function normalizePath(target, locpath = '') {
	return path.join(target, locpath).replace(/\\/g, "/");
}

function findOptions() {
  if(syncOptions) return syncOptions.sftpOption;
  const confFile = path.join(process.cwd(), 'rsync.config.js');
  if(fs.existsSync(confFile)) {
    return require(confFile).sftpOption;
  }
}

function calcText(str) {
  if(str.length > 40) {
      return str.slice(0, 20) + '...' + (str.match(/([\/\\][^\/\\]+)$/) || ['', ''])[1];
  }
  return str;
}

export {
  log,
  events,
  verbose,
  toRegExp,
  calcText,
  findOptions,
  getAgrType,
  normalizePath,
  makeAssetsMap,
  parseOptionUri
};