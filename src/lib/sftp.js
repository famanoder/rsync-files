import {statSync} from 'fs-extra';
import {events as evts} from './utils';

export default sftp => {
  return {
    shallowDiff(localFilepath, remoteFilepath) {
      let localStat;
      try{
        localStat = statSync(localFilepath);
      }catch(e){
        return Promise.resolve(false);
      }

      return sftp.stat(remoteFilepath).then(res => {
        let eq;
        if(res) {
          const {size, modifyTime} = res;
          const {size: localSize, mtime} = localStat;
          eq = size === localSize && modifyTime === (new Date(mtime).getTime());
        }
        return Promise.resolve(eq);
      });
    }
  }
}