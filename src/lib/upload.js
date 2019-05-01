import sftpUpload from './sftp-upload';
import {log, getAgrType, makeAssetsMap, events as evts} from '../utils';

const {CMDS} = log;

function sshUpload({
  target,
  source, 
  ignoreRegexp,
  success,
  fail
}) {

  makeAssetsMap(source, ignoreRegexp)
  .then(({assets, folders}) => {
    sftpUpload(target, assets, folders, success, fail);
  }).catch(e => evts.emit('error', CMDS.ERROR, e));
  
}

export default sshUpload;