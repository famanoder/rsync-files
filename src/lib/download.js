import Client from 'ssh2-sftp-client';
import {ensureDirSync} from 'fs-extra';
import {dirname} from 'path';
import {log, calcText, verbose, normalizePath, events as evts, findOptions, spinner} from '../utils';

const {CMDS} = log;
const sftp = new Client();
const sftpClient = require('./sftp').default(sftp);

// downloadDir({
//   sftpOption: testSftpOption,
//   remoteSource, 
//   localDir: 'localDir'
// }).then(res => {
//   console.log(res);
// });
async function connectSftp() {
  const sftpOption = findOptions();
  if(sftpOption) {
    await sftp.connect(sftpOption);
  }else{
    evts.emit('exit', CMDS.SFTP, `please ensure that 'syncOptions.sftpOption' in package.json or has a 'rsync.config.js' exported 'sftpOption'`);
  }
  
}
// sftp.connect(testSftpOption).then(res => {
//   sftpClient.shallowDiff('abc', remoteSource)
//   .then(res => console.log(res))
//   .catch( _ => evts.emit('exit', _.message));
//   // sftp.stat(remoteSource).then(res => {
//   //   console.log(res)
//   // }).catch(e=>console.log(e.message));
// });

function downloadInfo(localpath, remotepath) {
  evts.emit('info', CMDS.DOWNLOAD, `${calcText(remotepath)} to ${calcText(localpath)}`);
}

async function downloadFile({remoteFilepath, localFilepath}) {
  spinner.start('making remote assetsMap.');
  await connectSftp();
  
  spinner.step(`downloading ${remoteFilepath}`);
  const eq = await sftpClient.shallowDiff(localFilepath, remoteFilepath);

  if(!eq) {
    await sftp.fastGet(remoteFilepath, localFilepath, {
      step(got, size, all) {
        spinner.step(`${parseFloat(got/all*100).toFixed(2)}% downloading ${remoteFilepath}`);
      }
    });
    spinner.clear();
    downloadInfo(localFilepath, remoteFilepath);
    spinner.succeed('one file downloaded.');
  }else{
    evts.emit('info', CMDS.DONE, `exists: ${localFilepath}.`);
  }

  sftp.end();
  
  return {remoteFilepath, localFilepath};
}
function downloadDir({remoteSource, localDir}) {
  spinner.start('making remote assetsMap.');
  return connectSftp()
  .then(() => {
    return getRemoteList(sftp, remoteSource)
    .then(res => {
      if(res && res.length) {
        ensureDirSync(localDir);
        return downloadAll(remoteSource, localDir, res);
      }
    });
  });
}

function downloadAll(remoteSource, localDir, files) {
  if(files && files.length) {
    const filesProms = files.map((file, i) => {
      const localpath = normalizePath(localDir, file.replace(remoteSource, ''));
      const dir = dirname(localpath);

      if(i == 0) spinner.step(`downloading ${file}`);
      ensureDirSync(dir);
      return sftp.fastGet(file, localpath, {
        step(got, size, all) {
          spinner.step(`${parseFloat(got/all*100)}% downloading ${file}`);
        }
      }).then(() => {
        spinner.clear();
        downloadInfo(localpath, file);
        return Promise.resolve({file, localpath});
      });
    });
    return Promise.all(filesProms).then(res => {
      sftp.end();
      spinner.succeed(`all ${files.length} files downloaded.`);
      return Promise.resolve(res);
    });
  }
}

function getRemoteList(sftp, rDir) {
  return new Promise((rs, rj) => {
    const remoteFileList = [];
    function _getRemoteList(sftp, dir) {
      sftp.list(dir)
      .then(res => {
        if(res.length) {
          const hasMore = res.filter(item => item.type === 'd').length;
          if(hasMore) {
            res.forEach(({name, type}) => {
              if(type === 'd') {
                _getRemoteList(sftp, normalizePath(dir, name));
              }else if(type === '-') {
                remoteFileList.push(normalizePath(dir, name));
              }
            });
          }else{
            res.forEach(({name}) => remoteFileList.push(normalizePath(dir, name)));
            rs(remoteFileList);
          }
        }
      })
      .catch(e => {
        rj(e);
      });
    }
    _getRemoteList(sftp, rDir);
  });
}

export {
  downloadDir,
  downloadFile
}