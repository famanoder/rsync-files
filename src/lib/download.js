import Client from 'ssh2-sftp-client';
import {ensureDirSync} from 'fs-extra';
import {dirname} from 'path';
import {log, calcText, verbose, normalizePath, events as evts, spinner} from '../utils';

const {CMDS} = log;
const sftp = new Client();
const sftpClient = require('./sftp').default(sftp);

// downloadDir({
//   sftpOption: testSftpOption,
//   remoteSource, 
//   localTarget: 'localTarget'
// }).then(res => {
//   console.log(res);
// });
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

async function downloadFile({remoteSource, localTarget}) {
  spinner.start('making remote assetsMap.');
  await sftpClient.connect();
  
  spinner.step(`downloading ${remoteSource}`);
  const eq = await sftpClient.shallowDiff(localTarget, remoteSource);

  if(!eq) {
    await sftp.fastGet(remoteSource, localTarget, {
      step(got, size, all) {
        spinner.step(`${parseFloat(got/all*100).toFixed(2)}% downloading ${remoteSource}`);
      }
    });
    spinner.clear();
    downloadInfo(localTarget, remoteSource);
    spinner.succeed('one file downloaded.');
  }else{
    evts.emit('info', CMDS.DONE, `exists: ${localTarget}.`);
  }

  sftp.end();
  
  return {remoteSource, localTarget};
}
function downloadDir({remoteSource, localTarget}) {
  spinner.start('making remote assetsMap.');
  return sftpClient.connect()
  .then(() => {
    return getRemoteList(sftp, remoteSource)
    .then(res => {
      if(res && res.length) {
        ensureDirSync(localTarget);
        return downloadAll(remoteSource, localTarget, res);
      }
    });
  });
}

function downloadAll(remoteSource, localTarget, files) {
  if(files && files.length) {
    const filesProms = files.map((file, i) => {
      const localpath = normalizePath(localTarget, file.replace(remoteSource, ''));
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