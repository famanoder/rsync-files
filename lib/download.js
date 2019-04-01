const Client = require('ssh2-sftp-client');
const {normalizePath} = require('./utils');
const sftp = new Client();

const remoteSource = '/home/others/test-ssh-upload';
sftp.connect({
  host: '118.24.182.253',
  port: '8992',
  username: 'root',
  password: '!Famanoder1'
}).then(() => {
  getRemoteList(sftp, remoteSource).then(res => {
    console.log(res)
  }).catch(e => console.log(e));
  // sftp.list(remoteSource)
  // .then(res => {
  //   console.log('res,',res);
  // })
  // .catch(e => {
  //   // console.log('e,',e);
  //   sftp.fastGet(remoteSource, 'a.lock', {encoding: 'utf-8'})
  //   .then(res => {

  //   })
  //   .catch(e => {
  //     console.log(e.message);
  //   });
  // });
}).then((data) => {
    console.log(data, 'the data info');
}).catch((err) => {
    console.log(err, 'catch error');
});


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
