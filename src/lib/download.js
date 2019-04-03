import Client from 'ssh2-sftp-client';
import {ensureDirSync} from 'fs-extra';
import {dirname} from 'path';
import {normalizePath, events as evts, c} from './utils';

const sftp = new Client();
const sftpClient = require('./sftp').default(sftp);

const remoteSource = '/home/others/test-ssh-upload/yarn.lock';
const testSftpOption = {
  host: '118.24.182.253',
  port: '8992',
  username: 'root',
  password: '!Famanoder0',
  compress: true
}

downloadFile({
  sftpOption: testSftpOption,
  remoteFilepath: remoteSource,
  localFilepath: 'abc'
}).then(() => {
  console.log('ok')
}).catch(e => evts.emit('exit', e.message));
// downloadDir({
//   sftpOption: testSftpOption,
//   remoteSource, 
//   localDir: 'localDir'
// }).then(res => {
//   console.log(res);
// });
function connectSftp(sftpOption) {
  return sftp.connect(sftpOption);
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
  evts.emit('info', `download: ${c.whiteBright(remotepath)} ${c.gray('->')} ${c.whiteBright(localpath)}`);
}

function downloadFile({sftpOption = {}, remoteFilepath, localFilepath}) {
  return connectSftp(sftpOption)
  .then(() => {
    return sftpClient.shallowDiff(localFilepath, remoteFilepath)
          .then(eq => {
            const resEnd = () => {
              sftp.end();
              return Promise.resolve({remoteFilepath, localFilepath});
            }
            if(!eq) {
              return sftp.fastGet(remoteFilepath, localFilepath, {encoding: 'utf-8'}).then(() => {
                downloadInfo(localFilepath, remoteFilepath);
                return resEnd();
              });
            }else{
              evts.emit('info', `exists: ${localFilepath}.`);
              return resEnd();
            }
          });
  });
}
function downloadDir({sftpOption = {}, remoteSource, localDir}) {
  return connectSftp(sftpOption)
  .then(() => {
    return getRemoteList(sftp, remoteSource)
    .then(res => {
      if(res && res.length) {
        ensureDirSync(localDir);
        return downloadAll(remoteSource, localDir, res);
      }
    }).catch(e => console.log(e));
  })
  .catch(e => console.log(e))
}

function downloadAll(remoteSource, localDir, files) {
  if(files && files.length) {
    const filesProms = files.map(file => {
      const localpath = normalizePath(localDir, file.replace(remoteSource, ''));
      const dir = dirname(localpath);
      ensureDirSync(dir);
      return sftp.fastGet(file, localpath).then(() => {
        downloadInfo(localpath, file);
        return Promise.resolve({file, localpath});
      });
    });
    return Promise.all(filesProms).then(res => {
      sftp.end();
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
        console.log(e);
        rj(e);
      });
    }
    _getRemoteList(sftp, rDir);
  });
}

export default {
  downloadDir,
  downloadFile
}