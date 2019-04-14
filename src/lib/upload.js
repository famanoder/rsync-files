import sftpUpload from './sftp-upload';
import {log, getAgrType, makeAssetsMap} from '../utils';

function sshUpload({
  sftpOption: s,
  source, 
  ignoreRegexp,
  success,
  fail
}) {
  
  if(getAgrType(s) !== 'object') {
    log.exit('sftpOption must be provided !');
  }

  let {
    username, 
    password, 
    target, 
    host,
    port = 22
  } = s;

  if([username, password, target, host].some(k => !k)) {
    log.exit('some sftpOption must be provided !');
  }

  makeAssetsMap(source, ignoreRegexp)
  .then(({assets, folders}) => {
    sftpUpload({
      host,
      port,
      username,
      password,
      target
    }, assets, folders, success, fail);
  }).catch(e => log.error(e));
  
}

export default sshUpload;