const Client = require('ssh2-sftp-client');
const {ensureDirSync} = require('fs-extra');
const {dirname} = require('path');
const {normalizePath} = require('./utils');

const sftp = new Client();

// const remoteSource = '/home/others/test-ssh-upload/lib/';
// const testSftpOption = {
//   host: '118.24.182.253',
//   port: '8992',
//   username: 'root',
//   password: '!Famanoder1'
// }
// downloadFile(remoteSource, 'abc');
// downloadDir({
//   sftpOption: testSftpOption,
//   remoteSource, 
//   localDir: 'localDir'
// }).then(res => {
//   console.log(res);
// });
// function connectSftp(sftpOption) {
//   return sftp.connect(sftpOption);
// }

function downloadFile({sftpOption = {}, remoteFilepath, localFilepath}) {
  return connectSftp(sftpOption)
  .then(() => {
    return sftp.fastGet(remoteFilepath, localFilepath, {encoding: 'utf-8'}).then(() => {
      console.log(`download: ${remoteFilepath} -> ${localFilepath}`);
      sftp.end();
      return Promise.resolve({remoteFilepath, localFilepath});
    });
  })
  .catch(e => console.log(e));
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
        console.log(`download: ${file} -> ${localpath}`);
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


module.exports = {
  downloadDir,
  downloadFile
}