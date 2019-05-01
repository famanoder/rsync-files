import {statSync} from 'fs-extra';
import {log, events as evts, findOptions} from '../utils';

const {CMDS} = log;

export default sftp => {
  return {
    async connect() {
      const option = findOptions();
      if(option && option.sftpOption) {
        await sftp.connect(option.sftpOption);
      }else{
        evts.emit('exit', CMDS.SFTP, `please ensure that 'syncOptions.sftpOption' in package.json or has a 'rsync.config.js' exported 'sftpOption'`);
      }
      
    },
    async shallowDiff(localFilepath, remoteFilepath) {
      let localStat;
      try{
        localStat = statSync(localFilepath);
      }catch(e){
        // sftp.end();
        return false;
      }

      const res = await sftp.stat(remoteFilepath);
      let eq;
      if(res) {
        const {size, modifyTime} = res;
        const {size: localSize, mtime} = localStat;
        eq = size === localSize && modifyTime === (new Date(mtime).getTime());
      }
      return eq;
    }
  }
}