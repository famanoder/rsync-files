import {statSync} from 'fs-extra';

export default sftp => {
  return {
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