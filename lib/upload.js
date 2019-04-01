const sftpUpload = require('./sftp-upload');
const {log, getAgrType, makeAssetsMap} = require('./utils');

function sshUpload({
  sftpOption: s,
  source, 
  ignoreRegexp,
  success,
  fail
}) {
  
  if(getAgrType(s) !== 'object') {
    log.error('sftpOption must be provided !', 'exit');
  }

  let {
    username, 
    password, 
    target, 
    ip,
    port = 22
  } = s;

  if([username, password, target, ip].some(k => !k)) {
    log.error('some sftpOption must be provided !', 'exit');
  }

  makeAssetsMap(source, ignoreRegexp)
  .then(({assets, folders}) => {
    sftpUpload({
      ip,
      port,
      username,
      password,
      target
    }, assets, folders, success, fail);
  }).catch(e => log.error(e));
  
}
// const sshUpload = require('@nutui/client-upload');

sshUpload({
  source: ['lib', 'yarn.lock'],
  ignoreRegexp: /node_modules/,
  success: function() {
    console.log('all uploaded......');
  },
  sftpOption: {
    ip: '118.24.182.253',
    port: 8992,
    username: 'root',
    password: '!Famanoder1',
    target: '/home/others/test-ssh-upload'
  }
});

module.exports = sshUpload;
module.exports.sftpUpload = sftpUpload;